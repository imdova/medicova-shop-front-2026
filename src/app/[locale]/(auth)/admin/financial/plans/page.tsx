"use client";

import React from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useTranslations } from "next-intl";
import { CircleDollarSign } from "lucide-react";
import PlansListPanel from "../panels/PlansListPanel";

export default function FinancialPlansPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <CircleDollarSign className="text-emerald-600" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {isArabic ? "الخطط" : t("plans")}
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-medium text-gray-400">
              {isArabic
                ? "إدارة خطط الاشتراك والأسعار"
                : "Manage subscription plans and pricing"}
            </p>
          </div>
        </div>
      </div>

      <PlansListPanel />
    </div>
  );
}

