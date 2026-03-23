"use client";

import { ApiProduct } from "@/services/productService";
import { LanguageType } from "@/util/translations";
import { Pagination } from "@/components/shared/Pagination";
import { ProductGridCard } from "./ProductGridCard";

interface ProductsGridViewProps {
  items: ApiProduct[];
  locale: LanguageType;
  isAr: boolean;
  categoryMap: Record<string, { en: string; ar: string }>;
  publishStatus: Record<string, "Published" | "Draft">;
  approvingId: string | null;
  duplicatingId: string | null;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  detailsPath: (id: string) => string;
  editPath: (id: string) => string;
  onSetPublish: (id: string, value: "Published" | "Draft") => void;
  onToggleApprove: (item: ApiProduct) => void;
  onDuplicate: (item: ApiProduct) => void;
  onDelete: (item: ApiProduct) => void;
}

export function ProductsGridView({
  items,
  locale,
  isAr,
  categoryMap,
  publishStatus,
  approvingId,
  duplicatingId,
  currentPage,
  totalItems,
  itemsPerPage,
  detailsPath,
  editPath,
  onSetPublish,
  onToggleApprove,
  onDuplicate,
  onDelete,
}: ProductsGridViewProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <ProductGridCard
            key={item._id}
            item={item}
            locale={locale}
            isAr={isAr}
            categoryMap={categoryMap}
            publishValue={publishStatus[item._id] ?? "Published"}
            isApproving={approvingId === item._id}
            isDuplicating={duplicatingId === item._id}
            detailsPath={detailsPath(item._id)}
            editPath={editPath(item._id)}
            onSetPublish={(value) => onSetPublish(item._id, value)}
            onToggleApprove={onToggleApprove}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-5 py-3">
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </>
  );
}
