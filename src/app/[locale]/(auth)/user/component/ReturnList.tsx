"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import { ReturnOrder } from "../types/account";
import { ReturnItem } from "./ReturnItem";

interface ReturnListProps {
  returns: ReturnOrder[];
  locale: string;
}

export const ReturnList: React.FC<ReturnListProps> = ({ returns, locale }) => {
  const t = useTranslations("user");

  if (returns.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-gray-50/30 px-4 py-24"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-gray-200 shadow-xl shadow-gray-200/50">
          <RefreshCcw size={40} />
        </div>
        <h3 className="mb-2 text-2xl font-black text-gray-900">
          {t("noReturnsTitle")}
        </h3>
        <p className="max-w-xs text-center font-medium text-gray-500">
          {t("noReturnsMessage")}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <AnimatePresence mode="popLayout">
        {returns.map((returnOrder, index) => (
          <motion.div
            key={returnOrder.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <ReturnItem returnOrder={returnOrder} locale={locale} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
