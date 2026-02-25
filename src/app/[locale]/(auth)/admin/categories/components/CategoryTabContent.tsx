"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Search, Plus, Download, PencilIcon, TrashIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import StatusToggle from "@/components/shared/Buttons/StatusToggle";
import { Category } from "../constants";
import { LanguageType } from "@/util/translations";
import Link from "next/link";

interface CategoryTabContentProps {
  data: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (category: Category, newStatus: boolean) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryTabContent: React.FC<CategoryTabContentProps> = ({
  data,
  searchQuery,
  onSearchChange,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const locale = useLocale() as "en" | "ar";
  const t = useTranslations("admin");
  const isRTL = locale === "ar";

  const columns = useMemo(
    () => [
      {
        key: "image",
        header: t("categoryImage"),
        render: (item: Category) => (
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-white bg-gray-50 shadow-sm ring-1 ring-gray-100">
            <Image
              fill
              src={item.image}
              alt={item.name[locale]}
              className="object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>
        ),
      },
      {
        key: "name",
        header: t("categoryName"),
        render: (item: Category) => (
          <span className="font-bold text-gray-900">{item.name[locale]}</span>
        ),
      },
      {
        key: "date",
        header: t("date"),
        render: (item: Category) => (
          <span className="font-medium text-gray-500">{item.date}</span>
        ),
      },
      {
        key: "products",
        header: t("products"),
        render: (item: Category) => (
          <span className="inline-flex items-center rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
            {item.products}
          </span>
        ),
      },
      {
        key: "orders",
        header: t("orders"),
        render: (item: Category) => (
          <span className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
            {item.orders}
          </span>
        ),
      },
      {
        key: "totalSales",
        header: t("totalSales"),
        render: (item: Category) => (
          <span className="font-black text-gray-900">
            {item.totalSales[locale]}
          </span>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: Category) => (
          <StatusToggle
            initialStatus={item.isActive}
            onToggle={(newStatus) => onStatusChange(item, newStatus)}
          />
        ),
      },
    ],
    [t, locale, onStatusChange],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl text-primary shadow-inner">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">
              {t("allCategories")}
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {data.length} {t("categoriesLabel")}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:max-w-2xl">
          <div className="relative flex-1">
            <Search
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${isRTL ? "right-4" : "left-4"}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className={`focus:border-primary/30 focus:ring-primary/5 h-12 w-full rounded-2xl border border-gray-100 bg-gray-50/50 text-sm outline-none transition-all duration-300 focus:bg-white focus:ring-4 ${isRTL ? "pl-4 pr-11" : "pl-11 pr-4"}`}
            />
          </div>

          <div className="flex gap-2">
            <Link
              href={`/${locale}/admin/product-settings/categories/create`}
              className="shadow-primary/20 group flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:brightness-110 active:scale-95"
            >
              <Plus
                size={18}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
              <span>{t("create")}</span>
            </Link>
            <button className="flex h-12 items-center gap-2 rounded-2xl border border-gray-100 bg-white px-6 text-sm font-bold text-gray-600 transition-all duration-300 hover:bg-gray-50 hover:text-primary hover:shadow-md">
              <Download size={18} />
              <span>{t("download")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
        <DynamicTable
          data={data}
          columns={columns}
          minWidth={1000}
          pagination={true}
          itemsPerPage={5}
          headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-wider"
          rowClassName="hover:bg-gray-50/80 transition-colors duration-300 border-b border-gray-50/50"
          actions={[
            {
              label: t("edit"),
              onClick: (item) => onEdit(item as Category),
              icon: <PencilIcon className="h-4 w-4" />,
              className: "text-blue-600 font-bold",
            },
            {
              label: t("delete"),
              onClick: (item) => onDelete(item as Category),
              icon: <TrashIcon className="h-4 w-4" />,
              className: "text-rose-600 font-bold",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default CategoryTabContent;
