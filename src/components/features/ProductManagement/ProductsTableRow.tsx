"use client";

import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { ApiProduct } from "@/services/productService";
import { LanguageType } from "@/util/translations";
import { ApprovalSwitch } from "./ApprovalSwitch";
import { ProductRowActions } from "./ProductRowActions";
import { PublishDropdown } from "./PublishDropdown";
import {
  formatCreatedAt,
  formatCurrency,
  formatNumber,
  formatPrice,
  getCategoryName,
  getChildCategoryName,
  getInitials,
  getProductPrimaryImage,
  getSellerName,
  getStockStatus,
  getSubCategoryName,
} from "./utils";

interface ProductsTableRowProps {
  item: ApiProduct;
  locale: LanguageType;
  isAr: boolean;
  sellerMap: Record<string, string>;
  categoryMap: Record<string, { en: string; ar: string }>;
  subCategoryMap: Record<string, { en: string; ar: string }>;
  childCategoryMap: Record<string, { en: string; ar: string }>;
  publishValue: "Published" | "Draft";
  isApproving: boolean;
  isDuplicating: boolean;
  detailsPath: string;
  editPath: string;
  onSetPublish: (value: "Published" | "Draft") => void;
  onToggleApprove: (item: ApiProduct) => void;
  onDuplicate: (item: ApiProduct) => void;
  onDelete: (item: ApiProduct) => void;
}

function getProductPrice(item: ApiProduct): number | string | null {
  const salePrice =
    item.sale_price ?? item.salePrice ?? item.pricing?.salePrice ?? item.pricing?.sale_price;
  const originalPrice =
    item.price ?? item.original_price ?? item.originalPrice ?? item.pricing?.originalPrice ?? item.pricing?.original_price ?? item.del_price;
  return salePrice && Number(salePrice) > 0 ? salePrice : (originalPrice ?? null);
}

export function ProductsTableRow({
  item,
  locale,
  isAr,
  sellerMap,
  categoryMap,
  subCategoryMap,
  childCategoryMap,
  publishValue,
  isApproving,
  isDuplicating,
  detailsPath,
  editPath,
  onSetPublish,
  onToggleApprove,
  onDuplicate,
  onDelete,
}: ProductsTableRowProps) {
  const name = isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr;
  const sku = item.sku ?? item.identity?.sku ?? item._id.slice(-6).toUpperCase();
  const stock = getStockStatus(item);
  const orders = item.orders ?? item.total_orders ?? item.totalOrders;
  const revenue = item.revenue ?? item.total_revenue ?? item.totalRevenue;
  const price = getProductPrice(item);
  const image = getProductPrimaryImage(item);
  const sellerName = getSellerName(item, sellerMap);

  return (
    <tr className="border-b border-slate-50/80 transition-colors duration-150 hover:bg-slate-50/50">
      <td className="whitespace-nowrap px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/50">
            {image ? (
              <Image src={image} alt={name || ""} fill className="object-cover" sizes="44px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <Package className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <Link href={detailsPath} className="font-semibold text-slate-900 transition-colors hover:text-primary">
              {name || "—"}
            </Link>
            <p className="text-xs text-slate-500">SKU: {sku}</p>
          </div>
        </div>
      </td>

      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-600">{formatCreatedAt(item.createdAt, locale)}</td>
      <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200/70">
            {getInitials(sellerName)}
          </div>
          <span className="min-w-0 truncate">{sellerName}</span>
        </div>
      </td>

      <td className="whitespace-nowrap px-5 py-3.5"><span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100">{getCategoryName(item, locale, categoryMap) || "—"}</span></td>
      <td className="whitespace-nowrap px-5 py-3.5"><span className="inline-flex rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80">{getSubCategoryName(item, locale, subCategoryMap) || "—"}</span></td>
      <td className="whitespace-nowrap px-5 py-3.5"><span className="inline-flex rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80">{getChildCategoryName(item, locale, childCategoryMap) || "—"}</span></td>
      <td className="whitespace-nowrap px-5 py-3.5 font-medium tabular-nums text-slate-900">{price != null ? formatPrice(price, locale) : "—"}</td>
      <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-slate-700">{orders != null ? formatNumber(orders, locale) : "—"}</td>
      <td className="whitespace-nowrap px-5 py-3.5 font-medium tabular-nums text-slate-900">{revenue != null ? formatCurrency(revenue, locale) : "—"}</td>

      <td className="whitespace-nowrap px-5 py-3.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-slate-200/80">
          <span className={`h-1.5 w-1.5 rounded-full ${stock.dot === "green" ? "bg-emerald-500" : stock.dot === "red" ? "bg-rose-500" : "bg-amber-500"}`} />
          {stock.label}
        </span>
      </td>

      <td className="whitespace-nowrap px-5 py-3.5"><ApprovalSwitch product={item} isDisabled={isApproving} onToggle={onToggleApprove} /></td>
      <td className="whitespace-nowrap px-5 py-3.5"><PublishDropdown value={publishValue} onChange={onSetPublish} /></td>
      <td className="whitespace-nowrap px-5 py-3.5">
        <ProductRowActions
          isAr={isAr}
          editPath={editPath}
          onDuplicate={() => onDuplicate(item)}
          isDuplicating={isDuplicating}
          onDelete={() => onDelete(item)}
        />
      </td>
    </tr>
  );
}
