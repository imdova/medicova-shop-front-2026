"use client";

import { ApiProduct } from "@/services/productService";
import { LanguageType } from "@/util/translations";
import { Pagination } from "@/components/shared/Pagination";
import { ProductsTableRow } from "./ProductsTableRow";

interface ProductsTableViewProps {
  items: ApiProduct[];
  locale: LanguageType;
  isAr: boolean;
  sellerMap: Record<string, string>;
  categoryMap: Record<string, { en: string; ar: string }>;
  subCategoryMap: Record<string, { en: string; ar: string }>;
  childCategoryMap: Record<string, { en: string; ar: string }>;
  publishStatus: Record<string, "Published" | "Draft">;
  approvingId: string | null;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  detailsPath: (id: string) => string;
  editPath: (id: string) => string;
  onSetPublish: (id: string, value: "Published" | "Draft") => void;
  onToggleApprove: (item: ApiProduct) => void;
  onDelete: (item: ApiProduct) => void;
}

export function ProductsTableView({
  items,
  locale,
  isAr,
  sellerMap,
  categoryMap,
  subCategoryMap,
  childCategoryMap,
  publishStatus,
  approvingId,
  currentPage,
  totalItems,
  itemsPerPage,
  detailsPath,
  editPath,
  onSetPublish,
  onToggleApprove,
  onDelete,
}: ProductsTableViewProps) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-800">
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "المنتج" : "Product"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "تاريخ الإنشاء" : "Created at"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "البائع" : "Seller"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "الفئة" : "Category"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "الفئة الفرعية" : "Subcategory"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "الفئة الفرعية للطفل" : "Child Category"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "السعر" : "Price"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "الطلبات" : "Orders"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "الإيراد" : "Revenue"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "المخزون" : "Stock"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "الحالة" : "Status"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "النشر" : "Publish"}</th>
              <th className="whitespace-nowrap px-5 py-3.5">{isAr ? "إجراءات" : "Actions"}</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <ProductsTableRow
                key={item._id}
                item={item}
                locale={locale}
                isAr={isAr}
                sellerMap={sellerMap}
                categoryMap={categoryMap}
                subCategoryMap={subCategoryMap}
                childCategoryMap={childCategoryMap}
                publishValue={publishStatus[item._id] ?? "Published"}
                isApproving={approvingId === item._id}
                detailsPath={detailsPath(item._id)}
                editPath={editPath(item._id)}
                onSetPublish={(value) => onSetPublish(item._id, value)}
                onToggleApprove={onToggleApprove}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
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
