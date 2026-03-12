"use client";

import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { ApiProduct } from "@/services/productService";
import { LanguageType } from "@/util/translations";
import { ProductRowActions } from "./ProductRowActions";
import { ApprovalSwitch } from "./ApprovalSwitch";
import { PublishDropdown } from "./PublishDropdown";
import { formatCreatedAt, formatPrice, getCategoryName, getStockStatus } from "./utils";

interface ProductGridCardProps {
  item: ApiProduct;
  locale: LanguageType;
  isAr: boolean;
  categoryMap: Record<string, { en: string; ar: string }>;
  publishValue: "Published" | "Draft";
  isApproving: boolean;
  detailsPath: string;
  editPath: string;
  onSetPublish: (value: "Published" | "Draft") => void;
  onToggleApprove: (item: ApiProduct) => void;
  onDelete: (item: ApiProduct) => void;
}

function getProductPrice(item: ApiProduct): number | string | null {
  const salePrice =
    item.sale_price ?? item.salePrice ?? item.pricing?.salePrice ?? item.pricing?.sale_price;
  const originalPrice =
    item.price ?? item.original_price ?? item.originalPrice ?? item.pricing?.originalPrice ?? item.pricing?.original_price ?? item.del_price;
  return salePrice && Number(salePrice) > 0 ? salePrice : (originalPrice ?? null);
}

export function ProductGridCard({
  item,
  locale,
  isAr,
  categoryMap,
  publishValue,
  isApproving,
  detailsPath,
  editPath,
  onSetPublish,
  onToggleApprove,
  onDelete,
}: ProductGridCardProps) {
  const name = isAr ? item.nameAr || item.nameEn : item.nameEn || item.nameAr;
  const sku = item.sku ?? item.identity?.sku ?? item._id.slice(-6).toUpperCase();
  const price = getProductPrice(item);
  const stock = getStockStatus(item);
  const media = item.media as { featuredImages?: string; galleryImages?: string[] } | undefined;
  const image = media?.featuredImages || media?.galleryImages?.[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt={name || ""}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <Package className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={detailsPath} className="line-clamp-2 font-semibold text-slate-900 transition-colors hover:text-primary">
              {name || "—"}
            </Link>
            <p className="mt-1 text-xs text-slate-500">SKU: {sku}</p>
          </div>

          <ProductRowActions isAr={isAr} editPath={editPath} onDelete={() => onDelete(item)} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100">
            {getCategoryName(item, locale, categoryMap) || "—"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-slate-200/80">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                stock.dot === "green" ? "bg-emerald-500" : stock.dot === "red" ? "bg-rose-500" : "bg-amber-500"
              }`}
            />
            {stock.label}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="font-semibold tabular-nums text-slate-900">
            {price != null ? formatPrice(price, locale) : "—"}
          </p>

          <div className="flex items-center gap-2">
            <ApprovalSwitch
              product={item}
              isDisabled={isApproving}
              onToggle={onToggleApprove}
            />
            <PublishDropdown value={publishValue} onChange={onSetPublish} />
          </div>
        </div>

        <p className="pt-2 text-xs text-slate-500">
          {isAr ? "تاريخ الإنشاء:" : "Created:"} {formatCreatedAt(item.createdAt, locale)}
        </p>
      </div>
    </div>
  );
}
