"use client";

import { CardStats } from "@/components/features/cards/CardStats";
import { useTranslations } from "next-intl";
import { Package, CheckCircle, AlertCircle, Tag } from "lucide-react";
import { motion } from "framer-motion";

interface ProductStatsProps {
  stats: {
    total: number;
    active: number;
    outOfStock: number;
    onOffer: number;
  };
  locale: string;
}

export const ProductStats = ({ stats, locale }: ProductStatsProps) => {
  const t = useTranslations("seller_products.stats");

  const statsData = [
    {
      title: t("total"),
      value: stats.total.toString(),
      icon: "package" as const,
      color: "#6366f1", // Indigo
    },
    {
      title: t("active"),
      value: stats.active.toString(),
      icon: "award" as const, // Reusing existing icons from iconMap in CardStats if possible, or I'll need to update iconMap
      color: "#10b981", // Emerald
    },
    {
      title: t("outOfStock"),
      value: stats.outOfStock.toString(),
      icon: "eye" as const,
      color: "#f43f5e", // Rose
    },
    {
      title: t("onOffer"),
      value: stats.onOffer.toString(),
      icon: "star" as const,
      color: "#f59e0b", // Amber
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <CardStats
            title={stat.title}
            value={stat.value}
            change="" // No change for now
            icon={stat.icon as any}
            color={stat.color}
            locale={locale as any}
          />
        </motion.div>
      ))}
    </div>
  );
};
