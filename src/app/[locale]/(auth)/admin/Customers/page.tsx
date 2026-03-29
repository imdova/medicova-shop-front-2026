"use client";

import { Users } from "lucide-react";
import CustomersListPanel from "./panels/CustomersListPanel";
import { useAppLocale } from "@/hooks/useAppLocale";

export default function CustomersPage() {

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
                <Users className="h-5 w-5 text-[#31533A]" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
                  {isArabic ? "إدارة العملاء" : "Customers Management"}
                </h1>
                <p className="mt-0.5 text-sm font-medium text-gray-400">
                  {isArabic
                    ? "راقب وأدر قاعدة عملائك بشكل فعال."
                    : "Monitor and manage your customer base efficiently."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <CustomersListPanel locale={locale} />
      </div>
    </div>
  );
}
