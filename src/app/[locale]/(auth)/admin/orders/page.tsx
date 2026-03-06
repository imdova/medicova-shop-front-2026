"use client";

import { Download, Plus } from "lucide-react";
import OrdersListPanel from "./panels/OrdersListPanel";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Link } from "@/i18n/navigation";

export default function OrdersPage() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F8FAFC] p-4 duration-700 md:p-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {isArabic ? "إدارة الطلبات" : "Orders Management"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              {isArabic ? "تصدير التقرير" : "Export Report"}
            </button>
            <Link
              href="/admin/orders/new"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              {isArabic ? "طلب جديد" : "New Order"}
            </Link>
          </div>
        </div>

        <OrdersListPanel locale={locale} />
      </div>
    </div>
  );
}
