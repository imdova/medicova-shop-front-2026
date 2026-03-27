"use client";

import React from "react";
import OrderItem from "./OrderItem";
import { Order } from "@/app/[locale]/(auth)/user/types/account";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

interface OrderListProps {
  orders: Order[];
  locale: string;
}

const OrderList: React.FC<OrderListProps> = ({ orders, locale }) => {
  const t = useTranslations();

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50 px-4 py-20"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-300 shadow-sm">
          <ShoppingBag size={32} />
        </div>
        <h3 className="mb-1 text-xl font-bold text-gray-900">
          {t("common.noResults")}
        </h3>
        <p className="max-w-xs text-center text-gray-500">
          {t("user.emptySubtitle") || "You haven't placed any orders yet."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <OrderItem order={order} locale={locale} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default OrderList;
