"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface OrderFiltersProps {
  searchTerm: string;
  timeFilter: string;
  filteredCount: number;
  updateSearchParam: (param: string, value: string) => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  timeFilter,
  filteredCount,
  updateSearchParam,
}) => {
  const t = useTranslations("user");

  return (
    <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="flex max-w-2xl flex-1 flex-col gap-4">
        <label className="block text-sm font-medium text-gray-600">
          {filteredCount}{" "}
          {filteredCount === 1 ? t("orderFound") : t("ordersFound")}
        </label>

        <div className="group relative flex-1">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="focus:ring-primary/10 h-12 w-full rounded-xl border border-gray-200 bg-white/50 px-11 py-2 text-gray-700 shadow-sm outline-none backdrop-blur-sm transition-all duration-300 focus:border-primary focus:ring-4 group-hover:border-gray-300"
            value={searchTerm}
            onChange={(e) => updateSearchParam("search", e.target.value)}
          />
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary"
          />
        </div>
      </div>

      <div className="flex min-w-[200px] flex-col gap-2">
        <span className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          <Filter size={12} className="mb-0.5 mr-1 inline" /> Filter by
        </span>
        <select
          className="focus:ring-primary/10 h-12 w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white/50 bg-[length:1em_1em] bg-[right_1rem_center] bg-no-repeat px-4 py-2 text-sm text-gray-700 shadow-sm outline-none backdrop-blur-sm transition-all duration-300 hover:border-gray-300 focus:border-primary focus:ring-4"
          value={timeFilter}
          onChange={(e) => updateSearchParam("timeFilter", e.target.value)}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          }}
        >
          <option value="all">{t("allOrders")}</option>
          <option value="last3months">{t("last3Months")}</option>
        </select>
      </div>
    </div>
  );
};
