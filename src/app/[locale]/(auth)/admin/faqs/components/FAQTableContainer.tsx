"use client";

import React, { useMemo } from "react";
import { PencilIcon, TrashIcon, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { FAQ } from "@/types";
import { LanguageType } from "@/util/translations";
import Link from "next/link";

interface FAQTableContainerProps {
  data: FAQ[];
  locale: LanguageType;
  onEdit: (faq: FAQ) => void;
  onDelete: (faq: FAQ) => void;
}

const FAQTableContainer: React.FC<FAQTableContainerProps> = ({
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
        render: (item: FAQ) => (
          <span className="font-mono text-[10px] font-bold text-gray-400">
            #{item.id}
          </span>
        ),
      },
      {
        key: "question",
        header: t("question"),
        render: (item: FAQ) => (
          <div className="flex min-w-[300px] items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
              <HelpCircle size={16} />
            </div>
            <Link
              href={`/${locale}/admin/faqs/edit/${item.id}`}
              className="line-clamp-2 text-xs font-bold leading-relaxed text-gray-900 transition-colors hover:text-primary"
            >
              {item.question[locale]}
            </Link>
          </div>
        ),
      },
      {
        key: "category",
        header: t("category"),
        render: (item: FAQ) => (
          <span className="inline-flex items-center rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-500">
            {item.category[locale]}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: t("createdAt"),
        render: (item: FAQ) => {
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
        render: (item: FAQ) => {
          const status = item.status.en;
          const colors: Record<string, string> = {
            published: "bg-emerald-50 text-emerald-600 border-emerald-100",
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
            onClick: (item) => onEdit(item as FAQ),
            icon: <PencilIcon className="h-4 w-4" />,
            className: "text-blue-600 font-bold",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as FAQ),
            icon: <TrashIcon className="h-4 w-4" />,
            className: "text-rose-600 font-bold",
          },
        ]}
      />
    </div>
  );
};

export default FAQTableContainer;
