"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Tag, Plus, PencilIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { ProductTag } from "@/types/product";
import { MultiCategory } from "@/types";
import { getCategories } from "@/services/categoryService";
import { ProductTags } from "@/constants/productTags";
import ConfirmDialog from "./components/ConfirmDialog";
import Link from "next/link";
import toast from "react-hot-toast";

export default function TagsListPanel() {
  const locale = useAppLocale();
  const t = useTranslations("admin.productTagsPage");
  const isRTL = locale === "ar";

  const [categories, setCategories] = useState<MultiCategory[]>([]);
  const [tags, setTags] = useState<ProductTag[]>(ProductTags);
  const [deletingTag, setDeletingTag] = useState<ProductTag | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const getCategoryName = useCallback(
    (tag: ProductTag) => {
      if (categories.length === 0) return "—";
      const idx = tags.indexOf(tag) % categories.length;
      return categories[idx]?.title[locale] ?? "—";
    },
    [categories, tags, locale],
  );

  const handleDelete = useCallback(() => {
    if (!deletingTag) return;
    setTags((prev) => prev.filter((t) => t.id !== deletingTag.id));
    toast.success(locale === "ar" ? "تم الحذف بنجاح" : "Tag deleted!");
    setDeletingTag(null);
  }, [deletingTag, locale]);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm">
            <Tag size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              {t("title")}
            </h1>
            <p className="mt-0.5 text-sm text-gray-400">{t("description")}</p>
          </div>
        </div>

        <Link
          href="/admin/products-tags/create"
          className="flex items-center gap-2 self-start rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md sm:self-auto"
        >
          <Plus size={16} />
          {t("addTag")}
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-5 py-3.5 text-start text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("tagName")}
                </th>
                <th className="hidden px-5 py-3.5 text-start text-xs font-bold uppercase tracking-wider text-gray-500 md:table-cell">
                  {t("category")}
                </th>
                <th className="hidden px-5 py-3.5 text-start text-xs font-bold uppercase tracking-wider text-gray-500 lg:table-cell">
                  {t("createdAt")}
                </th>
                <th className="px-5 py-3.5 text-end text-xs font-bold uppercase tracking-wider text-gray-500">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tags.map((tag) => (
                <TagRow
                  key={tag.id}
                  tag={tag}
                  locale={locale}
                  categoryName={getCategoryName(tag)}
                  onDelete={() => setDeletingTag(tag)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deletingTag}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTag(null)}
      />
    </div>
  );
}

/* ── Table Row ──────────────────────────────────────────── */
function TagRow({
  tag,
  locale,
  categoryName,
  onDelete,
}: {
  tag: ProductTag;
  locale: "en" | "ar";
  categoryName: string;
  onDelete: () => void;
}) {
  const formattedDate = new Date(tag.createdAt).toLocaleDateString(
    locale === "en" ? "en-US" : "ar-EG",
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <tr className="group transition-colors hover:bg-gray-50/60">
      <td className="px-5 py-3.5">
        <div>
          <span className="font-semibold text-gray-900">
            {tag.name[locale]}
          </span>
          <p
            className="mt-0.5 text-xs text-gray-400"
            dir={locale === "en" ? "rtl" : "ltr"}
          >
            {locale === "en" ? tag.name.ar : tag.name.en}
          </p>
        </div>
      </td>
      <td className="hidden px-5 py-3.5 md:table-cell">
        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          {categoryName}
        </span>
      </td>
      <td className="hidden px-5 py-3.5 lg:table-cell">
        <span className="text-xs text-gray-500">{formattedDate}</span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/products-tags/edit/${tag.id}`}
            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
            aria-label="Edit"
          >
            <PencilIcon size={14} />
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
            aria-label="Delete"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}
