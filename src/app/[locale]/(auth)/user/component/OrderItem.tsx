"use client";

import React from "react";
import { Order } from "@/app/[locale]/(auth)/user/types/account";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronRight, Calendar, Hash, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface OrderItemProps {
  order: Order;
  locale: string;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, locale }) => {
  const t = useTranslations("user");
  const isRTL = locale === "ar";

  const statusConfig = {
    completed: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      label: t("status_completed") || "Completed",
    },
    cancelled: {
      color: "bg-rose-50 text-rose-700 border-rose-100",
      label: t("status_cancelled") || "Cancelled",
    },
    processing: {
      color: "bg-amber-50 text-amber-700 border-amber-100",
      label: t("status_processing") || "Processing",
    },
    shipped: {
      color: "bg-sky-50 text-sky-700 border-sky-100",
      label: t("status_shipped") || "Shipped",
    },
    cod: {
      color: "bg-amber-50 text-amber-700 border-amber-100",
      label: locale === "ar" ? "الدفع عند الاستلام" : "COD",
    },
    paid: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      label: locale === "ar" ? "تم الدفع" : "Paid",
    },
  };

  let config =
    statusConfig[order.status as keyof typeof statusConfig] ||
    statusConfig.processing;


  if (order.paymentMethod === "cash_on_delivery") {
    config = statusConfig.cod;
  } else if (order.paymentStatus === "paid" || (order.paymentMethod === "credit_card" && order.status === "processing")) {
 
    config = statusConfig.paid;
  }



  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link
        href={`/user/orders/${order.orderId}`}
        className="hover:border-primary/20 relative block rounded-2xl border border-gray-100 bg-white/70 p-5 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {/* Product Image with Gradient Overlay on Hover */}
          <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100">
            <Image
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              src={order.productImage}
              width={112}
              height={112}
              alt={order.productName}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${config.color}`}
                >
                  {config.label}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                  <Calendar size={13} />
                  {order.date} • {order.time}
                </span>
              </div>

            </div>

            <div className="space-y-1">
              <h3 className="line-clamp-1 text-base font-bold text-gray-900 transition-colors group-hover:text-primary">
                {order.productName}
              </h3>
              {order.productBrand && (
                <p className="flex items-center gap-1 text-sm font-semibold text-gray-500">
                  <Tag size={13} className="text-secondary/60" />
                  {order.productBrand}
                </p>
              )}
            </div>

            {order.productDescription && (
              <p className="line-clamp-2 text-sm italic leading-relaxed text-gray-500 opacity-80">
                {order.productDescription}
              </p>
            )}
          </div>
        </div>

        <div
          className={`absolute ${isRTL ? "left-5" : "right-5"} top-1/2 -translate-x-4 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100`}
        >
          <div className="bg-primary/5 flex h-10 w-10 items-center justify-center rounded-full text-primary shadow-inner">
            {isRTL ? (
              <ChevronRight size={20} className="rotate-180" />
            ) : (
              <ChevronRight size={20} />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default OrderItem;
