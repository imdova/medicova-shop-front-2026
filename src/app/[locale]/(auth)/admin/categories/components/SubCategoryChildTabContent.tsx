"use client";

import React, { useMemo } from "react";
import { PencilIcon, TrashIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import StatusToggle from "@/components/shared/Buttons/StatusToggle";
import TabContentLayout from "./TabContentLayout";
import { SubCategoryChild } from "../constants";

interface SubCategoryChildTabContentProps {
  data: SubCategoryChild[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (item: SubCategoryChild, newStatus: boolean) => void;
  onEdit: (item: SubCategoryChild) => void;
  onDelete: (item: SubCategoryChild) => void;
  onCreateClick: () => void;
}

const SubCategoryChildTabContent: React.FC<SubCategoryChildTabContentProps> = ({
  data,
  searchQuery,
  onSearchChange,
  onStatusChange,
  onEdit,
  onDelete,
  onCreateClick,
}) => {
  const locale = useLocale() as "en" | "ar";
  const t = useTranslations("admin");

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: t("subCategoryName"),
        render: (item: SubCategoryChild) => (
          <span className="font-bold text-gray-900">{item.name[locale]}</span>
        ),
      },
      {
        key: "parentSubCategory",
        header: t("subCategory"),
        render: (item: SubCategoryChild) => (
          <span className="inline-flex items-center rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 shadow-sm">
            {item.parentSubCategory[locale]}
          </span>
        ),
      },
      {
        key: "products",
        header: t("products"),
        render: (item: SubCategoryChild) => (
          <span className="inline-flex items-center rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
            {item.products}
          </span>
        ),
      },
      {
        key: "orders",
        header: t("orders"),
        render: (item: SubCategoryChild) => (
          <span className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
            {item.orders}
          </span>
        ),
      },
      {
        key: "totalSales",
        header: t("totalSales"),
        render: (item: SubCategoryChild) => (
          <span className="font-black text-gray-900">
            {item.totalSales[locale]}
          </span>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: SubCategoryChild) => (
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
      title={t("allSubCategoryChildren")}
      itemCount={data.length}
      itemLabel={t("subCategoryChildren")}
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
          {
            label: t("edit"),
            onClick: (item) => onEdit(item as SubCategoryChild),
            icon: <PencilIcon />,
            color: "#2563eb",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as SubCategoryChild),
            icon: <TrashIcon />,
            color: "#dc2626",
          },
        ]}
      />
    </TabContentLayout>
  );
};

export default SubCategoryChildTabContent;
