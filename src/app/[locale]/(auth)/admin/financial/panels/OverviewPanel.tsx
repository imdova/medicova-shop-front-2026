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
} from "lucide-react";

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

function RevenueTrendChart() {
  return (
    <svg viewBox="0 0 640 220" className="h-[210px] w-full">
      <defs>
        <linearGradient id="revFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="M40 20 H620 M40 70 H620 M40 120 H620 M40 170 H620"
        stroke="#e2e8f0"
        strokeWidth="1"
      />

      <path
        d="M40 160
           C 70 70, 110 60, 140 120
           S 210 140, 240 95
           S 310 55, 340 120
           S 420 190, 460 150
           S 520 40, 560 110
           S 600 160, 620 90
           L 620 200 L 40 200 Z"
        fill="url(#revFill)"
      />
      <path
        d="M40 160
           C 70 70, 110 60, 140 120
           S 210 140, 240 95
           S 310 55, 340 120
           S 420 190, 460 150
           S 520 40, 560 110
           S 600 160, 620 90"
        fill="none"
        stroke="#16a34a"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
        <text
          key={d}
          x={70 + i * 80}
          y={214}
          textAnchor="middle"
          className="fill-slate-400 text-[12px] font-semibold"
        >
          {d}
        </text>
      ))}
    </svg>
  );
}

export default function OverviewPanel() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  const kpis = [
    {
      label: isArabic ? "إجمالي الإيراد" : "Total Revenue",
      value: formatCurrency(1_284_500),
      sub: isArabic ? "+12.5% مقابل الشهر الماضي" : "+12.5% vs last month",
      trend: "up" as const,
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconTone: "text-emerald-700",
    },
    {
      label: isArabic ? "عمولة المنصة" : "Platform Commission",
      value: formatCurrency(192_675),
      sub: isArabic ? "-2.1% انحراف الهدف" : "-2.1% target deviation",
      trend: "down" as const,
      icon: BadgePercent,
      iconBg: "bg-slate-50",
      iconTone: "text-slate-700",
    },
    {
      label: isArabic ? "مدفوعات معلّقة" : "Pending Payouts",
      value: formatCurrency(45_230),
      sub: isArabic ? "+5.4% معدل السحب" : "+5.4% payout rate",
      trend: "up" as const,
      icon: CreditCard,
      iconBg: "bg-amber-50",
      iconTone: "text-amber-700",
    },
    {
      label: isArabic ? "حجم الاسترداد" : "Refund Volume",
      value: formatCurrency(12_400),
      sub: isArabic ? "-8.2% عن الأمس" : "-8.2% from yesterday",
      trend: "down" as const,
      icon: RotateCcw,
      iconBg: "bg-slate-50",
      iconTone: "text-slate-700",
    },
  ];

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          const TrendIcon = k.trend === "up" ? ArrowUpRight : ArrowDownRight;
          const trendTone =
            k.trend === "up" ? "text-emerald-600" : "text-rose-600";
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
                  <div
                    className={`mt-1 flex items-center gap-1 text-xs font-semibold ${trendTone}`}
                  >
                    <TrendIcon className="h-3.5 w-3.5" />
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
              <div className="text-lg font-extrabold text-slate-900">$1.28M</div>
              <div className="mt-1 text-xs font-semibold text-emerald-600">
                +8.4% {isArabic ? "هذا الأسبوع" : "this week"}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <RevenueTrendChart />
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
              <div className="text-lg font-extrabold text-slate-900">$192K</div>
              <div className="mt-1 text-xs font-semibold text-emerald-600">
                +15.2% {isArabic ? "منذ بداية السنة" : "YTD"}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              {
                label: "MEDICAL SUPPLIES",
                value: 82_000,
                pct: 42,
                tone: "bg-emerald-600",
              },
              {
                label: "PHARMA PRODUCTS",
                value: 54_000,
                pct: 28,
                tone: "bg-emerald-600",
              },
              {
                label: "APPAREL & UNIFORMS",
                value: 36_000,
                pct: 19,
                tone: "bg-slate-400",
              },
              {
                label: "EQUIPMENT RENTAL",
                value: 20_000,
                pct: 11,
                tone: "bg-slate-400",
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span className="uppercase tracking-wider">{row.label}</span>
                  <span className="text-slate-500">
                    ${formatShort(row.value)} ({row.pct}%)
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${row.tone}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
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
            <button
              type="button"
              className="text-sm font-semibold text-emerald-700 hover:underline"
            >
              {isArabic ? "عرض الكل" : "View All"}
            </button>
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
                {[
                  {
                    id: "#TX-94021",
                    vendor: "MedTech Solutions",
                    category: "Supplies",
                    status: "success" as const,
                    amount: 4250,
                  },
                  {
                    id: "#TX-94019",
                    vendor: "PharmaLogics Co.",
                    category: "Pharma",
                    status: "success" as const,
                    amount: 12800,
                  },
                  {
                    id: "#TX-94018",
                    vendor: "CareGiver Apparel",
                    category: "Apparel",
                    status: "pending" as const,
                    amount: 1420,
                  },
                ].map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-50/80 hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {r.id}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-full bg-slate-100" />
                        <span className="font-medium text-slate-700">
                          {r.vendor}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{r.category}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          r.status === "success"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                        }`}
                      >
                        {r.status === "success"
                          ? isArabic
                            ? "ناجح"
                            : "Success"
                          : isArabic
                            ? "قيد الانتظار"
                            : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-900">
                      {formatCurrency(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-900">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
              {isArabic ? "حالة السوق" : "Marketplace Status"}
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-emerald-900/80">
            {isArabic ? "جميع الأنظمة تعمل بشكل طبيعي." : "All systems operational"}
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-emerald-200/60">
            <div className="h-2 w-[92%] rounded-full bg-emerald-600" />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-800/80">
            <CalendarDays className="h-4 w-4 text-emerald-700" />
            {isArabic ? "آخر 24 ساعة" : "Last 24 hours"}
          </div>
        </div>
      </div>
    </div>
  );
}
