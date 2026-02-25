import { CardStats, IconType } from "@/components/features/cards/CardStats";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { LanguageType } from "@/util/translations";

interface Props {
  locale: LanguageType;
  itemVariants: any;
}

export const OverviewStats = ({ locale, itemVariants }: Props) => {
  const t = useTranslations("admin");
  const stats: {
    title: string;
    value: string;
    change: string;
    icon: IconType;
    color: string;
  }[] = [
    {
      title: t("totalSellers"),
      value: "1,245",
      change: "+12.5%",
      icon: "users",
      color: "#6366f1",
    },
    {
      title: t("totalProducts"),
      value: "8,642",
      change: "+8.2%",
      icon: "package",
      color: "#0ea5e9",
    },
    {
      title: t("totalRevenue"),
      value: "154.5k EGP",
      change: "+14%",
      icon: "shoppingCart",
      color: "#8b5cf6",
    },
    {
      title: t("totalCommission"),
      value: "12,240 EGP",
      change: "+15%",
      icon: "dollar",
      color: "#10b981",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <motion.div variants={itemVariants} key={idx}>
          <CardStats
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
            size="md"

          />
        </motion.div>
      ))}
    </section>
  );
};
