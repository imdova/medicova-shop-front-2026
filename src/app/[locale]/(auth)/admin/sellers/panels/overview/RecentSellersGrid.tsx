"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { LanguageType } from "@/util/translations";
import { Sellers } from "@/constants/sellers";
import { SellerPremiumCard } from "./components/SellerPremiumCard";
import Link from "next/link";
import { Seller } from "@/types/product";

interface Props {
  locale: LanguageType;
  itemVariants: any;
}

export const RecentSellersGrid = ({ locale, itemVariants }: Props) => {
  const t = useTranslations("admin");
  const isArabic = locale === "ar";
  const recentSellers: Seller[] = Sellers.slice(0, 4);

  return (
    <div className="space-y-6">
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-black text-gray-900">
            {isArabic ? "البائعين الجدد" : "Recent Sellers"}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {Sellers.length}{" "}
            {isArabic ? "بائع مسجل حالياً" : "SELLERS CURRENTLY REGISTERED"}
          </p>
        </div>
        <Link
          href="#"
          className="group flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-gray-900 transition-all hover:bg-white hover:shadow-lg"
        >
          <span>{t("viewAll")}</span>
          {isArabic ? (
            <ChevronLeft size={14} />
          ) : (
            <ChevronRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          )}
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {recentSellers.map((seller) => (
          <motion.div variants={itemVariants} key={seller.id}>
            <SellerPremiumCard locale={locale} seller={seller} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
