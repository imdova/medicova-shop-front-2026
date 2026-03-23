"use client";

import { ProductManagementMode } from "./types";
import { useProductManagement } from "./useProductManagement";
import { ProductsHeader } from "./ProductsHeader";
import { ProductsStats } from "./ProductsStats";
import { ProductsFilters } from "./ProductsFilters";
import { ProductsContent } from "./ProductsContent";
import { DeleteProductModal } from "./DeleteProductModal";
import { useAppLocale } from "@/hooks/useAppLocale";

interface ProductsManagementPageProps {
  mode: ProductManagementMode;
}

export default function ProductsManagementPage({
  mode,
}: ProductsManagementPageProps) {
  const locale = useAppLocale();
  const model = useProductManagement({ mode, locale });

  const state = {
    locale: model.locale,
    isAr: model.isAr,
    mode: model.mode,
    loading: model.loading,
    products: model.products,
    filteredProducts: model.filteredProducts,
    paginatedProducts: model.paginatedProducts,
    currentPage: model.currentPage,
    totalPages: model.totalPages,
    itemsPerPage: model.itemsPerPage,
    viewMode: model.viewMode,
    approvingId: model.approvingId,
    duplicatingId: model.duplicatingId,
    isDeleting: model.isDeleting,
    productToDelete: model.productToDelete,
    showDeleteConfirm: model.showDeleteConfirm,
    publishStatus: model.publishStatus,
    filters: model.filters,
    lookups: model.lookups,
    stats: model.stats,
    routes: model.routes,
  };

  const actions = {
    setViewMode: model.setViewMode,
    setSearchQuery: model.setSearchQuery,
    setSellerFilter: model.setSellerFilter,
    setCategoryFilter: model.setCategoryFilter,
    setSubCategoryFilter: model.setSubCategoryFilter,
    setChildCategoryFilter: model.setChildCategoryFilter,
    setBrandFilter: model.setBrandFilter,
    setApprovalFilter: model.setApprovalFilter,
    setPublishFilter: model.setPublishFilter,
    setDateFilter: model.setDateFilter,
    clearAllFilters: model.clearAllFilters,
    setPublishValue: model.setPublishValue,
    requestDelete: model.requestDelete,
    closeDeleteModal: model.closeDeleteModal,
    confirmDelete: model.confirmDelete,
    toggleApprove: model.toggleApprove,
    duplicateProduct: model.duplicateProduct,
  };

  return (
    <div className="animate-in fade-in min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 duration-700">
      <div className="mx-auto max-w-[1440px] min-w-0 p-4 md:p-8">
        <ProductsHeader
          isAr={state.isAr}
          createPath={state.routes.createPath}
        />

        <ProductsStats locale={state.locale} isAr={state.isAr} stats={state.stats} />

        <ProductsFilters state={state} actions={actions} />

        <ProductsContent state={state} actions={actions} />
      </div>

      <DeleteProductModal
        isAr={state.isAr}
        isOpen={state.showDeleteConfirm}
        isDeleting={state.isDeleting}
        product={state.productToDelete}
        onClose={actions.closeDeleteModal}
        onConfirm={actions.confirmDelete}
      />
    </div>
  );
}
