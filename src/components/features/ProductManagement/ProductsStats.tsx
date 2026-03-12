"use client";

import { AlertCircle, FileCheck, Package, Star } from "lucide-react";
import { LanguageType } from "@/util/translations";
import { ProductComputedStats } from "./types";
import { formatNumber } from "./utils";

interface ProductsStatsProps {
  locale: LanguageType;
  isAr: boolean;
  stats: ProductComputedStats;
}

const cards = [
  {
    icon: Package,
    accent: "emerald",
    gradient: "from-emerald-500/8 to-emerald-600/4",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600",
    ring: "ring-emerald-500/20",
    shadow: "hover:shadow-emerald-500/10",
  },
  {
    icon: FileCheck,
    accent: "amber",
    gradient: "from-amber-500/8 to-amber-600/4",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600",
    ring: "ring-amber-500/20",
    shadow: "hover:shadow-amber-500/10",
  },
  {
    icon: AlertCircle,
    accent: "rose",
    gradient: "from-rose-500/8 to-rose-600/4",
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-600",
    ring: "ring-rose-500/20",
    shadow: "hover:shadow-rose-500/10",
  },
  {
    icon: Star,
    accent: "violet",
    gradient: "from-violet-500/8 to-violet-600/4",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-600",
    ring: "ring-violet-500/20",
    shadow: "hover:shadow-violet-500/10",
  },
] as const;

export function ProductsStats({ locale, isAr, stats }: ProductsStatsProps) {
  const values = [
    {
      value: formatNumber(stats.totalProducts, locale),
      label: isAr ? "إجمالي المنتجات" : "Total Products",
    },
    {
      value: String(stats.pendingCount),
      label: isAr ? "قيد الموافقة" : "Pending Approval",
    },
    {
      value: String(stats.outOfStockCount),
      label: isAr ? "نفد من المخزون" : "Out of Stock",
    },
    {
      value: stats.topCategory,
      label: isAr ? "أفضل فئة مبيعاً" : "Top Selling Category",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${card.shadow} hover:ring-2 ${card.ring}`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            aria-hidden
          />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor} transition-transform duration-300 group-hover:scale-105`}
              >
                <card.icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <p className="text-2xl font-extrabold tabular-nums tracking-tight text-slate-900">
                {values[index].value}
              </p>
            </div>
          </div>

          <div className="relative mt-3">
            <p className="text-xs font-medium text-slate-500">
              {values[index].label}
            </p>
          </div>

          <div
            className={`absolute left-0 top-0 h-0.5 w-14 rounded-r-full ${
              card.accent === "emerald"
                ? "bg-emerald-500"
                : card.accent === "amber"
                  ? "bg-amber-500"
                  : card.accent === "rose"
                    ? "bg-rose-500"
                    : "bg-violet-500"
            }`}
            aria-hidden
          />
        </div>
      ))}
    </div>
  );
}
