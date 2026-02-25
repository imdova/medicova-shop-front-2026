"use client";

import React, { useMemo } from "react";
import { Download } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { LanguageType } from "@/util/translations";

interface TransactionTableContainerProps {
  data: any[];
  type: "customers" | "sellers";
  locale: LanguageType;
}

const TransactionTableContainer: React.FC<TransactionTableContainerProps> = ({
  data,
  type,
  locale,
}) => {
  const t = useTranslations("admin");

  const customerColumns = useMemo(
    () => [
      {
        key: "id",
        header: t("invoice"),
        render: (item: any) => (
          <span className="font-mono text-[10px] font-bold text-gray-400">
            #{item.id}
          </span>
        ),
      },
      {
        key: "product",
        header: t("product"),
        render: (item: any) => (
          <div className="flex items-center gap-2">
            {item.product.images?.[0] && (
              <Image
                src={item.product.images[0]}
                alt={item.product.title[locale]}
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg border border-white object-cover shadow-sm"
              />
            )}
            <span className="line-clamp-1 max-w-[120px] text-xs font-bold text-gray-900">
              {item.product.title[locale]}
            </span>
          </div>
        ),
      },
      {
        key: "customer",
        header: t("customer"),
        render: (item: any) => (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900">{`${item.customer.firstName} ${item.customer.lastName}`}</span>
              <span className="text-[10px] font-medium text-gray-400">
                {item.customer.phone}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "total",
        header: t("totalSales"),
        render: (item: any) => (
          <span className="font-black text-gray-900">{item.total[locale]}</span>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: any) => {
          const status = item.status.toLowerCase();
          const colors: Record<string, string> = {
            paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
            pending: "bg-amber-50 text-amber-600 border-amber-100",
            failed: "bg-rose-50 text-rose-600 border-rose-100",
            refunded: "bg-gray-50 text-gray-600 border-gray-100",
          };
          return (
            <span
              className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${colors[status] || colors.pending}`}
            >
              {t(status)}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "",
        render: () => (
          <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 transition-all duration-300 hover:bg-gray-50 hover:text-primary hover:shadow-md">
            <Download size={14} />
          </button>
        ),
      },
    ],
    [t, locale],
  );

  const sellerColumns = useMemo(
    () => [
      {
        key: "id",
        header: t("id"),
        render: (item: any) => (
          <span className="font-mono text-[10px] font-bold text-gray-400">
            #{item.id}
          </span>
        ),
      },
      {
        key: "seller",
        header: t("seller"),
        render: (item: any) => (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-900">
                {item.seller.name}
              </span>
              <span className="text-[10px] font-medium text-gray-400">
                {item.seller.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "totalSales",
        header: t("totalSales"),
        render: (item: any) => (
          <span className="font-black text-gray-900">
            {item.totalSales[locale]}
          </span>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: any) => {
          const status = item.status.toLowerCase();
          const colors: Record<string, string> = {
            paid: "bg-emerald-50 text-emerald-600 border-emerald-100",
            pending: "bg-amber-50 text-amber-600 border-amber-100",
          };
          return (
            <span
              className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${colors[status] || colors.pending}`}
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
        columns={type === "customers" ? customerColumns : sellerColumns}
        minWidth={type === "customers" ? 1000 : 800}
        pagination={true}
        itemsPerPage={10}

        headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-wider"
        rowClassName="hover:bg-gray-50/80 transition-colors duration-300 border-b border-gray-50/50"
      />
    </div>
  );
};

export default TransactionTableContainer;
