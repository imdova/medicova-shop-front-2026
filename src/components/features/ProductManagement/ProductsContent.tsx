"use client";

import { ProductManagementActions, ProductManagementViewState } from "./types";
import { ProductsEmptyState } from "./ProductsEmptyState";
import { ProductsGridView } from "./ProductsGridView";
import { ProductsLoading } from "./ProductsLoading";
import { ProductsTableView } from "./ProductsTableView";

interface ProductsContentProps {
  state: ProductManagementViewState;
  actions: ProductManagementActions;
}

export function ProductsContent({ state, actions }: ProductsContentProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm backdrop-blur-sm">
      {state.loading ? (
        <ProductsLoading />
      ) : state.filteredProducts.length === 0 ? (
        <ProductsEmptyState
          isAr={state.isAr}
          createPath={state.routes.createPath}
        />
      ) : state.viewMode === "grid" ? (
        <ProductsGridView
          items={state.paginatedProducts}
          locale={state.locale}
          isAr={state.isAr}
          categoryMap={state.lookups.categoryMap}
          publishStatus={state.publishStatus}
          approvingId={state.approvingId}
          duplicatingId={state.duplicatingId}
          currentPage={state.currentPage}
          totalItems={state.filteredProducts.length}
          itemsPerPage={state.itemsPerPage}
          detailsPath={state.routes.detailsPath}
          editPath={state.routes.editPath}
          onSetPublish={actions.setPublishValue}
          onToggleApprove={actions.toggleApprove}
          onDuplicate={actions.duplicateProduct}
          onDelete={actions.requestDelete}
        />
      ) : (
        <ProductsTableView
          mode={state.mode}
          items={state.paginatedProducts}
          locale={state.locale}
          isAr={state.isAr}
          sellerMap={state.lookups.sellerMap}
          categoryMap={state.lookups.categoryMap}
          subCategoryMap={state.lookups.subCategoryMap}
          childCategoryMap={state.lookups.childCategoryMap}
          publishStatus={state.publishStatus}
          approvingId={state.approvingId}
          duplicatingId={state.duplicatingId}
          currentPage={state.currentPage}
          totalItems={state.filteredProducts.length}
          itemsPerPage={state.itemsPerPage}
          detailsPath={state.routes.detailsPath}
          editPath={state.routes.editPath}
          onSetPublish={actions.setPublishValue}
          onToggleApprove={actions.toggleApprove}
          onDuplicate={actions.duplicateProduct}
          onDelete={actions.requestDelete}
        />
      )}
    </div>
  );
}
