"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { LanguageType } from "@/util/translations";

interface Props {
  locale: LanguageType;
  itemVariants: any;
}

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  itemVariants: any;
  locale: LanguageType;
  t: any;
}

const KPICard = ({
  title,
  value,
  change,
  icon: Icon,
  iconBg,
  iconColor,
  itemVariants,
  locale,
  t,
}: KPICardProps) => {
  return (
    <motion.div
      variants={itemVariants}
      className="group relative overflow-hidden rounded-[24px] border border-white/40 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
            {title}
          </p>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[28px] font-black leading-none tracking-tighter text-gray-900">
              {value}
            </h3>
            <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-500">
              {change}
            </span>
          </div>
          <p className="text-[10px] font-bold text-gray-300">
            {t("vsLastMonth")}
          </p>
        </div>

        <div
          className={`flex items-center justify-center rounded-2xl p-2 ${iconBg} ${iconColor} shadow-inner transition-all duration-500 group-hover:scale-110`}
        >
          <Icon size={15} />
        </div>
      </div>
    </motion.div>
  );
};

export const KPICards = ({ locale, itemVariants }: Props) => {
  const t = useTranslations("admin");

  const stats = [
    {
      title: t("totalSellers"),
      value: "1,245",
      change: "+12%",
      icon: Users,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
    {
      title: t("totalProducts"),
      value: "8,642",
      change: "+8%",
      icon: Package,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
    },
    {
      title: t("totalRevenue"),
      value: "154.5k",
      change: "+18%",
      icon: ShoppingCart,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      title: t("totalCommission"),
      value: "12,240",
      change: "+13%",
      icon: DollarSign,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <KPICard
          key={idx}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          iconBg={stat.iconBg}
          iconColor={stat.iconColor}
          itemVariants={itemVariants}
          locale={locale}
          t={t}
        />
      ))}
    </section>
  );
};
