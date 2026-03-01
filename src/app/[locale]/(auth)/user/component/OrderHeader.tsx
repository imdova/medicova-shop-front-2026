"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export const OrderHeader: React.FC = () => {
  const t = useTranslations("user");

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
        {t("orders")}
      </h1>
      <p className="mt-2 max-w-2xl text-base text-gray-500">
        {t("ordersSubtitle")}
      </p>

      <div className="to-primary/60 mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-primary" />
    </motion.div>
  );
};
