"use client";

import { useTranslations } from "next-intl";
import {
  Shield,
  Phone,
  Mail,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  UploadCloud,
} from "lucide-react";
import { motion } from "framer-motion";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";
import { useAppLocale } from "@/hooks/useAppLocale";

export const VerificationCenter = () => {
  const t = useTranslations("seller_profile.verification");
  const locale = useAppLocale();

  const verifications = [
    {
      id: "phone",
      title: t("phone"),
      status: "verified",
      icon: <Phone size={20} />,
    },
    {
      id: "email",
      title: t("email"),
      status: "verified",
      icon: <Mail size={20} />,
    },
    {
      id: "id",
      title: t("id"),
      status: "pending",
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
                      : "bg-gray-900 shadow-black/5"
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
              ) : (
                <DynamicButton
                  variant="outline"
                  label={t("verify")}
                  className="h-9 rounded-lg border-gray-100 px-4 text-[9px] font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-emerald-600 hover:text-white"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white bg-gray-50/50 p-6 ring-1 ring-gray-100/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-3">
            <div className="inline-flex rounded-xl bg-gray-900 p-3 text-white shadow-lg shadow-black/10">
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

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white p-5 transition-all hover:border-emerald-500 hover:bg-emerald-50/10">
              <UploadCloud
                className="text-gray-400 group-hover:text-emerald-600 transition-colors"
                size={20}
              />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-emerald-600">
                {locale === "ar" ? "الوجه الأمامي" : "Front Side"}
              </span>
              <input type="file" className="hidden" />
            </label>
            <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white p-5 transition-all hover:border-emerald-500 hover:bg-emerald-50/10">
              <UploadCloud
                className="text-gray-400 group-hover:text-emerald-600 transition-colors"
                size={20}
              />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-emerald-600">
                {locale === "ar" ? "الوجه الخلفي" : "Back Side"}
              </span>
              <input type="file" className="hidden" />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};
