"use client";

import { LayoutGrid, LayoutList, Search } from "lucide-react";
import { LanguageType } from "@/util/translations";
import { formatNumber } from "./utils";
import { ProductViewMode } from "./types";

interface ProductsSearchToolbarProps {
  locale: LanguageType;
  isAr: boolean;
  totalProducts: number;
  filteredCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: ProductViewMode;
  onViewModeChange: (mode: ProductViewMode) => void;
}

export function ProductsSearchToolbar({
  locale,
  isAr,
  totalProducts,
  filteredCount,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: ProductsSearchToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-slate-900">
          <span className="text-sm font-bold">{isAr ? "كل المنتجات" : "All Products"}</span>
          <span className="text-sm font-bold">( {formatNumber(totalProducts, locale)} )</span>
        </div>

        <div className="relative min-w-[240px] flex-1">
          <Search
            className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${isAr ? "right-3" : "left-3"}`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={isAr ? "البحث بالاسم أو SKU..." : "Search by name or SKU..."}
            className={`w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isAr ? "pl-4 pr-10" : "pl-10 pr-4"}`}
          />
        </div>

        <p className="shrink-0 text-xs font-medium text-slate-500">
          {isAr ? "النتائج" : "Results"}: <span className="font-semibold text-slate-700">{formatNumber(filteredCount, locale)}</span>
        </p>

        <div className="flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
            aria-label={isAr ? "عرض القائمة" : "List view"}
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
            aria-label={isAr ? "عرض الشبكة" : "Grid view"}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
