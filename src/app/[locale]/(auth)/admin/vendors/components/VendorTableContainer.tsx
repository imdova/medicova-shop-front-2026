"use client";

import React, { useMemo } from "react";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  Mail,
  Phone,
  Store,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { VendorType } from "@/types/customers";
import { LanguageType } from "@/util/translations";
import Link from "next/link";
import Image from "next/image";

interface VendorTableContainerProps {
  data: VendorType[];
  locale: LanguageType;
  onView: (vendor: VendorType) => void;
  onEdit: (vendor: VendorType) => void;
  onDelete: (vendor: VendorType) => void;
}

const VendorTableContainer: React.FC<VendorTableContainerProps> = ({
  data,
  locale,
  onView,
  onEdit,
  onDelete,
}) => {
  const t = useTranslations("admin");

  const columns = useMemo(
    () => [
      {
        key: "id",
        header: t("id"),
        render: (item: VendorType) => (
          <span className="font-mono text-[10px] font-bold text-gray-400">
            #{item.id}
          </span>
        ),
      },
      {
        key: "vendor",
        header: t("name"),
        render: (item: VendorType) => (
          <div className="flex min-w-[200px] items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white bg-gray-50 shadow-sm">
              <Image
                src={item.avatar || "/avatars/default-vendor.jpg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Link
                href={`/${locale}/admin/vendors/${item.id}`}
                className="text-xs font-bold text-gray-900 transition-colors hover:text-emerald-500"
              >
                {item.name}
              </Link>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Mail size={10} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400">
                  {item.email}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "store",
        header: t("storeName"),
        render: (item: VendorType) => (
          <div className="min-w-[150px]">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                <Store size={14} />
              </div>
              <span className="text-xs font-bold text-gray-700">
                {item.storeName}
              </span>
            </div>
            <div className="ml-9 mt-1 flex items-center gap-1.5">
              <Phone size={10} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400">
                {item.storePhone}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "performance",
        header: t("balance"),
        render: (item: VendorType) => (
          <div className="flex flex-col">
            <span
              className={`text-xs font-black ${item.balance > 0 ? "text-emerald-600" : "text-gray-900"}`}
            >
              ${item.balance.toLocaleString()}
            </span>
            <span className="mt-0.5 text-[9px] font-black uppercase tracking-tighter text-gray-400">
              Rev: ${item.totalRevenue.toLocaleString()}
            </span>
          </div>
        ),
      },
      {
        key: "verified",
        header: t("verified"),
        render: (item: VendorType) => (
          <div className="flex justify-center">
            {item.verified ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-sm">
                <CheckCircle size={14} />
              </div>
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 text-gray-300">
                <XCircle size={14} />
              </div>
            )}
          </div>
        ),
      },
    ],
    [t, locale],
  );

  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl transition-all duration-500">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
          <Users size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-gray-900">
            {t("vendors")}
          </h4>
          <p className="mt-0.5 text-[10px] font-bold text-gray-400">
            Performance & Account Management
          </p>
        </div>
      </div>

      <DynamicTable
        data={data}
        columns={columns}
        minWidth={1200}
        pagination={true}
        itemsPerPage={10}

        headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-wider"
        rowClassName="hover:bg-gray-50/80 transition-colors duration-300 border-b border-gray-50/50"
        actions={[
          {
            label: t("view"),
            onClick: (item) => onView(item as VendorType),
            icon: <EyeIcon className="h-4 w-4" />,
            className: "text-emerald-600 font-bold",
          },
          {
            label: t("edit"),
            onClick: (item) => onEdit(item as VendorType),
            icon: <PencilIcon className="h-4 w-4" />,
            className: "text-blue-600 font-bold",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as VendorType),
            icon: <TrashIcon className="h-4 w-4" />,
            className: "text-rose-600 font-bold",
          },
        ]}
      />
    </div>
  );
};

export default VendorTableContainer;
