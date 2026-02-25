"use client";

import React, { useMemo } from "react";
import {
  PencilIcon,
  TrashIcon,
  Layout,
  Layers,
  Calendar,
  FolderOpen,
} from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { LanguageType } from "@/util/translations";
import Link from "next/link";

interface GroupTableContainerProps {
  data: any[];
  locale: LanguageType;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

const GroupTableContainer: React.FC<GroupTableContainerProps> = ({
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
        render: (item: any) => (
          <span className="font-mono text-[10px] font-bold text-gray-400">
            #{item.id}
          </span>
        ),
      },
      {
        key: "name",
        header: t("name"),
        render: (item: any) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-500 shadow-sm">
              <FolderOpen size={18} />
            </div>
            <Link
              href={`/${locale}/admin/specification-groups/edit/${item.id}`}
              className="text-xs font-black text-gray-900 transition-colors hover:text-blue-600"
            >
              {item.name[locale]}
            </Link>
          </div>
        ),
      },
      {
        key: "description",
        header: t("description"),
        render: (item: any) => (
          <p className="line-clamp-1 max-w-[300px] text-[11px] font-medium text-gray-500">
            {item.description[locale]}
          </p>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: any) => {
          const status = item.status.en || "draft";
          const isPublished = status === "published";

          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider ${
                isPublished
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-emerald-500" : "bg-gray-400"}`}
              />
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
          <Layers size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-gray-900">
            Groups Grid
          </h4>
          <p className="mt-0.5 text-[10px] font-bold text-gray-400">
            Categorical Structure Management
          </p>
        </div>
      </div>

      <DynamicTable
        data={data}
        columns={columns}
        minWidth={800}
        pagination={true}
        itemsPerPage={10}

        headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-wider"
        rowClassName="hover:bg-gray-50/80 transition-colors duration-300 border-b border-gray-50/50"
        actions={[
          {
            label: t("edit"),
            onClick: (item) => onEdit(item),
            icon: <PencilIcon className="h-4 w-4" />,
            className: "text-blue-600 font-bold",
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

export default GroupTableContainer;
