"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { PencilIcon, TrashIcon, MapPin, Phone, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { Seller } from "@/types/product";
import { LanguageType } from "@/util/translations";
import Avatar from "@/components/shared/Avatar";
import StatusToggle from "@/components/shared/Buttons/StatusToggle";

interface SellerTableContainerProps {
  data: Seller[];
  locale: LanguageType;
  onEdit: (seller: Seller) => void;
  onDelete: (seller: Seller) => void;
}

const SellerTableContainer: React.FC<SellerTableContainerProps> = ({
  data,
  locale,
  onEdit,
  onDelete,
}) => {
  const t = useTranslations("admin");

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: t("sellerName"),
        render: (item: Seller) => (
          <div className="flex items-center gap-4 py-2">
            <Avatar
              className="scroll-shadow h-12 w-12 rounded-[1.25rem] border border-white shadow-sm"
              imageUrl={item.image}
              name={item.name}
            />
            <div className="flex flex-col gap-0.5">
              <Link
                href={`/${locale}/admin/sellers/${item.id}`}
                className="text-sm font-extrabold text-gray-900 transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400">
                <span className="rounded-full bg-gray-50 px-2 py-0.5 uppercase tracking-tight ring-1 ring-gray-100">
                  ID: {item.id.slice(0, 8)}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "contact",
        header: t("contactInfo"),
        render: (item: Seller) => (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <Phone size={12} className="text-gray-300" />
              <span>01X-XXXX-XXXX</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
              <MapPin size={10} className="text-gray-300" />
              <span className="line-clamp-1">
                {item.city}, {item.country}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "performance",
        header: t("performance"),
        render: (item: Seller) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-gray-900">
                {(item.sales ?? 0).toLocaleString()} EGP
              </span>
              <div className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-600/10">
                <TrendingUp size={10} />
                <span>+12%</span>
              </div>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t("productsCount", { count: item.products || 0 })}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: Seller) => (
          <div className="flex items-center gap-3">
            <StatusToggle
              initialStatus={item.isActive}
              onToggle={(newStatus) =>
                console.log(`Status changed to: ${newStatus}`)
              }
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${item.isActive ? "text-emerald-500" : "text-gray-400"}`}
            >
              {item.isActive
                ? locale === "ar"
                  ? "نشط"
                  : "Active"
                : locale === "ar"
                  ? "غير نشط"
                  : "Inactive"}
            </span>
          </div>
        ),
      },
    ],
    [t, locale],
  );

  return (
    <div className="">
      <DynamicTable
        data={data}
        columns={columns}
        minWidth={1100}
        pagination={true}
        itemsPerPage={10}

        headerClassName="bg-transparent border-b border-slate-50 pb-6 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]"
        rowClassName="hover:bg-slate-50/50 transition-all duration-300 border-b border-slate-50/30 last:border-0"
        actions={[
          {
            label: t("edit"),
            onClick: (item) => onEdit(item as Seller),
            icon: (
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100">
                <PencilIcon size={16} />
              </div>
            ),
            className: "p-0",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as Seller),
            icon: (
              <div className="rounded-xl bg-rose-50 p-2 text-rose-600 transition-colors hover:bg-rose-100">
                <TrashIcon size={16} />
              </div>
            ),
            className: "p-0",
          },
        ]}
      />
    </div>
  );
};

export default SellerTableContainer;
