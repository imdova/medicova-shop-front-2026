"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, PencilIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { Shipment } from "@/types/product";
import { LanguageType } from "@/util/translations";

interface ShipmentTableContainerProps {
  data: Shipment[];
  locale: LanguageType;
  onEdit: (shipment: Shipment) => void;
  onDelete: (shipment: Shipment) => void;
}

const ShipmentTableContainer: React.FC<ShipmentTableContainerProps> = ({
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
        render: (item: Shipment) => (
          <span className="font-mono text-[10px] font-bold text-gray-400">
            #{item.id}
          </span>
        ),
      },
      {
        key: "orderId",
        header: t("orderId"),
        render: (item: Shipment) => (
          <Link
            className="flex items-center gap-2 font-bold text-gray-900 transition-colors hover:text-primary"
            href={`/${locale}/admin/orders/edit/${item.orderId}`}
          >
            <span className="text-xs">{item.orderId}</span>
            <ExternalLink size={12} className="text-gray-300" />
          </Link>
        ),
      },
      {
        key: "customer",
        header: t("customer"),
        render: (item: Shipment) => (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-900">{`${item.customer.firstName} ${item.customer.lastName}`}</span>
            <span className="text-[10px] font-medium text-gray-400">
              {item.customer.email}
            </span>
          </div>
        ),
      },
      {
        key: "shippingAmount",
        header: t("shippingAmount"),
        render: (item: Shipment) => (
          <span className="font-black text-gray-900">
            {item.shippingAmount.toFixed(2)} EGP
          </span>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: Shipment) => {
          const statusEn = item.status.en?.toLowerCase();
          const colors: Record<string, string> = {
            shipped: "bg-purple-50 text-purple-600 border-purple-100",
            delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
            processing: "bg-blue-50 text-blue-600 border-blue-100",
            cancelled: "bg-rose-50 text-rose-600 border-rose-100",
            returned: "bg-amber-50 text-amber-600 border-amber-100",
            pending: "bg-gray-50 text-gray-600 border-gray-100",
          };
          return (
            <span
              className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${colors[statusEn] || colors.pending}`}
            >
              {item.status[locale]}
            </span>
          );
        },
      },
      {
        key: "codStatus",
        header: t("codStatus"),
        render: (item: Shipment) => (
          <span className="text-[11px] font-bold text-gray-500">
            {item.codStatus[locale]}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: t("createdAt"),
        render: (item: Shipment) => (
          <span className="text-[11px] font-bold text-gray-400">
            {new Date(item.createdAt).toLocaleDateString(
              locale === "ar" ? "ar-EG" : "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            )}
          </span>
        ),
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
            onClick: (item) => onEdit(item as Shipment),
            icon: <PencilIcon className="h-4 w-4" />,
            className: "text-blue-600 font-bold",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as Shipment),
            icon: <TrashIcon className="h-4 w-4" />,
            className: "text-rose-600 font-bold",
          },
        ]}
      />
    </div>
  );
};

export default ShipmentTableContainer;
