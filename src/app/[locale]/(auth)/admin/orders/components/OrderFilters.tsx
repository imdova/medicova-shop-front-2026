"use client";

import React from "react";
import { Search, SlidersHorizontal, Download, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import Dropdown from "@/components/shared/DropDownMenu";
import DateRangeSelector from "@/components/forms/DateRangeSelector";
import { LanguageType } from "@/util/translations";

interface OrderFiltersProps {
  locale: LanguageType;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onFiltersOpen: () => void;
  onDateChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  onReset: () => void;
  filters: {
    seller: string;
    customer: string;
    category: string;
    brand: string;
    status: string;
  };
  onFilterChange: (type: string, value: string) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  locale,
  searchQuery,
  setSearchQuery,
  onSearch,
  onFiltersOpen,
  onDateChange,
  onReset,
  filters,
  onFilterChange,
}) => {
  const t = useTranslations("admin");
  const isArabic = locale === "ar";

  const filterOptions = {
    seller: [
      { id: "all", name: { en: "All Sellers", ar: "كل البائعين" } },
      { id: "brandova", name: { en: "Brandova", ar: "Brandova" } },
      { id: "softmart", name: { en: "SoftMart", ar: "SoftMart" } },
    ],
    customer: [
      { id: "all", name: { en: "All Customers", ar: "كل العملاء" } },
      { id: "ahmed", name: { en: "Ahmed Mohamed", ar: "Ahmed Mohamed" } },
    ],
    category: [
      { id: "all", name: { en: "All Category", ar: "كل الفئات" } },
      { id: "visa", name: { en: "Visa", ar: "Visa" } },
    ],
    brand: [{ id: "all", name: { en: "All Brands", ar: "كل الماركات" } }],
    status: [{ id: "all", name: { en: "All", ar: "الكل" } }],
  };

  return (
    <div className="mb-8 space-y-6 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Date Selector */}
        <div className="w-full lg:w-auto">
          <DateRangeSelector
            onDateChange={onDateChange}
            formatString="MM/dd/yyyy"
            className="w-full !rounded-2xl !border-gray-100 !bg-gray-50/50"

          />
        </div>

        {/* Global Search */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="focus:border-primary/30 focus:ring-primary/5 h-12 w-full rounded-2xl border border-gray-100 bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:bg-white focus:ring-4"
            />
          </div>
          <button
            onClick={onSearch}
            className="shadow-primary/20 flex h-12 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:brightness-110 active:scale-95"
          >
            {t("showData")}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onFiltersOpen}
            className="flex h-12 items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50/30 px-4 text-sm font-semibold text-gray-600 transition-all duration-300 hover:bg-white hover:text-primary hover:shadow-md"
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline">{t("moreFilters")}</span>
          </button>
          <button className="flex h-12 items-center gap-2 rounded-2xl border border-gray-100 bg-emerald-50 px-4 text-sm font-bold text-emerald-600 transition-all duration-300 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-200">
            <Download size={18} />
            <span className="hidden sm:inline">{t("download")}</span>
          </button>
          <button
            onClick={onReset}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-100 bg-rose-50 text-rose-500 transition-all duration-300 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-200"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Advanced Filters Grid */}
      <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-4 md:grid-cols-3 lg:grid-cols-5">
        {Object.entries(filterOptions).map(([key, options]) => (
          <div key={key} className="space-y-1.5">
            <label className="pl-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {t(`filterLabels.${key}`)}
            </label>
            <Dropdown
              options={options}
              selected={filters[key as keyof typeof filters]}
              onSelect={(value) => onFilterChange(key, value.toString())}

              className="!h-10 !rounded-xl !border-gray-50 !bg-gray-50/50 !text-xs font-medium"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderFilters;
