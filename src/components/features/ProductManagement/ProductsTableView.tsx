"use client";

import Link from "next/link";
import { ApiProduct } from "@/services/productService";
import { LanguageType } from "@/util/translations";
import { Pagination } from "@/components/shared/Pagination";
import { ProductsTableRow } from "./ProductsTableRow";
import { ApprovalSwitch } from "./ApprovalSwitch";
import { PublishDropdown } from "./PublishDropdown";
import { ProductRowActions } from "./ProductRowActions";
import {
  formatCreatedAt,
  formatCurrency,
  formatNumber,
  formatPrice,
  getCategoryName,
  getSellerName,
  getStockStatus,
} from "./utils";
import { ProductManagementMode } from "./types";

interface ProductsTableViewProps {
  mode: ProductManagementMode;
  items: ApiProduct[];
  locale: LanguageType;
  isAr: boolean;
  sellerMap: Record<string, string>;
  categoryMap: Record<string, { en: string; ar: string }>;
  subCategoryMap: Record<string, { en: string; ar: string }>;
  childCategoryMap: Record<string, { en: string; ar: string }>;
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

function getProductPrice(item: ApiProduct): number | string | null {
  const salePrice =
    item.sale_price ??
    item.salePrice ??
    item.pricing?.salePrice ??
    item.pricing?.sale_price;
  const originalPrice =
    item.price ??
    item.original_price ??
    item.originalPrice ??
    item.pricing?.originalPrice ??
    item.pricing?.original_price ??
    item.del_price;
  return salePrice && Number(salePrice) > 0
    ? salePrice
    : (originalPrice ?? null);
}

export function ProductsTableView({
  mode,
  items,
  locale,
  isAr,
  sellerMap,
  categoryMap,
  subCategoryMap,
  childCategoryMap,
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
}: ProductsTableViewProps) {
  return (
    <>
      <div className="space-y-3 p-3 lg:hidden">
        {items.map((item) => {
          const name = isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr;
          const sku = item.sku ?? item.identity?.sku ?? item._id.slice(-6).toUpperCase();
          const stock = getStockStatus(item);
          const orders = item.orders ?? item.total_orders ?? item.totalOrders;
          const revenue = item.revenue ?? item.total_revenue ?? item.totalRevenue;
          const price = getProductPrice(item);
          const sellerName = getSellerName(item, sellerMap);
          const categoryName = getCategoryName(item, locale, categoryMap);

          return (
            <article key={item._id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={detailsPath(item._id)}
                    className="truncate text-sm font-bold text-slate-900 hover:text-primary"
                  >
                    {name || "—"}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">SKU: {sku}</p>
                  {mode === "admin" ? (
                    <p className="mt-1 truncate text-xs text-slate-600">
                      {isAr ? "البائع" : "Seller"}: {sellerName}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0">
                  <ProductRowActions
                    isAr={isAr}
                    editPath={editPath(item._id)}
                    onDuplicate={() => onDuplicate(item)}
                    isDuplicating={duplicatingId === item._id}
                    onDelete={() => onDelete(item)}
                  />
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-slate-500">{isAr ? "الفئة" : "Category"}</p>
                  <p className="truncate font-semibold text-slate-800">{categoryName || "—"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-slate-500">{isAr ? "السعر" : "Price"}</p>
                  <p className="font-semibold text-slate-800">
                    {price != null ? formatPrice(price, locale) : "—"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-slate-500">{isAr ? "الطلبات" : "Orders"}</p>
                  <p className="font-semibold text-slate-800">
                    {orders != null ? formatNumber(orders, locale) : "—"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-slate-500">{isAr ? "الإيراد" : "Revenue"}</p>
                  <p className="font-semibold text-slate-800">
                    {revenue != null ? formatCurrency(revenue, locale) : "—"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-slate-500">{isAr ? "تاريخ الإنشاء" : "Created at"}</p>
                  <p className="font-semibold text-slate-800">
                    {formatCreatedAt(item.createdAt, locale)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-slate-500">{isAr ? "المخزون" : "Stock"}</p>
                  <p className="font-semibold text-slate-800">{stock.label}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ApprovalSwitch
                  product={item}
                  isDisabled={approvingId === item._id}
                  onToggle={onToggleApprove}
                />
                <PublishDropdown
                  value={publishStatus[item._id] ?? "Published"}
                  onChange={(value) => onSetPublish(item._id, value)}
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden w-full max-w-full overflow-x-auto lg:block">
        <table className="w-full min-w-[1200px] text-left text-sm xl:min-w-[1400px]">
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
                isDuplicating={duplicatingId === item._id}
                detailsPath={detailsPath(item._id)}
                editPath={editPath(item._id)}
                onSetPublish={(value) => onSetPublish(item._id, value)}
                onToggleApprove={onToggleApprove}
                onDuplicate={onDuplicate}
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
