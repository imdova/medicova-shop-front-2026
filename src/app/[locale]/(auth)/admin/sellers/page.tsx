"use client";

import { Plus, Store } from "lucide-react";
import SellersListPanel from "./panels/SellersListPanel";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function SellersPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F8FAFC] p-4 duration-700 md:p-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                <Store className="h-5 w-5 text-[#31533A]" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
                  {isArabic ? "إدارة البائعين" : "Sellers Management"}
                </h1>
                <p className="mt-0.5 text-sm font-medium text-gray-400">
                  {isArabic
                    ? "راقب وأدر بائعين سوق الرعاية الصحية."
                    : "Monitor and manage marketplace healthcare vendors."}
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/admin/sellers/add"
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#2F6B3A] px-5 text-sm font-black text-white shadow-xl shadow-emerald-900/10 transition-all duration-300 hover:brightness-110 active:scale-95"
          >
            <Plus
              size={18}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            <span>{isArabic ? "إضافة بائع" : "Onboard New Seller"}</span>
          </Link>
        </div>

        <SellersListPanel locale={locale} />
      </div>
    </div>
  );
}
