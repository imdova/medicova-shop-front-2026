"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface OrderStatsProps {
  orderCounts: Record<string, number>;
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

const OrderStats: React.FC<OrderStatsProps> = ({
  orderCounts,
  activeStatus,
  onStatusChange,
}) => {
  const t = useTranslations("admin");

  const statusOptions = [
    { id: "all", color: "from-blue-500 to-indigo-600" },
    { id: "pending", color: "from-amber-400 to-orange-500" },
    { id: "packaging", color: "from-indigo-400 to-violet-500" },
    { id: "for_delivery", color: "from-sky-400 to-blue-500" },
    { id: "delivered", color: "from-emerald-400 to-green-600" },
    { id: "returned", color: "from-rose-400 to-red-500" },
    { id: "cancelled", color: "from-slate-400 to-slate-600" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
      {statusOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onStatusChange(option.id)}
          className={`group relative overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-300 hover:shadow-xl ${
            activeStatus === option.id
              ? "border-primary/20 ring-primary/5 ring-4"
              : "hover:border-primary/10 border-gray-100"
          }`}
        >
          <div className="relative z-10 flex flex-col items-start gap-1">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                activeStatus === option.id
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-gray-600"
              }`}
            >
              {t(`statusOptions.${option.id}`)}
            </span>
            <span className="text-2xl font-black leading-none text-gray-900">
              {orderCounts[option.id] || 0}
            </span>
          </div>

          {/* Luxury background highlight for active state */}
          {activeStatus === option.id && (
            <div
              className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${option.color}`}
            ></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default OrderStats;
