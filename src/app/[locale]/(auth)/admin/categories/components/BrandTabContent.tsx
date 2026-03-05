"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { PencilIcon, TrashIcon } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import StatusToggle from "@/components/shared/Buttons/StatusToggle";
import TabContentLayout from "./TabContentLayout";
import { Brand } from "../constants";

interface BrandTabContentProps {
  data: Brand[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStatusChange: (brand: Brand, newStatus: boolean) => void;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  onCreateClick: () => void;
}

const BrandTabContent: React.FC<BrandTabContentProps> = ({
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
        key: "logo",
        header: t("brandImage"),
        render: (item: Brand) => (
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-white bg-gray-50 shadow-sm ring-1 ring-gray-100">
            <Image
              fill
              src={item.logo}
              alt={item.name[locale]}
              className="object-contain p-1 transition-transform duration-300 hover:scale-110"
            />
          </div>
        ),
      },
      {
        key: "name",
        header: t("brandName"),
        render: (item: Brand) => (
          <span className="font-bold text-gray-900">{item.name[locale]}</span>
        ),
      },
      {
        key: "products",
        header: t("products"),
        render: (item: Brand) => (
          <span className="inline-flex items-center rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
            {item.products}
          </span>
        ),
      },
      {
        key: "orders",
        header: t("orders"),
        render: (item: Brand) => (
          <span className="inline-flex items-center rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
            {item.orders}
          </span>
        ),
      },
      {
        key: "totalSales",
        header: t("totalSales"),
        render: (item: Brand) => (
          <span className="font-black text-gray-900">
            {item.totalSales[locale]}
          </span>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: Brand) => (
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
      title={t("allBrands")}
      itemCount={data.length}
      itemLabel={t("brands")}
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
            onClick: (item) => onEdit(item as Brand),
            icon: <PencilIcon />,
            color: "#2563eb",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as Brand),
            icon: <TrashIcon />,
            color: "#dc2626",
          },
        ]}
      />
    </TabContentLayout>
  );
};

export default BrandTabContent;
