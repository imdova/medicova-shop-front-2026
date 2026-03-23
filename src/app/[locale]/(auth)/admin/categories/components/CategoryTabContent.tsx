"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { PencilIcon, TrashIcon, ChevronUp, ChevronDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import StatusToggle from "@/components/shared/Buttons/StatusToggle";
import TabContentLayout from "./TabContentLayout";
import { Category } from "../constants";

interface CategoryTabContentProps {
  data: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (category: Category, newStatus: boolean) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onCreateClick: () => void;
  onMoveUp?: (category: Category) => void;
  onMoveDown?: (category: Category) => void;
}

const CategoryTabContent: React.FC<CategoryTabContentProps> = ({
  data,
  searchQuery,
  onSearchChange,
  onStatusChange,
  onEdit,
  onDelete,
  onCreateClick,
  onMoveUp,
  onMoveDown,
}) => {
  const locale = useLocale() as "en" | "ar";
  const t = useTranslations("admin");

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
    <TabContentLayout
      title={t("allCategories")}
      itemCount={data.length}
      itemLabel={t("categoriesLabel")}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      onCreateClick={onCreateClick}
    >
      <DynamicTable
        data={data}
        columns={columns}
        minWidth={0}
        pagination={true}
        itemsPerPage={5}
        headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-wider"
        rowClassName="hover:bg-gray-50/80 transition-colors duration-300 border-b border-gray-50/50"
        solidActions={[
          ...(onMoveUp
            ? [
                {
                  label: "↑",
                  onClick: (item: any) => onMoveUp?.(item as Category),
                  icon: <ChevronUp />,
                  color: "#16a34a",
                },
              ]
            : []),
          ...(onMoveDown
            ? [
                {
                  label: "↓",
                  onClick: (item: any) => onMoveDown?.(item as Category),
                  icon: <ChevronDown />,
                  color: "#16a34a",
                },
              ]
            : []),
          {
            label: t("edit"),
            onClick: (item) => onEdit(item as Category),
            icon: <PencilIcon />,
            color: "#2563eb",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as Category),
            icon: <TrashIcon />,
            color: "#dc2626",
          },
        ]}
      />
    </TabContentLayout>
  );
};

export default CategoryTabContent;
