"use client";

import React, { useMemo } from "react";
import { Clipboard, PencilIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { Discount } from "@/types/product";
import { LanguageType } from "@/util/translations";

interface DiscountTableContainerProps {
  data: Discount[];
  locale: LanguageType;
  onEdit: (discount: Discount) => void;
  onDelete: (discount: Discount) => void;
}

const DiscountTableContainer: React.FC<DiscountTableContainerProps> = ({
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
        render: (item: Discount) => (
          <span className="font-mono text-[10px] font-bold text-gray-400">
            #{item.id}
          </span>
        ),
      },
      {
        key: "detail",
        header: t("detail"),
        render: (item: Discount) => (
          <div className="flex min-w-[200px] flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-lg px-2 py-0.5 text-xs font-black tracking-widest ${item.status === "expired" ? "bg-gray-100 text-gray-400 line-through" : "bg-primary/10 text-primary"}`}
              >
                {item.couponCode}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(item.couponCode)}
                className="text-gray-300 transition-colors hover:text-primary"
              >
                <Clipboard size={12} />
              </button>
            </div>
            <p className="text-[10px] font-medium leading-tight text-gray-500">
              {item.discountType === "fixed" &&
                t("fixedCouponDesc").replace("{value}", item.value.toFixed(2))}
              {item.discountType === "percentage" &&
                t("percentageCouponDesc").replace(
                  "{value}",
                  item.value.toString(),
                )}
              {item.discountType === "shipping" &&
                t("shippingCouponDesc").replace(
                  "{value}",
                  item.value.toFixed(2),
                )}
            </p>
          </div>
        ),
      },
      {
        key: "used",
        header: t("used"),
        render: (item: Discount) => (
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-gray-900">
              {item.usedCount || 0}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
              {t("usageLimit").replace(
                "{limit}",
                item.usageLimit?.toString() || "∞",
              )}
            </span>
          </div>
        ),
      },
      {
        key: "dates",
        header: t("startDate") + " - " + t("endDate"),
        render: (item: Discount) => (
          <div className="flex flex-col text-[10px] font-bold text-gray-400">
            <span>
              {new Date(item.startDate).toLocaleDateString(
                locale === "ar" ? "ar-EG" : "en-US",
                { month: "short", day: "numeric", year: "numeric" },
              )}
            </span>
            <span className="text-primary/60">
              {new Date(item.endDate).toLocaleDateString(
                locale === "ar" ? "ar-EG" : "en-US",
                { month: "short", day: "numeric", year: "numeric" },
              )}
            </span>
          </div>
        ),
      },
      {
        key: "store",
        header: t("store"),
        render: (item: Discount) => (
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-900">
            {item.store}
          </span>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: Discount) => {
          const status = item.status;
          const colors: Record<string, string> = {
            active: "bg-emerald-50 text-emerald-600 border-emerald-100",
            expired: "bg-rose-50 text-rose-600 border-rose-100",
            scheduled: "bg-blue-50 text-blue-600 border-blue-100",
          };
          return (
            <span
              className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${colors[status] || colors.active}`}
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
            onClick: (item) => onEdit(item as Discount),
            icon: <PencilIcon className="h-4 w-4" />,
            className: "text-blue-600 font-bold",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as Discount),
            icon: <TrashIcon className="h-4 w-4" />,
            className: "text-rose-600 font-bold",
          },
        ]}
      />
    </div>
  );
};

export default DiscountTableContainer;
