"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, PencilIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { Order, Product } from "../constants";
import { LanguageType } from "@/util/translations";

interface OrderTableContainerProps {
  data: Order[];
  locale: LanguageType;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
}

const OrderTableContainer: React.FC<OrderTableContainerProps> = ({
  data,
  locale,
  onEdit,
  onDelete,
}) => {
  const t = useTranslations("admin");
  const isRTL = locale === "ar";

  const orderColumns = useMemo(
    () => [
      {
        key: "id",
        header: t("orderId"),
        sortable: true,
        render: (item: Order) => (
          <Link
            href={`/${locale}/admin/orders/${encodeURIComponent(
              item.id.replace(/^#/, ""),
            )}`}
            className="font-black text-gray-900 underline-offset-4 hover:text-primary hover:underline"
          >
            {item.id}
          </Link>
        ),
      },
      {
        key: "date",
        header: t("date"),
        sortable: true,
      },
      {
        key: "customer",
        header: t("customer"),
        render: (item: Order) => (
          <div
            className={`text-sm leading-tight ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className="font-bold text-gray-900">{item.customer.name}</div>
            <div className="mt-0.5 text-[11px] font-medium text-gray-400">
              {item.customer.phone}
            </div>
            <div className="max-w-[150px] truncate text-[11px] text-gray-400">
              {item.customer.location}
            </div>
          </div>
        ),
      },
      {
        key: "products",
        header: t("productsLabel"),
        render: (item: Order) => (
          <div className="flex -space-x-2 overflow-hidden transition-all duration-300 hover:space-x-1">
            {item.products
              .slice(0, 3)
              .map((product: Product, index: number) => (
                <div
                  key={index}
                  className="group relative h-9 w-9 overflow-hidden rounded-xl border-2 border-white bg-gray-50 shadow-sm ring-1 ring-gray-100"
                >
                  <Image
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    src={product.image}
                    alt={product.name}
                    width={36}
                    height={36}
                  />
                </div>
              ))}
            {item.products.length > 3 && (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-500 shadow-sm ring-1 ring-gray-100">
                +{item.products.length - 3}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "seller",
        header: t("seller"),
        render: (item: Order) => (
          <span className="inline-flex items-center rounded-lg border border-gray-100 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
            {item.seller}
          </span>
        ),
      },
      {
        key: "total",
        header: t("totalSales"),
        sortable: true,
        render: (item: Order) => (
          <div className="font-black text-gray-900">{item.total}</div>
        ),
      },
      {
        key: "payment",
        header: t("payment"),
        render: (item: Order) => (
          <div
            className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div className="flex h-7 w-10 items-center justify-center rounded-lg border border-gray-100 bg-white shadow-sm">
              <Image
                src={`/icons/card-${item.payment.method}.svg`}
                alt={item.payment.method}
                width={20}
                height={14}
                onError={(e) => {
                  (e.target as any).src = "/icons/card-visa.svg"; // Fallback
                }}
              />
            </div>
            <span className="text-[11px] font-medium capitalize text-gray-500">
              {item.payment.last4
                ? `•••• ${item.payment.last4}`
                : item.payment.method}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: Order) => {
          const statusMap: Record<
            string,
            { bg: string; text: string; dot: string }
          > = {
            "For Delivery": {
              bg: "bg-blue-50",
              text: "text-blue-600",
              dot: "bg-blue-500",
            },
            Packaging: {
              bg: "bg-indigo-50",
              text: "text-indigo-600",
              dot: "bg-indigo-500",
            },
            Pending: {
              bg: "bg-amber-50",
              text: "text-amber-600",
              dot: "bg-amber-500",
            },
            Delivered: {
              bg: "bg-emerald-50",
              text: "text-emerald-600",
              dot: "bg-emerald-500",
            },
            Cancelled: {
              bg: "bg-rose-50",
              text: "text-rose-600",
              dot: "bg-rose-500",
            },
            Returned: {
              bg: "bg-orange-50",
              text: "text-orange-600",
              dot: "bg-orange-500",
            },
          };

          const style = statusMap[item.status] || {
            bg: "bg-gray-50",
            text: "text-gray-600",
            dot: "bg-gray-500",
          };

          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${style.bg} ${style.text} border border-white/50 shadow-sm`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${style.dot} animate-pulse`}
              ></span>
              {t(
                `statusOptions.${item.status.toLowerCase().replace(" ", "_")}`,
              )}
            </span>
          );
        },
      },
    ],
    [t, isRTL],
  );

  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-900">{t("orders")}</h2>
          <p className="text-xs font-medium text-gray-400">{t("allOrders")}</p>
        </div>
        <Link
          href={`/${locale}/admin/orders`}
          className="group flex items-center gap-1 rounded-xl bg-gray-50 px-4 py-2 text-sm font-bold text-primary transition-all duration-300 hover:bg-primary hover:text-white"
        >
          {t("viewAll")}
          <ChevronRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      </div>

      <DynamicTable
        data={data}
        columns={orderColumns}
        minWidth={1100}
        pagination={true}
        itemsPerPage={8}
        selectable={true}
        headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-wider"
        rowClassName="hover:bg-gray-50/80 transition-colors duration-300 border-b border-gray-50/50"
        actions={[
          {
            label: t("edit"),
            onClick: (item) => onEdit(item as Order),
            className: "text-blue-600 font-bold",
            icon: <PencilIcon className="h-4 w-4" />,
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as Order),
            className: "text-rose-600 font-bold",
            icon: <TrashIcon className="h-4 w-4" />,
          },
        ]}

      />
    </div>
  );
};

export default OrderTableContainer;
