"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Calendar,
  Hash,
  Truck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ReturnOrder } from "../types/account";

interface ReturnItemProps {
  returnOrder: ReturnOrder;
  locale: string;
}

export const ReturnItem: React.FC<ReturnItemProps> = ({
  returnOrder,
  locale,
}) => {
  const t = useTranslations("user");
  const isRTL = locale === "ar";

  const statusConfig = {
    Requested: {
      color: "bg-amber-50 text-amber-700 border-amber-100",
      icon: <AlertCircle size={14} />,
      label: t("requested"),
    },
    Approved: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: <RefreshCw size={14} />,
      label: t("approved"),
    },
    "In Transit": {
      color: "bg-sky-50 text-sky-700 border-sky-100",
      icon: <Truck size={14} />,
      label: t("inTransit"),
    },
    Delivered: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: <RefreshCw size={14} />,
      label: t("delivered"),
    },
    Rejected: {
      color: "bg-rose-50 text-rose-700 border-rose-100",
      icon: <AlertCircle size={14} />,
      label: t("rejected"),
    },
  };

  const config =
    statusConfig[returnOrder.status.en as keyof typeof statusConfig] ||
    statusConfig.Requested;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white/70 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50">
        {/* Header Section */}
        <div className="border-b border-gray-50 bg-gray-50/30 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t("returnId")} {returnOrder.id}
                </h3>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                  <Hash size={12} />
                  {t("forOrder")} {returnOrder.orderId}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-wider ${config.color}`}
              >
                {config.icon}
                {config.label}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <Calendar size={13} />
                {t("requestedOn")} {returnOrder.date}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <div className="space-y-6">
            {returnOrder.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-6 sm:flex-row sm:items-start"
              >
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-50 ring-1 ring-gray-100">
                  <Image
                    className="h-full w-full object-cover"
                    src={item.image}
                    width={96}
                    height={96}
                    alt={item.name[locale as keyof typeof item.name] || ""}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <h4 className="text-base font-bold text-gray-900">
                    {item.name[locale as keyof typeof item.name]}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {t("qty")}
                      </p>
                      <p className="text-sm font-bold text-gray-700">
                        {item.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {t("reason")}
                      </p>
                      <p className="text-sm font-bold text-gray-700">
                        {item.reason[locale as keyof typeof item.reason]}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {t("returnOption")}
                      </p>
                      <p className="text-sm font-bold text-gray-700">
                        {
                          item.returnOption[
                            locale as keyof typeof item.returnOption
                          ]
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-t border-gray-50 bg-gray-50/20 p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-6">
              {returnOrder.trackingNumber && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {t("trackingNumber")}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
                    <Truck size={14} className="text-secondary" />
                    {returnOrder.trackingNumber}{" "}
                    <span className="text-xs font-medium text-gray-400">
                      ({returnOrder.carrier})
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {t("totalRefund")}
              </p>
              <p className="text-2xl font-black text-primary">
                {returnOrder.totalRefund.toFixed(2)}{" "}
                <span className="text-sm font-bold">
                  {locale === "ar" ? "جنيه" : "EGP"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
