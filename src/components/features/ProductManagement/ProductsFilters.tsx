"use client";

import { LanguageType } from "@/util/translations";
import { ActiveFilterChips, FilterChip } from "./ActiveFilterChips";
import { ProductsFilterGrid } from "./ProductsFilterGrid";
import { ProductsSearchToolbar } from "./ProductsSearchToolbar";
import { ProductManagementViewState, ProductManagementActions } from "./types";

interface ProductsFiltersProps {
  state: ProductManagementViewState;
  actions: ProductManagementActions;
}

function getDateLabel(dateFilter: string, isAr: boolean): string {
  if (dateFilter === "7") return isAr ? "آخر 7 أيام" : "Last 7 days";
  if (dateFilter === "30") return isAr ? "آخر 30 يومًا" : "Last 30 days";
  if (dateFilter === "90") return isAr ? "آخر 90 يومًا" : "Last 90 days";
  if (dateFilter === "no-date") return isAr ? "بدون تاريخ" : "No date";
  return "";
}

function buildFilterChips(
  state: ProductManagementViewState,
  actions: ProductManagementActions,
  showSellerFilter: boolean,
): FilterChip[] {
  const { isAr, filters } = state;
  return [
    { key: "search", label: isAr ? "بحث" : "Search", value: filters.searchQuery, clear: () => actions.setSearchQuery("") },
    ...(showSellerFilter
      ? [{ key: "seller", label: isAr ? "البائع" : "Seller", value: filters.sellerFilter, clear: () => actions.setSellerFilter("") }]
      : []),
    { key: "category", label: isAr ? "الفئة" : "Category", value: filters.categoryFilter, clear: () => actions.setCategoryFilter("") },
    { key: "subcategory", label: isAr ? "الفئة الفرعية" : "Subcategory", value: filters.subCategoryFilter, clear: () => actions.setSubCategoryFilter("") },
    { key: "childCategory", label: isAr ? "الفئة الفرعية للطفل" : "Child Category", value: filters.childCategoryFilter, clear: () => actions.setChildCategoryFilter("") },
    { key: "brand", label: isAr ? "البراند" : "Brand", value: filters.brandFilter, clear: () => actions.setBrandFilter("") },
    {
      key: "status",
      label: isAr ? "الحالة" : "Status",
      value: filters.approvalFilter === "approved" ? (isAr ? "معتمد" : "Approved") : filters.approvalFilter === "pending" ? (isAr ? "قيد الانتظار" : "Pending") : "",
      clear: () => actions.setApprovalFilter(""),
    },
    {
      key: "publish",
      label: isAr ? "النشر" : "Publish",
      value: filters.publishFilter === "Published" ? (isAr ? "منشور" : "Published") : filters.publishFilter === "Draft" ? (isAr ? "مسودة" : "Draft") : "",
      clear: () => actions.setPublishFilter(""),
    },
    {
      key: "date",
      label: isAr ? "التاريخ" : "Date",
      value: getDateLabel(filters.dateFilter, isAr),
      clear: () => actions.setDateFilter(""),
    },
  ].filter((chip) => chip.value);
}

export function ProductsFilters({ state, actions }: ProductsFiltersProps) {
  const showSellerFilter = state.mode === "admin";
  const hasActiveFilters = Object.values(state.filters).some(Boolean);
  const chips = buildFilterChips(state, actions, showSellerFilter);

  return (
    <div className="mb-6 rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-4">
        <ProductsSearchToolbar
          locale={state.locale as LanguageType}
          isAr={state.isAr}
          totalProducts={state.stats.totalProducts}
          filteredCount={state.filteredProducts.length}
          searchQuery={state.filters.searchQuery}
          onSearchChange={actions.setSearchQuery}
          viewMode={state.viewMode}
          onViewModeChange={actions.setViewMode}
          hasActiveFilters={hasActiveFilters}
          onClearAll={actions.clearAllFilters}
        />

        <ProductsFilterGrid
          isAr={state.isAr}
          hasActiveFilters={hasActiveFilters}
          showSellerFilter={showSellerFilter}
          sellersList={state.lookups.sellersList}
          categoryMap={state.lookups.categoryMap}
          subCategoryMap={state.lookups.subCategoryMap}
          childCategoryMap={state.lookups.childCategoryMap}
          brandMap={state.lookups.brandMap}
          locale={state.locale as "en" | "ar"}
          sellerFilter={state.filters.sellerFilter}
          categoryFilter={state.filters.categoryFilter}
          subCategoryFilter={state.filters.subCategoryFilter}
          childCategoryFilter={state.filters.childCategoryFilter}
          brandFilter={state.filters.brandFilter}
          approvalFilter={state.filters.approvalFilter}
          publishFilter={state.filters.publishFilter}
          dateFilter={state.filters.dateFilter}
          onSellerChange={actions.setSellerFilter}
          onCategoryChange={actions.setCategoryFilter}
          onSubCategoryChange={actions.setSubCategoryFilter}
          onChildCategoryChange={actions.setChildCategoryFilter}
          onBrandChange={actions.setBrandFilter}
          onApprovalChange={actions.setApprovalFilter}
          onPublishChange={actions.setPublishFilter}
          onDateChange={actions.setDateFilter}
          onClearAll={actions.clearAllFilters}
        />

        <ActiveFilterChips isAr={state.isAr} chips={chips} />
      </div>
    </div>
  );
}
