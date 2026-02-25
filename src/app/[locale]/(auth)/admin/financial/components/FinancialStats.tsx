"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { CardStats } from "@/components/features/cards/CardStats";
import { LanguageType } from "@/util/translations";

interface FinancialStatsProps {
  locale: LanguageType;
}

const FinancialStats: React.FC<FinancialStatsProps> = ({ locale }) => {
  const t = useTranslations("admin");

  const stats = [
    {
      title: t("totalSales"),
      value: "24,563.00 EGP",
      details: t("lifetimeEarnings"),
      icon: "dollar" as const,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: t("totalTaxes"),
      value: "1,250.00 EGP",
      details: t("lifetimeEarnings"),
      icon: "dollar" as const,
      color: "bg-gray-50 text-gray-600",
    },
    {
      title: t("netSales"),
      value: "23,313.00 EGP",
      details: t("lifetimeEarnings"),
      icon: "dollar" as const,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: t("commission"),
      value: "5,000.00 EGP",
      change: "+15%",
      icon: "ArrowUp" as const,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <CardStats
          key={index}
          title={stat.title}
          value={stat.value}
          details={stat.details}
          change={stat.change}
          icon={stat.icon}
          size="md"

        />
      ))}
    </div>
  );
};

export default FinancialStats;
