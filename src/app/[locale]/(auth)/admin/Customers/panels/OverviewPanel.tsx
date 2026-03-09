"use client";

import { motion } from "framer-motion";
import { LanguageType } from "@/util/translations";
import { KPICards } from "./overview/KPICards";
import { SellersStats } from "./overview/SellersStats";
import { RecentSellersGrid } from "./overview/RecentSellersGrid";
import { TopSellersList } from "./overview/TopSellersList";
import { SellerReviewsList } from "./overview/SellerReviewsList";

export default function OverviewPanel({ locale }: { locale: LanguageType }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for premium feel
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-12 pb-20"
    >
      {/* KPI Section - Row 1 */}
      <KPICards locale={locale} itemVariants={itemVariants} />

      {/* Row 2: Stats & Top Sellers */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SellersStats locale={locale} itemVariants={itemVariants} />
        </div>
        <div className="lg:col-span-4">
          <TopSellersList locale={locale} itemVariants={itemVariants} />
        </div>
      </div>

      {/* Row 3: Recent Sellers & Reviews */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RecentSellersGrid locale={locale} itemVariants={itemVariants} />
        </div>
        <div className="lg:col-span-4">
          <SellerReviewsList locale={locale} itemVariants={itemVariants} />
        </div>
      </div>
    </motion.div>
  );
}
