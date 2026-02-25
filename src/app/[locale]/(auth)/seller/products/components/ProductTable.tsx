"use client";

import DynamicTable from "@/components/features/tables/DTable";
import { Product } from "@/types/product";
import { PencilIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface ProductTableProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  locale: string;
}

export const ProductTable = ({
  products,
  onEdit,
  onDelete,
  locale,
}: ProductTableProps) => {
  const t = useTranslations("seller_products.table");

  const columns = [
    {
      key: "id",
      header: t("productId"),
      sortable: true,
    },
    {
      key: "title",
      header: t("product"),
      sortable: true,
      render: (item: Product) => (
        <Link
          className="font-bold text-gray-900 transition-colors hover:text-primary"
          href={`/product-details/${item.id}`}
        >
          {item.title[locale as "en" | "ar"]}
        </Link>
      ),
    },
    {
      key: "price",
      header: t("price"),
      sortable: true,
      render: (item: Product) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">
              ${item.price.toFixed(2)}
            </span>
            {item.sale && (
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-tight text-orange-600 ring-1 ring-orange-200">
                {t("offer")}
              </span>
            )}
          </div>
          {item.nudges?.[locale as "en" | "ar"]?.some((n) =>
            n.toLowerCase().includes("limited"),
          ) && (
            <span className="w-fit rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-tight text-purple-600 ring-1 ring-purple-200">
              {t("limitedEdition")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: t("stock"),
      sortable: true,
      render: (item: Product) => {
        const stockCount = item.stock ?? 0;
        const inStock = stockCount > 0;
        const isLowStock = stockCount > 0 && stockCount <= 5;

        return (
          <div className="flex items-center justify-center">
            <span
              className={`flex min-w-[90px] items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-tight ${
                isLowStock
                  ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  : inStock
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLowStock
                    ? "animate-pulse bg-amber-500"
                    : inStock
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                }`}
              />
              {isLowStock
                ? t("almostGone")
                : inStock
                  ? `${stockCount} ${t("inStock")}`
                  : t("outOfStock")}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("status"),
      sortable: true,
      render: (item: Product) => {
        const status = item.status?.[locale as "en" | "ar"];
        const isActive = status === "Active" || status === "نشط";
        return (
          <div className="flex items-center justify-center">
            <span
              className={`flex min-w-[90px] items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-tight ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                  : "bg-gray-50 text-gray-600 ring-1 ring-gray-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-indigo-500" : "bg-gray-400"}`}
              />
              {status}
            </span>
          </div>
        );
      },
    },
    {
      key: "category",
      header: t("category"),
      sortable: true,
      render: (item: Product) => (
        <span className="font-medium text-gray-500">
          {item.category?.title[locale as "en" | "ar"]}
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
      <DynamicTable
        data={products}
        columns={columns}
        pagination={true}
        itemsPerPage={10}
        selectable={true}
        defaultSort={{ key: "id", direction: "desc" }}
        locale={locale as any}
        minWidth={0}
        className="border-none"
        headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-bold uppercase tracking-widest border-b border-gray-100"
        rowClassName="hover:bg-gray-50/80 transition-colors duration-200 text-sm border-b border-gray-50 last:border-none"
        actions={[
          {
            label: t("edit"),
            onClick: (product: Product) => onEdit(product.id),
            className:
              "bg-white/50 backdrop-blur-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50 ring-1 ring-gray-100",
            icon: <PencilIcon className="h-4 w-4" />,
          },
          {
            label: t("delete"),
            onClick: (product: Product) => onDelete(product.id),
            className:
              "bg-white/50 backdrop-blur-sm text-gray-700 hover:text-red-700 hover:bg-red-50 ring-1 ring-gray-100",
            icon: <TrashIcon className="h-4 w-4" />,
          },
        ]}
      />
    </div>
  );
};
