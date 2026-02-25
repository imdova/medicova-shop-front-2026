"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { Product } from "@/types/product";
import { LanguageType } from "@/util/translations";

interface ProductTableContainerProps {
  data: Product[];
  locale: LanguageType;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductTableContainer: React.FC<ProductTableContainerProps> = ({
  data,
  locale,
  onEdit,
  onDelete,
}) => {
  const t = useTranslations("admin");

  const columns = useMemo(
    () => [
      {
        key: "title",
        header: t("productName"),
        render: (item: Product) => (
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              <Image
                fill
                src={item.images?.[0] || "/images/placeholder.jpg"}
                alt={item.title[locale]}
                className="object-cover"
              />
            </div>
            <Link
              href={`/${locale}/admin/product-settings/products/${item.id}`}
              className="line-clamp-1 font-bold text-gray-900 transition-colors hover:text-primary"
            >
              {item.title[locale]}
            </Link>
          </div>
        ),
      },
      {
        key: "sku",
        header: t("sku"),
        render: (item: Product) => (
          <span className="font-mono text-xs text-gray-500">{item.id}</span>
        ),
      },
      {
        key: "category",
        header: t("category"),
        render: (item: Product) => (
          <span className="inline-flex items-center rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">
            {item.category?.title[locale] || t("medicalWear")}
          </span>
        ),
      },
      {
        key: "price",
        header: t("unitPrice"),
        render: (item: Product) => (
          <div className="flex flex-col">
            <span className="font-black text-gray-900">{item.price} EGP</span>
            {item.del_price && (
              <span className="text-[10px] font-bold text-gray-400 line-through">
                {item.del_price} EGP
              </span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: Product) => {
          const status = item.status?.en || "draft";
          const configs = {
            active: "bg-emerald-50 text-emerald-600 border-emerald-100",
            pending: "bg-amber-50 text-amber-600 border-amber-100",
            draft: "bg-gray-50 text-gray-600 border-gray-100",
          };
          const config =
            configs[status as keyof typeof configs] || configs.draft;

          return (
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${config}`}
            >
              {item.status?.[locale] || status}
            </span>
          );
        },
      },
    ],
    [t, locale],
  );

  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl transition-all duration-500">
      <DynamicTable
        data={data}
        columns={columns}
        minWidth={1100}
        pagination={true}
        itemsPerPage={10}

        headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-wider"
        rowClassName="hover:bg-gray-50/80 transition-colors duration-300 border-b border-gray-50/50"
        actions={[
          {
            label: t("edit"),
            onClick: (item) => onEdit(item as Product),
            icon: <PencilIcon className="h-4 w-4" />,
            className: "text-blue-600 font-bold",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as Product),
            icon: <TrashIcon className="h-4 w-4" />,
            className: "text-rose-600 font-bold",
          },
        ]}
      />
    </div>
  );
};

export default ProductTableContainer;
