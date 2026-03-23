"use client";

import { Seller } from "@/services/sellerService";
import { X } from "lucide-react";
import {
  ProductApprovalFilter,
  ProductDateFilter,
  ProductPublishFilter,
} from "./types";

interface ProductsFilterGridProps {
  isAr: boolean;
  hasActiveFilters: boolean;
  showSellerFilter: boolean;
  sellersList: Seller[];
  categoryMap: Record<string, { en: string; ar: string }>;
  subCategoryMap: Record<string, { en: string; ar: string }>;
  childCategoryMap: Record<string, { en: string; ar: string }>;
  locale: "en" | "ar";
  sellerFilter: string;
  categoryFilter: string;
  subCategoryFilter: string;
  childCategoryFilter: string;
  brandFilter: string;
  approvalFilter: ProductApprovalFilter;
  publishFilter: ProductPublishFilter;
  dateFilter: ProductDateFilter;
  brandMap: Record<string, { en: string; ar: string }>;
  onSellerChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubCategoryChange: (value: string) => void;
  onChildCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onApprovalChange: (value: ProductApprovalFilter) => void;
  onPublishChange: (value: ProductPublishFilter) => void;
  onDateChange: (value: ProductDateFilter) => void;
  onClearAll: () => void;
}

const labelClass = "text-xs font-semibold text-slate-700";
const selectClass =
  "rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-[13px] text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export function ProductsFilterGrid({
  isAr,
  hasActiveFilters,
  showSellerFilter,
  sellersList,
  categoryMap,
  subCategoryMap,
  childCategoryMap,
  locale,
  sellerFilter,
  categoryFilter,
  subCategoryFilter,
  childCategoryFilter,
  brandFilter,
  approvalFilter,
  publishFilter,
  dateFilter,
  brandMap,
  onSellerChange,
  onCategoryChange,
  onSubCategoryChange,
  onChildCategoryChange,
  onBrandChange,
  onApprovalChange,
  onPublishChange,
  onDateChange,
  onClearAll,
}: ProductsFilterGridProps) {
  const gridClass = showSellerFilter
    ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-9"
    : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8";

  return (
    <div className={gridClass}>
      {showSellerFilter ? (
        <div className="flex flex-col gap-1">
          <label className={`${labelClass} ${isAr ? "text-right" : ""}`}>{isAr ? "البائع" : "Seller"}</label>
          <select value={sellerFilter} onChange={(e) => onSellerChange(e.target.value)} className={selectClass}>
            <option value="">{isAr ? "الكل" : "All"}</option>
            {sellersList.map((seller) => (
              <option key={seller.id} value={seller.name}>
                {seller.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <label className={`${labelClass} ${isAr ? "text-right" : ""}`}>{isAr ? "الفئة" : "Category"}</label>
        <select value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)} className={selectClass}>
          <option value="">{isAr ? "الكل" : "All"}</option>
          {Object.entries(categoryMap).map(([id, title]) => (
            <option key={id} value={title[locale] || title.en}>
              {title[locale] || title.en}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={`${labelClass} ${isAr ? "text-right" : ""}`}>{isAr ? "الفئة الفرعية" : "Subcategory"}</label>
        <select value={subCategoryFilter} onChange={(e) => onSubCategoryChange(e.target.value)} className={selectClass}>
          <option value="">{isAr ? "الكل" : "All"}</option>
          {Object.entries(subCategoryMap).map(([id, title]) => (
            <option key={id} value={title[locale] || title.en}>
              {title[locale] || title.en}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={`${labelClass} ${isAr ? "text-right" : ""}`}>{isAr ? "الفئة الفرعية للطفل" : "Child Category"}</label>
        <select value={childCategoryFilter} onChange={(e) => onChildCategoryChange(e.target.value)} className={selectClass}>
          <option value="">{isAr ? "الكل" : "All"}</option>
          {Object.entries(childCategoryMap).map(([id, title]) => (
            <option key={id} value={title[locale] || title.en}>
              {title[locale] || title.en}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={`${labelClass} ${isAr ? "text-right" : ""}`}>{isAr ? "البراند" : "Brand"}</label>
        <select value={brandFilter} onChange={(e) => onBrandChange(e.target.value)} className={selectClass}>
          <option value="">{isAr ? "الكل" : "All"}</option>
          {Object.entries(brandMap).map(([id, title]) => (
            <option key={id} value={title[locale] || title.en}>
              {title[locale] || title.en}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={`${labelClass} ${isAr ? "text-right" : ""}`}>{isAr ? "الحالة" : "Status"}</label>
        <select value={approvalFilter} onChange={(e) => onApprovalChange(e.target.value as ProductApprovalFilter)} className={selectClass}>
          <option value="">{isAr ? "الكل" : "All"}</option>
          <option value="approved">{isAr ? "معتمد" : "Approved"}</option>
          <option value="pending">{isAr ? "قيد الانتظار" : "Pending"}</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={`${labelClass} ${isAr ? "text-right" : ""}`}>{isAr ? "النشر" : "Publish"}</label>
        <select value={publishFilter} onChange={(e) => onPublishChange(e.target.value as ProductPublishFilter)} className={selectClass}>
          <option value="">{isAr ? "الكل" : "All"}</option>
          <option value="Published">{isAr ? "منشور" : "Published"}</option>
          <option value="Draft">{isAr ? "مسودة" : "Draft"}</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className={`${labelClass} ${isAr ? "text-right" : ""}`}>{isAr ? "التاريخ" : "Date"}</label>
        <select value={dateFilter} onChange={(e) => onDateChange(e.target.value as ProductDateFilter)} className={selectClass}>
          <option value="">{isAr ? "الكل" : "All"}</option>
          <option value="7">{isAr ? "آخر 7 أيام" : "Last 7 days"}</option>
          <option value="30">{isAr ? "آخر 30 يومًا" : "Last 30 days"}</option>
          <option value="90">{isAr ? "آخر 90 يومًا" : "Last 90 days"}</option>
          <option value="no-date">{isAr ? "بدون تاريخ" : "No date"}</option>
        </select>
      </div>

      <div className="hidden xl:block"></div>
    </div>
  );
}
