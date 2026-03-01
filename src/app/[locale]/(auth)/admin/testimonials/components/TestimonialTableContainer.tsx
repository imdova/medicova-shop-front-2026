"use client";

import React, { useMemo } from "react";
import {
  PencilIcon,
  TrashIcon,
  MessageSquare,
  Calendar,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { Testimonial } from "@/types";
import { LanguageType } from "@/util/translations";
import Link from "next/link";
import Image from "next/image";

interface TestimonialTableContainerProps {
  data: Testimonial[];
  locale: LanguageType;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (testimonial: Testimonial) => void;
}

const TestimonialTableContainer: React.FC<TestimonialTableContainerProps> = ({
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
        render: (item: Testimonial) => (
          <span className="font-mono text-[10px] font-bold text-gray-400">
            #{item.id}
          </span>
        ),
      },
      {
        key: "testimonial",
        header: t("name"),
        render: (item: Testimonial) => (
          <div className="flex min-w-[250px] items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white bg-gray-50 shadow-sm">
              <Image
                src={item.image || "/avatars/default-user.jpg"}
                alt={item.name[locale]}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Link
                href={`/${locale}/admin/testimonials/edit/${item.id}`}
                className="text-xs font-bold text-gray-900 transition-colors hover:text-amber-500"
              >
                {item.name[locale]}
              </Link>
            </div>
          </div>
        ),
      },
      {
        key: "content",
        header: t("testimonial"),
        render: (item: Testimonial) => (
          <div className="max-w-xs xl:max-w-md">
            <p className="line-clamp-2 text-[11px] font-medium italic text-gray-500">
              "
              {item.content?.[locale] ||
                item.content?.[locale === "ar" ? "en" : "ar"]}
              "
            </p>
          </div>
        ),
      },
      {
        key: "date",
        header: t("date"),
        render: (item: Testimonial) => {
          const date = new Date(item.createdAt);
          return (
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar size={12} />
              <span className="text-[10px] font-bold">
                {date.toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}
              </span>
            </div>
          );
        },
      },
      {
        key: "status",
        header: t("status"),
        render: (item: Testimonial) => {
          const status = item.status?.en || "draft";
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
    ],
    [t, locale],
  );

  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl transition-all duration-500">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
          <MessageSquare size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-gray-900">
            {t("testimonials")}
          </h4>
          <p className="mt-0.5 text-[10px] font-bold text-gray-400">
            Customer Experience Management
          </p>
        </div>
      </div>

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
            onClick: (item) => onEdit(item as Testimonial),
            icon: <PencilIcon className="h-4 w-4" />,
            className: "text-blue-600 font-bold",
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as Testimonial),
            icon: <TrashIcon className="h-4 w-4" />,
            className: "text-rose-600 font-bold",
          },
        ]}
      />
    </div>
  );
};

export default TestimonialTableContainer;
