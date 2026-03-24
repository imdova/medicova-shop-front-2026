"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  TrashIcon,
  Star,
  EyeIcon,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { ReviewType } from "@/types/product";
import { LanguageType } from "@/util/translations";
import Image from "next/image";

interface ReviewTableContainerProps {
  data: ReviewType[];
  locale: LanguageType;
  onApprove: (review: ReviewType) => void;
  onReject: (review: ReviewType) => void;
  onDelete: (review: ReviewType) => void;
  onView: (review: ReviewType) => void;
}

const ReviewTableContainer: React.FC<ReviewTableContainerProps> = ({
  data,
  locale,
  onApprove,
  onReject,
  onDelete,
  onView,
}) => {
  const t = useTranslations("admin");

  const columns = useMemo(
    () => [
      {
        key: "product",
        header: t("product"),
        render: (item: ReviewType) => (
          <Link
            className="flex items-center gap-2 font-bold text-gray-900 transition-colors hover:text-primary"
            href={`/${locale}/admin/products/details/${typeof item.product.id === "object" ? (item.product.id as any)._id || (item.product.id as any).id : item.product.id}`}
          >
            <span className="max-w-[120px] truncate text-xs">
              {item.product.title?.[locale] || (locale === "en" ? "Product" : "منتج")}
            </span>
            <ExternalLink size={12} className="text-gray-300" />
          </Link>
        ),
      },
      {
        key: "user",
        header: t("user"),
        render: (item: ReviewType) => (
          <div className="flex items-center gap-2">
            {item.user.avatar && (
              <Image
                src={item.user.avatar}
                alt={item.user.firstName}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full border border-white object-cover shadow-sm"
              />
            )}
            <div className="flex flex-col">
              <span className="line-clamp-1 text-xs font-bold text-gray-900">{`${item.user.firstName} ${item.user.lastName}`}</span>
              <span className="line-clamp-1 text-[10px] font-medium text-gray-400">
                {item.user.email}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "rating",
        header: t("rating"),
        render: (item: ReviewType) => (
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                className={
                  star <= item.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }
              />
            ))}
          </div>
        ),
      },
      {
        key: "comment",
        header: t("comment"),
        render: (item: ReviewType) => (
          <p className="line-clamp-2 max-w-[180px] text-[11px] font-medium leading-relaxed text-gray-500">
            {item.comment}
          </p>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: ReviewType) => {
          const statusEn = item.status.en?.toLowerCase();
          const colors: Record<string, string> = {
            published: "bg-emerald-50 text-emerald-600 border-emerald-100",
            pending: "bg-amber-50 text-amber-600 border-amber-100",
            rejected: "bg-rose-50 text-rose-600 border-rose-100",
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
        key: "createdAt",
        header: t("createdAt"),
        render: (item: ReviewType) => (
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
        solidActions={[
          {
            label: t("view"),
            onClick: (item) => onView(item as ReviewType),
            icon: <EyeIcon className="h-4 w-4" />,
            color: "#6366f1",
          },
          {
            label: t("approve"),
            onClick: (item) => onApprove(item as ReviewType),
            icon: <CheckCircle className="h-4 w-4" />,
            color: "#10b981",
            hide: (item: ReviewType) => item.approved,
          },
          {
            label: t("delete"),
            onClick: (item) => onDelete(item as ReviewType),
            icon: <TrashIcon className="h-4 w-4" />,
            color: "#f43f5e",
          },
        ]}
      />
    </div>
  );
};

export default ReviewTableContainer;
