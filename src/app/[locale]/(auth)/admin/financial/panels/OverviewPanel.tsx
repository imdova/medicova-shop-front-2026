"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgePercent,
  CalendarDays,
  CreditCard,
  DollarSign,
  RotateCcw,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { 
  getAdminFinanceSummary, 
  getAdminRevenueTrend, 
  getAdminCategorySplit,
  getAdminTransactions,
  AdminFinanceSummary,
  RevenueTrend,
  CategorySplit,
  AdminTransaction 
} from "@/services/financeService";
import GenericChart from "@/components/features/charts/GenericChart";
import { motion } from "framer-motion";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShort(value: number) {
  if (value >= 1_000_000) return `${Math.round((value / 1_000_000) * 10) / 10}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}


export default function OverviewPanel() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [summary, setSummary] = useState<AdminFinanceSummary | null>(null);
  const [trend, setTrend] = useState<RevenueTrend[]>([]);
  const [split, setSplit] = useState<CategorySplit[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        setLoading(true);
        const [sumData, trendData, splitData, txData] = await Promise.all([
          getAdminFinanceSummary(token),
          getAdminRevenueTrend(token),
          getAdminCategorySplit(token),
          getAdminTransactions(token, { limit: 5 })
        ]);
        setSummary(sumData);
        setTrend(trendData);
        setSplit(splitData);
        setRecentTransactions(txData.transactions);
      } catch (err) {
        console.error("Failed to fetch admin finance overview:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const kpis = useMemo(() => [
    {
      label: isArabic ? "إجمالي الإيراد" : "Total Revenue",
      value: formatCurrency(summary?.totalGrossVolume || 0),
      sub: isArabic ? "إجمالي مبيعات السوق" : "Total marketplace sales",
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconTone: "text-emerald-700",
    },
    {
      label: isArabic ? "عمولة المنصة" : "Platform Commission",
      value: formatCurrency(summary?.totalPlatformCommission || 0),
      sub: isArabic ? "صافي إيرادات المنصة" : "Net platform revenue",
      icon: BadgePercent,
      iconBg: "bg-slate-50",
      iconTone: "text-slate-700",
    },
    {
      label: isArabic ? "مدفوعات معلّقة" : "Pending Payouts",
      value: formatCurrency(summary?.pendingPayouts || 0),
      sub: isArabic ? "مدفوعات في البايبلين" : "Payouts in pipeline",
      icon: CreditCard,
      iconBg: "bg-amber-50",
      iconTone: "text-amber-700",
    },
    {
      label: isArabic ? "حجم الاسترداد" : "Refund Volume",
      value: formatCurrency(summary?.refundVolume || 0),
      sub: isArabic ? "إجمالي المبالغ المستردة" : "Total amount refunded",
      icon: RotateCcw,
      iconBg: "bg-slate-50",
      iconTone: "text-slate-700",
    },
  ], [summary, isArabic]);

  const chartData = useMemo(() => {
    return {
      yearly: {
        categories: {
          en: Array.isArray(trend) ? trend.map(t => t.date) : [],
          ar: Array.isArray(trend) ? trend.map(t => t.date) : []
        },
        series: [
          {
            name: { en: "Revenue", ar: "الإيرادات" },
            data: Array.isArray(trend) ? trend.map(t => t.revenue) : [],
            color: "#16a34a",
          }
        ]
      },
      monthly: { categories: { en: [], ar: [] }, series: [] },
      weekly: { categories: { en: [], ar: [] }, series: [] }
    };
  }, [trend]);

  if (loading && token) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-600">{k.label}</p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-900">
                    {k.value}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                    {k.sub}
                  </div>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${k.iconBg} ${k.iconTone}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {isArabic ? "اتجاه الإيراد" : "Revenue Trend"}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {isArabic
                  ? "الأرباح اليومية للشهر الحالي"
                  : "Daily earnings for the current month"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-extrabold text-slate-900">
                {formatCurrency(summary?.totalGrossVolume || 0)}
              </div>
            </div>
          </div>
          <div className="mt-6 h-[300px]">
             <GenericChart
                data={chartData}
                chartDisplayType="line"
                showCards={false}
                locale={locale}
             />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {isArabic ? "الدخل حسب الفئة" : "Income by Category"}
              </h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {isArabic
                  ? "أفضل قطاعات السوق أداءً"
                  : "Top performing marketplace segments"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-extrabold text-slate-900">
                {formatCurrency(summary?.totalPlatformCommission || 0)}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {Array.isArray(split) && split.length > 0 ? split.map((row) => (
              <div key={row.categoryName}>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="uppercase tracking-wider">{row.categoryName}</span>
                  <span className="text-slate-500">
                    {formatCurrency(row.revenue)} ({Math.round(row.percentage)}%)
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.percentage}%` }}
                    className="h-2 rounded-full bg-emerald-600"
                  />
                </div>
              </div>
            )) : (
              <div className="flex h-40 items-center justify-center text-sm text-gray-400">
                {isArabic ? "لا توجد بيانات متاحة" : "No data available"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions + status card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold text-slate-900">
              {isArabic ? "أحدث المعاملات" : "Recent Transactions"}
            </h3>
            <Link
              href="/admin/financial?tab=transactions"
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              {isArabic ? "عرض الكل" : "View All"}
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">
                    {isArabic ? "المعرف" : "Transaction ID"}
                  </th>
                  <th className="px-4 py-3">{isArabic ? "البائع" : "Vendor"}</th>
                  <th className="px-4 py-3">{isArabic ? "الفئة" : "Category"}</th>
                  <th className="px-4 py-3">{isArabic ? "الحالة" : "Status"}</th>
                  <th className="px-4 py-3 text-right">
                    {isArabic ? "المبلغ" : "Amount"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(recentTransactions) && recentTransactions.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b border-slate-50/80 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      #{r.orderNumber}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                          {r.sellerId?.brandName?.[0] || r.sellerId?.firstName?.[0] || "V"}
                        </div>
                        <span className="font-medium text-slate-700">
                          {r.sellerId?.brandName || `${r.sellerId?.firstName} ${r.sellerId?.lastName}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">Marketplace</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          r.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : r.status === "refunded"
                              ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                              : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                        }`}
                      >
                        {r.status === "completed"
                          ? (isArabic ? "ناجح" : "Success")
                          : r.status === "refunded"
                            ? (isArabic ? "مسترجع" : "Refunded")
                            : (isArabic ? "قيد الانتظار" : "Pending")}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-900">
                      {formatCurrency(r.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

