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

export const VerificationCenter = () => {
  const t = useTranslations("seller_profile.verification");

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
    <div className="space-y-10">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight text-gray-900">
          {t("title")}
        </h2>
        <p className="text-sm font-medium text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {verifications.map((item) => (
          <div
            key={item.id}
            className="group relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div
                className={`rounded-2xl p-4 text-white shadow-xl ${
                  item.status === "verified"
                    ? "bg-emerald-500 shadow-emerald-500/20"
                    : item.status === "pending"
                      ? "bg-amber-500 shadow-amber-500/20"
                      : "bg-gray-900 shadow-black/10"
                }`}
              >
                {item.icon}
              </div>
              <div
                className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
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

            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900">{item.title}</h3>
              {item.status === "verified" ? (
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
                  <CheckCircle2 size={14} />
                  <span>Verified</span>
                </div>
              ) : (
                <DynamicButton
                  variant="outline"
                  label={t("verify")}
                  className="rounded-xl border-gray-100 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-900 hover:text-white"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-[2.5rem] border border-white/60 bg-white/70 p-10 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          <div className="flex-1 space-y-4">
            <div className="inline-flex rounded-2xl bg-gray-900 p-4 text-white shadow-xl shadow-black/10">
              <FileCheck size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black tracking-tight text-gray-900">
                {t("uploadId")}
              </h3>
              <p className="max-w-md text-sm font-medium text-gray-500">
                {t("idHint")}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50/30 p-8 transition-all hover:border-gray-900 hover:bg-white">
              <UploadCloud
                className="text-gray-400 transition-colors group-hover:text-gray-900"
                size={24}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">
                Front Side
              </span>
              <input type="file" className="hidden" />
            </label>
            <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50/30 p-8 transition-all hover:border-gray-900 hover:bg-white">
              <UploadCloud
                className="text-gray-400 transition-colors group-hover:text-gray-900"
                size={24}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900">
                Back Side
              </span>
              <input type="file" className="hidden" />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};
