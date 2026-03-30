"use client";

import { useTranslations } from "next-intl";
import {
  Shield,
  Phone,
  Mail,
  FileCheck,
  CheckCircle2,
  Clock,
  UploadCloud,
  ArrowRight,
  AlertCircle,
  Camera,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";

import DynamicButton from "@/components/shared/Buttons/DynamicButton";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  confirmEmailVerification,
  confirmPhoneVerification,
  startEmailVerification,
  startPhoneVerification,
} from "@/services/userService";
import {
  getSellerOwnDocuments,
  uploadSellerDocuments,
  reuploadSellerDocuments,
} from "@/services/sellerService";
import { uploadImage } from "@/lib/uploadService";
import Image from "next/image";
import { useCallback, useEffect } from "react";

interface VerificationCenterProps {
  initialData?: any;
  token?: string;
}

export const VerificationCenter = ({
  initialData,
  token,
}: VerificationCenterProps) => {
  const t = useTranslations("seller_profile.verification");
  const locale = useAppLocale();
  const [loading, setLoading] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");

  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [docStatus, setDocStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const fetchDocsStatus = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getSellerOwnDocuments(token);
      const docs = res?.data || res;
      if (docs && docs.status) {
        setDocStatus(docs.status); // approved, pending, rejected
        setRejectionReason(docs.rejectionReason || null);
        if (docs.idFront) setFrontPreview(docs.idFront);
        if (docs.idBack) setBackPreview(docs.idBack);
      } else {
        setDocStatus("none");
        setRejectionReason(null);
      }
    } catch (err: any) {
      setDocStatus("none");
    }
  }, [token]);

  useEffect(() => {
    fetchDocsStatus();
  }, [fetchDocsStatus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (file) {
      if (side === "front") {
        setFrontFile(file);
        setFrontPreview(URL.createObjectURL(file));
      } else {
        setBackFile(file);
        setBackPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleIdSubmit = async () => {
    if (!token || !frontFile || !backFile) return;
    try {
      setLoading("id_submit");
      // 1. Upload both to S3
      const [frontUrl, backUrl] = await Promise.all([
        uploadImage(frontFile, "seller-docs", token),
        uploadImage(backFile, "seller-docs", token),
      ]);

      // 2. Submit to seller-documents (POST for new, PUT for re-upload)
      if (docStatus === "rejected") {
        await reuploadSellerDocuments({ idFront: frontUrl, idBack: backUrl }, token);
      } else {
        await uploadSellerDocuments({ idFront: frontUrl, idBack: backUrl }, token);
      }

      toast.success(locale === "ar" ? "تم رفع الهوية بنجاح" : "ID documents uploaded successfully");
      fetchDocsStatus();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload documents");
    } finally {
      setLoading(null);
    }
  };

  const handleStartVerification = async (type: "email" | "phone") => {
    if (!token) return;
    try {
      setLoading(type);
      if (type === "email") {
        await startEmailVerification(token);
      } else {
        const phone = initialData?.phone;
        if (!phone) throw new Error("Phone number not found");
        await startPhoneVerification(phone, token);
      }
      setShowOtp(type);
      toast.success(
        locale === "ar" ? "تم إرسال رمز التحقق" : "Verification code sent",
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to start verification");
    } finally {
      setLoading(null);
    }
  };

  const handleConfirmVerification = async (type: "email" | "phone") => {
    if (!token || !otpValue) return;
    try {
      setLoading(type + "_confirm");
      if (type === "email") {
        await confirmEmailVerification(otpValue, token);
      } else {
        const phone = initialData?.phone;
        await confirmPhoneVerification(phone, otpValue, token);
      }
      toast.success(
        locale === "ar" ? "تم التوثيق بنجاح" : "Verified successfully",
      );
      setShowOtp(null);
      setOtpValue("");
      // Refresh page data
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (err: any) {
      toast.error(err.message || "Invalid verification code");
    } finally {
      setLoading(null);
    }
  };

  const verifications = [
    {
      id: "phone",
      title: t("phone"),
      status: initialData?.phoneVerified ? "verified" : "notVerified",
      icon: <Phone size={20} />,
    },

    {
      id: "email",
      title: t("email"),
      status: initialData?.emailVerified ? "verified" : "notVerified",
      icon: <Mail size={20} />,
    },
   
    {
      id: "id",
      title: t("id"),
      status: docStatus === "approved" ? "verified" : (docStatus === "pending" ? "pending" : "notVerified"),
      icon: <Shield size={20} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-black tracking-tight text-gray-900">
          {t("title")}
        </h2>
        <p className="text-[13px] font-medium text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {verifications.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-100/50"
          >
            <div className="mb-5 flex items-center justify-between">
              <div
                className={`rounded-xl p-3 text-white shadow-lg ${
                  item.status === "verified"
                    ? "bg-emerald-600 shadow-emerald-500/10"
                    : item.status === "pending"
                      ? "bg-amber-500 shadow-amber-500/10"
                      : "bg-gray-400 shadow-black/5"
                }`}
              >
                {item.icon}
              </div>
              <div
                className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                  item.status === "verified"
                    ? "bg-emerald-50 text-emerald-600"
                    : item.status === "pending"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {t(`status.${item.status}`)}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-gray-900">{item.title}</h3>

              {item.status === "verified" ? (
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  <CheckCircle2 size={12} strokeWidth={3} />
                  <span>{locale === "ar" ? "موثق" : "Verified"}</span>
                </div>
              ) : item.status === "pending" ? (
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600">
                  <Clock size={12} strokeWidth={3} />
                  <span>{locale === "ar" ? "قيد المراجعة" : "Under Review"}</span>
                </div>
              ) : item.id === "id" ? (
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <ArrowRight size={12} strokeWidth={3} />
                  <span>{locale === "ar" ? "اضغط للتقديم" : "Apply Now"}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {showOtp === item.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value)}
                        className="h-9 w-full rounded-lg border border-gray-100 bg-gray-50 px-3 text-center text-sm font-black tracking-[0.5em] transition-all focus:border-emerald-500 focus:bg-white focus:outline-none"
                      />
                      <DynamicButton
                        variant="primary"
                        disabled={loading === item.id + "_confirm" || !otpValue}
                        onClick={() =>
                          handleConfirmVerification(item.id as "email" | "phone")
                        }
                        label={
                          loading === item.id + "_confirm"
                            ? locale === "ar"
                              ? "جاري تأكيد..."
                              : "Confirming..."
                            : t("verify")
                        }
                        className="h-9 w-full rounded-lg bg-emerald-600 text-[9px] font-black uppercase tracking-widest text-white hover:bg-emerald-700"
                      />
                    </div>
                  ) : (
                    <DynamicButton
                      variant="outline"
                      onClick={() =>
                        handleStartVerification(item.id as "email" | "phone")
                      }
                      disabled={loading === item.id}
                      label={
                        loading === item.id
                          ? locale === "ar"
                            ? "جاري الإرسال..."
                            : "Sending..."
                          : t("sendCode")
                      }
                      className="h-9 rounded-lg border-gray-100 px-4 text-[9px] font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-emerald-600 hover:text-white"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-white bg-white/40 p-6 shadow-sm ring-1 ring-gray-200/50 backdrop-blur-sm">
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-xl shadow-black/10">
              <FileCheck size={24} />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-black tracking-tight text-gray-900">
                {t("uploadId")}
              </h3>
              <p className="max-w-md text-[13px] font-medium text-gray-500 leading-relaxed">
                {t("idHint")}
              </p>
            </div>
          </div>

          {/* Rejection Feedback */}
          {docStatus === "rejected" && rejectionReason && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4 rounded-2xl border border-rose-100 bg-rose-50/50 p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <AlertCircle size={18} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-rose-600">
                  {locale === "ar" ? "سبب الرفض" : "Rejection Reason"}
                </div>
                <p className="text-[13px] font-extrabold text-rose-800 leading-relaxed">
                  {rejectionReason}
                </p>
              </div>
            </motion.div>
          )}

          {/* Upload Controls */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-4">
              <label className="group relative flex h-32 w-44 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-white transition-all hover:border-emerald-500 hover:bg-emerald-50/20 active:scale-95 shadow-sm">
                {frontPreview ? (
                  <>
                    <Image src={frontPreview} alt="Front ID" fill className="object-cover transition-transform group-hover:scale-105" />
                    {docStatus === "rejected" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white backdrop-blur-[2px] transition-opacity group-hover:bg-black/50">
                        <Camera size={24} className="mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {locale === "ar" ? "تغيير" : "Replace"}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <UploadCloud className="text-gray-400 group-hover:text-emerald-600 transition-colors" size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-emerald-600">
                      {locale === "ar" ? "الوجه الأمامي" : "Front Side"}
                    </span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, "front")} disabled={docStatus === "pending" || docStatus === "approved"} />
              </label>

              <label className="group relative flex h-32 w-44 cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-white transition-all hover:border-emerald-500 hover:bg-emerald-50/20 active:scale-95 shadow-sm">
                {backPreview ? (
                  <>
                    <Image src={backPreview} alt="Back ID" fill className="object-cover transition-transform group-hover:scale-105" />
                    {docStatus === "rejected" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white backdrop-blur-[2px] transition-opacity group-hover:bg-black/50">
                        <Camera size={24} className="mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {locale === "ar" ? "تغيير" : "Replace"}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <UploadCloud className="text-gray-400 group-hover:text-emerald-600 transition-colors" size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-emerald-600">
                      {locale === "ar" ? "الوجه الخلفي" : "Back Side"}
                    </span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, "back")} disabled={docStatus === "pending" || docStatus === "approved"} />
              </label>
            </div>

            {frontFile && backFile && docStatus !== "pending" && docStatus !== "approved" && (
              <div className="flex justify-end">
                <DynamicButton
                  variant="primary"
                  label={loading === "id_submit" ? (locale === "ar" ? "جاري الرفع..." : "Uploading...") : (locale === "ar" ? "إرسال للمراجعة" : "Submit Review")}
                  disabled={loading === "id_submit"}
                  onClick={handleIdSubmit}
                  className="h-12 w-full min-w-[200px] rounded-2xl bg-gray-900 px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-2xl shadow-black/20 hover:bg-emerald-600 active:scale-95 transition-all"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
