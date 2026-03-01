"use client";

import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export const ReturnHeader: React.FC = () => {
  const t = useTranslations("user");

  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          {t("returns")}
        </h1>
        <p className="mt-3 text-lg font-medium text-gray-400">
          {t("returnsSubtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Link
          href="returns/new"
          className="shadow-primary/20 hover:shadow-primary/30 group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div className="group-hover:animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
          <Plus className="h-4 w-4" />
          {t("createReturn")}
        </Link>
      </motion.div>
    </div>
  );
};
