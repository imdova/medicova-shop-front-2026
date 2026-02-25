"use client";

import React from "react";
import { Search, Filter, RotateCcw, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageType } from "@/util/translations";

interface InventoryFiltersProps {
  locale: LanguageType;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleFilters: () => void;
  onReset: () => void;
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  locale,
  searchQuery,
  onSearchChange,
  onToggleFilters,
  onReset,
}) => {
  const t = useTranslations("admin");
  const isRTL = locale === "ar";

  return (
    <div className="mb-8 flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
            <Filter size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{t("filters")}</h3>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {t("quickFilters")}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:max-w-4xl lg:justify-end">
          <div className="relative flex-1">
            <Search
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${isRTL ? "right-4" : "left-4"}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className={`h-12 w-full rounded-2xl border border-gray-100 bg-gray-50/50 text-sm outline-none transition-all duration-300 focus:border-indigo-500/30 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 ${isRTL ? "pl-4 pr-11" : "pl-11 pr-4"}`}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onToggleFilters}
              className="flex h-12 items-center gap-2 rounded-2xl border border-gray-100 bg-white px-6 text-sm font-bold text-gray-600 transition-all duration-300 hover:bg-gray-50 hover:text-indigo-500 hover:shadow-md"
            >
              <Filter size={18} />
              <span className="hidden sm:inline">{t("moreFilters")}</span>
            </button>
            <button
              onClick={onReset}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 transition-all duration-300 hover:bg-gray-50 hover:text-rose-500 hover:shadow-md"
            >
              <RotateCcw size={18} />
            </button>
            <button className="flex h-12 items-center gap-2 rounded-2xl border border-gray-100 bg-emerald-50 px-4 text-sm font-bold text-emerald-600 transition-all duration-300 hover:bg-emerald-600 hover:text-white hover:shadow-lg">
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
