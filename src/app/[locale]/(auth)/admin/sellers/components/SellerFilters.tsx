"use client";

import React from "react";
import {
  Search,
  Filter,
  RotateCcw,
  Download,
  LayoutGrid,
  List,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageType } from "@/util/translations";
import DateRangeSelector from "@/components/forms/DateRangeSelector";
import { motion, AnimatePresence } from "framer-motion";

interface SellerFiltersProps {
  locale: LanguageType;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleFilters: () => void;
  onDateChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  onReset: () => void;
}

const SellerFilters: React.FC<SellerFiltersProps> = ({
  locale,
  searchQuery,
  onSearchChange,
  onToggleFilters,
  onDateChange,
  onReset,
}) => {
  const t = useTranslations("admin");
  const isRTL = locale === "ar";

  return (
    <div className="relative mb-8 rounded-[2.5rem] border border-white bg-white/80 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-xl sm:p-8">
      {/* Dynamic background element */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-50/50 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-50/50 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
        {/* Search Input - Main Focus */}
        <div className="group relative flex-1">
          <Search
            className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-[#31533A] ${
              isRTL ? "right-5" : "left-5"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={`h-14 w-full rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-gray-900 outline-none transition-all duration-300 focus:border-[#31533A]/20 focus:bg-white focus:ring-4 focus:ring-emerald-900/5 ${
              isRTL ? "pl-6 pr-14" : "pl-14 pr-6"
            }`}
          />
        </div>

        {/* Filters and Actions Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Selector - Adjusted for height consistency */}
          <div className="min-w-[200px] flex-1 sm:flex-initial">
            <DateRangeSelector
              onDateChange={onDateChange}
              formatString="MMM dd, yyyy"
              className="!h-14 !w-full !rounded-2xl !border-slate-100 !bg-slate-50/50 !px-4 !text-sm !font-bold !transition-all hover:!border-slate-200 hover:!bg-white"

            />
          </div>

          {/* More Filters Toggle */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggleFilters}
            className="flex h-14 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-6 text-sm font-black text-gray-700 shadow-lg shadow-slate-200/50 transition-all hover:border-[#31533A]/20 hover:text-[#31533A] active:shadow-inner"
          >
            <Filter size={18} />
            <span className="hidden sm:inline">{t("filters")}</span>
          </motion.button>

          {/* Secondary Actions (Download, Reset) */}
          <div className="flex h-14 items-center gap-2 rounded-2xl bg-slate-900/[0.03] p-1.5 ring-1 ring-slate-900/[0.05]">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#B39371] shadow-sm transition-all hover:bg-emerald-50 hover:text-[#31533A] hover:shadow-md"
              title={t("download")}
            >
              <Download size={18} />
            </motion.button>

            <div className="mx-1 h-6 w-px bg-slate-200" />

            <motion.button
              whileHover={{ scale: 1.05, rotate: -90 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReset}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-500 hover:shadow-md"
              title={t("reset")}
            >
              <RotateCcw size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerFilters;
