"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { DollarSign, ShoppingCart, RotateCcw } from "lucide-react";
import { LanguageType } from "@/util/translations";
import GenericChart from "@/components/features/charts/GenericChart";

interface Props {
  locale: LanguageType;
  itemVariants: any;
}

export const SellersStats = ({ locale, itemVariants }: Props) => {
  const t = useTranslations("admin");

  // Colors aligned with Medicova brand
  const colors = {
    revenue: "#31533A", // Emerald
    orders: "#B39371", // Gold
    returns: "#ef4444", // Red
  };

  const chartData = {
    yearly: {
      categories: {
        en: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        ar: [
          "يناير",
          "فبراير",
          "مارس",
          "أبريل",
          "مايو",
          "يونيو",
          "يوليو",
          "أغسطس",
          "سبتمبر",
          "أكتوبر",
          "نوفمبر",
          "ديسمبر",
        ],
      },
      series: [
        {
          name: { en: "Revenue", ar: "الإيرادات" },
          data: [
            18000, 22000, 15000, 26000, 21000, 28000, 24000, 19000, 30000,
            27000, 32000, 35000,
          ],
          color: colors.revenue,
        },
        {
          name: { en: "Orders", ar: "الطلبات" },
          data: [
            1200, 1500, 1000, 1800, 1400, 1900, 1600, 1300, 2100, 1850, 2200,
            2400,
          ],
          color: colors.orders,
        },
        {
          name: { en: "Returns", ar: "المرتجعات" },
          data: [20, 25, 15, 30, 22, 35, 28, 20, 40, 32, 45, 48],
          color: colors.returns,
        },
      ],
    },
    monthly: {
      categories: {
        en: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
        ar: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
      },
      series: [
        {
          name: { en: "Revenue", ar: "الإيرادات" },
          data: Array.from({ length: 30 }, () =>
            Math.floor(500 + Math.random() * 500),
          ),
          color: colors.revenue,
        },
        {
          name: { en: "Orders", ar: "الطلبات" },
          data: Array.from({ length: 30 }, () =>
            Math.floor(30 + Math.random() * 20),
          ),
          color: colors.orders,
        },
        {
          name: { en: "Returns", ar: "المرتجعات" },
          data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 3)),
          color: colors.returns,
        },
      ],
    },
    weekly: {
      categories: {
        en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        ar: [
          "الإثنين",
          "الثلاثاء",
          "الأربعاء",
          "الخميس",
          "الجمعة",
          "السبت",
          "الأحد",
        ],
      },
      series: [
        {
          name: { en: "Revenue", ar: "الإيرادات" },
          data: [3500, 3700, 3600, 3900, 4100, 4500, 4700],
          color: colors.revenue,
        },
        {
          name: { en: "Orders", ar: "الطلبات" },
          data: [220, 240, 215, 260, 280, 310, 330],
          color: colors.orders,
        },
        {
          name: { en: "Returns", ar: "المرتجعات" },
          data: [2, 1, 3, 2, 4, 3, 2],
          color: colors.returns,
        },
      ],
    },
  };

  const statusCards = [
    {
      title: { en: "Revenue", ar: "الإيرادات" },
      value: "34,000 EGP",
      color: colors.revenue,
      icon: DollarSign,
    },
    {
      title: { en: "Orders", ar: "الطلبات" },
      value: "1,235",
      color: colors.orders,
      icon: ShoppingCart,
    },
    {
      title: { en: "Returns", ar: "المرتجعات" },
      value: "48",
      color: colors.returns,
      icon: RotateCcw,
    },
  ];

  return (
    <motion.div
      variants={itemVariants}
      className="overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-gray-200/30 backdrop-blur-xl sm:p-8"
    >
      <GenericChart
        chartTitle={t("sellerStats")}
        data={chartData}
        showCards={true}
        cards={statusCards}

        chartDisplayType="both"
      />
    </motion.div>
  );
};
