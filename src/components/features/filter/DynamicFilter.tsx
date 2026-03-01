"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, List, RotateCcw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageType } from "@/util/translations";
import Dropdown from "@/components/shared/DropDownMenu";
import { Filters } from "./FilterDrawer";
import {
  DropdownFilter,
  DynamicFilterItem,
  FilterOption,
} from "@/types/filters";
import { FilterDrawerGroup } from "@/types";
import { useLocale, useTranslations } from "next-intl";
import { LocalizedTitle } from "@/types/language";

type TranslationValue = string | Record<string, string>;

interface DynamicFilterProps {
  // Configuration props
  showSearch?: boolean;
  showQuickFilters?: boolean;
  showStatusCards?: boolean;
  showViewToggle?: boolean;
  showActionButtons?: boolean;
  showMoreFilters?: boolean;

  // Filter visibility control
  visibleFilters?: string[];

  // Collapsible behavior
  defaultExpanded?: boolean;
  collapsible?: boolean;

  // Quick filters grid control
  quickFiltersGridCols?: string;

  // External controls
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;

  // Your existing props
  drawerFilters: FilterDrawerGroup[];
  statusCounts?: Record<string, number>;
  filtersOpen: boolean;

  // Your existing handlers
  setFiltersOpen: (open: boolean) => void;

  // Dynamic filters
  filters?: DynamicFilterItem[];
}

const DynamicFilter = ({
  showQuickFilters = true,
  showStatusCards = true,
  showViewToggle = true,
  showActionButtons = true,
  showMoreFilters = true,
  visibleFilters = ["quick", "status", "actions"], // Simplified defaults for better integration
  defaultExpanded = true,
  collapsible = true,
  quickFiltersGridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  isOpen: externalIsOpen,
  onToggle,
  drawerFilters,
  statusCounts,
  filtersOpen,
  setFiltersOpen,
  filters = [],
}: DynamicFilterProps) => {
  const locale = useLocale() as LanguageType;
  const isRTL = locale === "ar";
  const t = useTranslations("filter");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [internalIsOpen, setInternalIsOpen] = useState(defaultExpanded);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    const newState = !isOpen;
    if (onToggle) {
      onToggle(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  const setQuery = (key: string, value: string | null | string[]) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (Array.isArray(value)) {
      if (value.length > 0) newSearchParams.set(key, value.join(","));
      else newSearchParams.delete(key);
    } else if (value) {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  const resetFilters = () => {
    router.push(window.location.pathname, { scroll: false });
  };

  const renderFilterInput = (filter: DynamicFilterItem) => {
    const commonInputClass =
      "h-12 w-full rounded-xl border border-slate-100 bg-white/50 px-4 text-xs font-bold text-gray-900 outline-none transition-all focus:border-[#31533A]/20 focus:bg-white focus:ring-4 focus:ring-emerald-900/5";

    switch (filter.type) {
      case "dropdown":
        const dropdownValue = searchParams.get(filter.id) || "";
        return (
          <Dropdown
            options={filter.options}
            selected={dropdownValue}
            onSelect={(value) => setQuery(filter.id, value.toString())}
            placeholder={`${t("select")} ${filter.label[locale as keyof LocalizedTitle]}`}
          />
        );
      case "search":
        const searchValue = searchParams.get(filter.id) || "";
        return (
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setQuery(filter.id, e.target.value)}
              placeholder={`${t("search")} ${filter.label[locale as keyof LocalizedTitle]}`}
              className={commonInputClass + (isRTL ? " pr-11" : " pl-11")}
            />
            <Search
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${isRTL ? "right-4" : "left-4"}`}
              size={15}
            />
          </div>
        );
      case "number":
        return (
          <input
            type="number"
            value={searchParams.get(filter.id) || ""}
            onChange={(e) => setQuery(filter.id, e.target.value)}
            placeholder={filter.label[locale as keyof LocalizedTitle]}
            className={commonInputClass}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="relative mb-6 rounded-[2.5rem] border border-white/60 bg-white/40 p-6 shadow-2xl shadow-slate-200/40 backdrop-blur-xl"
        >
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="text-xl font-black tracking-tight text-gray-900">
                  {t("allFilters")}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#B39371]">
                  {t("advancedOptions")}
                </p>
              </div>
              {collapsible && (
                <button
                  onClick={handleToggle}
                  className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-gray-400 transition-all hover:bg-rose-50 hover:text-rose-500 hover:shadow-md"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {showQuickFilters && visibleFilters.includes("quick") && (
              <div className={`grid gap-6 ${quickFiltersGridCols}`}>
                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-2 px-1">
                    <h3 className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                      {filter.label[locale as keyof LocalizedTitle]}
                    </h3>
                    {renderFilterInput(filter)}
                  </div>
                ))}
              </div>
            )}

            {showStatusCards && visibleFilters.includes("status") && (
              <div className="flex flex-col gap-6 border-t border-white/40 pt-4">
                <div className="flex flex-wrap items-center gap-3">
                  {(
                    (
                      filters.find((f) => f.id === "status") as
                        | DropdownFilter
                        | undefined
                    )?.options ?? []
                  ).map((option: FilterOption) => {
                    const isActive = searchParams.get("status") === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setQuery("status", option.id)}
                        className={`group flex items-center gap-3 rounded-2xl border px-5 py-3 transition-all duration-300 ${
                          isActive
                            ? "border-[#31533A]/20 bg-[#31533A] text-white shadow-lg shadow-emerald-900/10"
                            : "border-slate-100 bg-white text-gray-500 hover:border-[#31533A]/20 hover:text-gray-900 hover:shadow-md"
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-wider">
                          {option.name[locale as keyof LocalizedTitle]}
                        </span>
                        <div
                          className={`flex h-6 min-w-[24px] items-center justify-center rounded-lg px-2 text-[10px] font-black transition-colors ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-50 text-gray-400 group-hover:bg-[#31533A]/10 group-hover:text-[#31533A]"
                          }`}
                        >
                          {statusCounts?.[option.id] || 0}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showActionButtons && visibleFilters.includes("actions") && (
                  <div className="flex flex-wrap items-center justify-between gap-6 border-t border-white/20 pt-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={resetFilters}
                        className="flex h-12 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-6 text-xs font-black uppercase tracking-widest text-gray-600 transition-all hover:bg-rose-50 hover:text-rose-500 hover:shadow-md"
                      >
                        <RotateCcw size={14} />
                        {t("reset")}
                      </button>

                      {showMoreFilters && (
                        <button
                          onClick={() => setFiltersOpen(true)}
                          className="flex h-12 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-6 text-xs font-black uppercase tracking-widest text-[#B39371] transition-all hover:bg-amber-50 hover:shadow-md"
                        >
                          <List size={14} />
                          {t("browseAllFilters")}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <button className="flex h-14 items-center rounded-[1.25rem] bg-[#31533A] px-10 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.02] hover:bg-[#26412d] active:scale-[0.98]">
                        {t("showData")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {showMoreFilters && (
            <Filters
              filtersData={drawerFilters}
              isOpen={filtersOpen}
              onClose={() => setFiltersOpen(false)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DynamicFilter;
