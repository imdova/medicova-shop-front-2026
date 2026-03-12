"use client";

import React from "react";
import Link from "next/link";
import { TrashIcon, CheckCircle, XCircle, Loader2 } from "lucide-react";
import DynamicTable from "@/components/features/tables/DTable";
import { ApiProduct } from "@/services/productService";
import { LanguageType } from "@/util/translations";

interface ProductTableContainerProps {
  data: ApiProduct[];
  locale: LanguageType;
  onDelete: (product: ApiProduct) => void;
  onToggleApprove: (product: ApiProduct) => void;
  approvingId?: string | null;
}

/**
 * Extract seller name from various possible API shapes.
 */
function getSellerName(product: ApiProduct): string {
  const s = product.seller;
  if (!s) return product.createdBy || "—";

  if (typeof s === "string") {
    // It's just an ID
    return product.createdBy === "admin" ? "Admin" : s.slice(0, 8) + "…";
  }

  // It's an object
  if (s.name) return s.name;
  if (s.firstName || s.lastName) {
    return [s.firstName, s.lastName].filter(Boolean).join(" ");
  }

  return product.createdBy || "—";
}

const ProductTableContainer: React.FC<ProductTableContainerProps> = ({
  data,
  locale,
  onDelete,
  onToggleApprove,
  approvingId,
}) => {
  const isAr = locale === "ar";

  const columns = [
    {
      key: "name",
      header: isAr ? "اسم المنتج" : "Product Name",
      render: (item: ApiProduct) => {
        const name = isAr
          ? item.nameAr || item.nameEn
          : item.nameEn || item.nameAr;
        return (
          <Link
            href={`/${locale}/admin/products/${item._id}`}
            className="line-clamp-1 font-bold text-gray-900 transition-colors hover:text-primary hover:underline"
          >
            {name || "—"}
          </Link>
        );
      },
    },
    {
      key: "seller",
      header: isAr ? "اسم البائع" : "Seller",
      render: (item: ApiProduct) => (
        <span className="text-sm font-semibold text-gray-600">
          {getSellerName(item)}
        </span>
      ),
    },
    {
      key: "approved",
      header: isAr ? "الحالة" : "Status",
      render: (item: ApiProduct) => {
        const isApproving = approvingId === item._id;
        return (
          <button
            onClick={() => onToggleApprove(item)}
            disabled={isApproving}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              item.approved
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            } disabled:opacity-50`}
          >
            {isApproving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : item.approved ? (
              <CheckCircle size={12} />
            ) : (
              <XCircle size={12} />
            )}
            {item.approved
              ? isAr
                ? "معتمد"
                : "Approved"
              : isAr
                ? "غير معتمد"
                : "Pending"}
          </button>
        );
      },
    },
  ];

  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl transition-all duration-500">
      <DynamicTable
        data={data}
        columns={columns}
        pagination={true}
        itemsPerPage={10}
        headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-wider"
        rowClassName="hover:bg-gray-50/80 transition-colors duration-300 border-b border-gray-50/50"
        solidActions={[
          {
            label: isAr ? "حذف" : "Delete",
            onClick: (item) => onDelete(item as ApiProduct),
            icon: <TrashIcon className="h-4 w-4" />,
            className: "text-rose-500 hover:text-rose-700",
            color: "#dc2626",
          },
        ]}
      />
    </div>
  );
};

export default ProductTableContainer;
