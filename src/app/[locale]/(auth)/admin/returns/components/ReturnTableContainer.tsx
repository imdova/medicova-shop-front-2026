"use client";

import React, { useMemo } from "react";
import {
  EyeIcon,
  TrashIcon,
  RotateCcw,
  Calendar,
  User,
  Package,
} from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { LanguageType } from "@/util/translations";
import Link from "next/link";
import Image from "next/image";
import { formatFullName } from "@/util";

interface ReturnTableContainerProps {
  data: any[];
  locale: LanguageType;
  onView: (item: any) => void;
  onDelete: (item: any) => void;
}

const ReturnTableContainer: React.FC<ReturnTableContainerProps> = ({
  data,
  locale,
  onView,
  onDelete,
}) => {
  const t = useTranslations("admin");

  const columns = useMemo(
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
        key: "orderId",
        header: t("orderId"),
        render: (item: any) => (
          <Link
            href={`/${locale}/admin/orders/${item.orderId}`}
            className="text-xs font-black text-blue-600 hover:underline"
          >
            {item.orderId}
          </Link>
        ),
      },
      {
        key: "customer",
        header: t("customer"),
        render: (item: any) => (
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white bg-gray-50 shadow-sm">
              <Image
                src={item.customer.avatar || "/avatars/default-user.jpg"}
                alt={item.customer.firstName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                {formatFullName(
                  item.customer.firstName,
                  item.customer.lastName,
                )}
              </p>
              <p className="text-[10px] font-medium text-gray-400">
                {item.customer.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "products",
        header: t("productItems"),
        render: (item: any) => (
          <div className="flex -space-x-2">
            {item.productItems.slice(0, 3).map((product: any, idx: number) => (
              <div
                key={product.id}
                className="relative h-7 w-7 overflow-hidden rounded-lg border-2 border-white shadow-sm"
                title={product.title[locale]}
              >
                <Image
                  src={product.images[0] || "/products/default-product.jpg"}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {item.productItems.length > 3 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-white bg-gray-100 text-[8px] font-black text-gray-500">
                +{item.productItems.length - 3}
              </div>
            )}
          </div>
        ),
      },
      {
        key: "reason",
        header: t("returnReason"),
        render: (item: any) => (
          <p className="line-clamp-1 max-w-[150px] text-[11px] font-medium text-gray-500">
            {item.returnReason}
          </p>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: any) => {
          const status = item.status;
          const statusMap: Record<
            string,
            { bg: string; text: string; dot: string }
          > = {
            pending: {
              bg: "bg-amber-50",
              text: "text-amber-600",
              dot: "bg-amber-500",
            },
            approved: {
              bg: "bg-blue-50",
              text: "text-blue-600",
              dot: "bg-blue-500",
            },
            rejected: {
              bg: "bg-rose-50",
              text: "text-rose-600",
              dot: "bg-rose-500",
            },
            processed: {
              bg: "bg-purple-50",
              text: "text-purple-600",
              dot: "bg-purple-500",
            },
            refunded: {
              bg: "bg-emerald-50",
              text: "text-emerald-600",
              dot: "bg-emerald-500",
            },
          };
          const config = statusMap[status] || {
            bg: "bg-gray-50",
            text: "text-gray-400",
            dot: "bg-gray-400",
          };

          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider ${config.bg} ${config.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              {t(status)}
            </span>
          );
        },
      },
      {
        key: "date",
        header: t("createdAt"),
        render: (item: any) => (
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={12} />
            <span className="text-[10px] font-bold">
              {new Date(item.createdAt).toLocaleDateString(
                locale === "en" ? "en-US" : "ar-EG",
              )}
            </span>
          </div>
        ),
      },
    ],
    [t, locale],
  );

  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl transition-all duration-500">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
          <RotateCcw size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-gray-900">
            Returns Grid
          </h4>
          <p className="mt-0.5 text-[10px] font-bold text-gray-400">
            Reverse Logistics Management
          </p>
        </div>
      </div>

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
            label: t("view"),
            onClick: (item) => onView(item),
            icon: <EyeIcon className="h-4 w-4" />,
            className: "text-emerald-600 font-bold",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item),
            icon: <TrashIcon className="h-4 w-4" />,
            className: "text-rose-600 font-bold",
          },
        ]}
      />
    </div>
  );
};

export default ReturnTableContainer;
