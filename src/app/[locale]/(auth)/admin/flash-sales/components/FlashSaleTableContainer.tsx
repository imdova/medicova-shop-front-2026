"use client";

import React, { useMemo } from "react";
import { PencilIcon, TrashIcon, Zap, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { FlashSale } from "@/types/product";
import { LanguageType } from "@/util/translations";
import Link from "next/link";

interface FlashSaleTableContainerProps {
  data: FlashSale[];
  locale: LanguageType;
  onEdit: (flashSale: FlashSale) => void;
  onDelete: (flashSale: FlashSale) => void;
}

const FlashSaleTableContainer: React.FC<FlashSaleTableContainerProps> = ({
  data,
  locale,
  onEdit,
  onDelete,
}) => {
  const t = useTranslations("admin");

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: t("id"),
        render: (item: FlashSale) => (
          <span className="font-mono text-[10px] font-bold text-gray-400">
            #{item.id}
          </span>
        ),
      },
      {
        key: "name",
        header: t("name"),
        render: (item: FlashSale) => (
          <div className="flex min-w-[200px] items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
              <Zap size={16} />
            </div>
            <Link
              href={`/${locale}/admin/flash-sales/edit/${item.id}`}
              className="line-clamp-1 text-xs font-bold text-gray-900 transition-colors hover:text-rose-500"
            >
              {item.name[locale]}
            </Link>
          </div>
        ),
      },
      {
        key: "endDate",
        header: t("endDate"),
        render: (item: FlashSale) => {
          const date = new Date(item.endDate);
          const now = new Date();
          const isExpired = date < now;

          return (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <span
                className={`text-[10px] font-bold ${isExpired ? "text-rose-500" : "text-gray-600"}`}
              >
                {date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          );
        },
      },
      {
        key: "createdAt",
        header: t("createdAt"),
        render: (item: FlashSale) => {
          const date = new Date(item.createdAt);
          return (
            <span className="text-[10px] font-bold text-gray-400">
              {date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          );
        },
      },
      {
        key: "status",
        header: t("status"),
        render: (item: FlashSale) => {
          const status = item.status;
          const colors: Record<string, string> = {
            published: "bg-emerald-50 text-emerald-600 border-emerald-100",
            expired: "bg-rose-50 text-rose-500 border-rose-100",
            upcoming: "bg-blue-50 text-blue-600 border-blue-100",
            draft: "bg-amber-50 text-amber-600 border-amber-100",
          };
          return (
            <span
              className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${colors[status] || colors.draft}`}
            >
              {t(status)}
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
        minWidth={1000}
        pagination={true}
        itemsPerPage={10}

        headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-wider"
        rowClassName="hover:bg-gray-50/80 transition-colors duration-300 border-b border-gray-50/50"
        actions={[
          {
            label: t("edit"),
            onClick: (item) => onEdit(item as FlashSale),
            icon: <PencilIcon className="h-4 w-4" />,
            className: "text-blue-600 font-bold",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as FlashSale),
            icon: <TrashIcon className="h-4 w-4" />,
            className: "text-rose-600 font-bold",
          },
        ]}
      />
    </div>
  );
};

export default FlashSaleTableContainer;
