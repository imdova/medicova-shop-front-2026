"use client";

import { PencilIcon, TrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { ProductTag } from "@/types/product";
import { MultiCategory } from "@/types";

interface TagsTableProps {
  tags: ProductTag[];
  categories: MultiCategory[];
  onEdit: (tag: ProductTag) => void;
  onDelete: (tag: ProductTag) => void;
}

export default function TagsTable({
  tags,
  categories,
  onEdit,
  onDelete,
}: TagsTableProps) {
  const locale = useAppLocale();
  const t = useTranslations("admin.productTagsPage");
  const isRTL = locale === "ar";

  const getCategoryName = (tag: ProductTag) => {
    const catId = tag.categoryId;
    if (!catId) return "—";
    const cat = categories.find((c) => c.id === catId);
    return cat?.title[locale] ?? "—";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" dir={isRTL ? "rtl" : "ltr"}>
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-gray-500">
                {t("tagName")}
              </th>
              <th className="hidden px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-gray-500 sm:table-cell">
                {t("slug")}
              </th>
              <th className="hidden px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-gray-500 md:table-cell">
                {t("category")}
              </th>
              <th className="px-4 py-3 text-end text-xs font-bold uppercase tracking-wider text-gray-500">
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
                onEdit={() => onEdit(tag)}
                onDelete={() => onDelete(tag)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Table Row ──────────────────────────────────────────── */
function TagRow({
  tag,
  locale,
  categoryName,
  onEdit,
  onDelete,
}: {
  tag: ProductTag;
  locale: "en" | "ar";
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="group transition-colors hover:bg-gray-50/60">
      {/* Tag Name */}
      <td className="px-4 py-3">
        <div>
          <span className="font-semibold text-gray-900">
            {tag.name[locale]}
          </span>
          {locale === "en" && tag.name.ar && (
            <p className="mt-0.5 text-xs text-gray-400" dir="rtl">
              {tag.name.ar}
            </p>
          )}
          {locale === "ar" && tag.name.en && (
            <p className="mt-0.5 text-xs text-gray-400" dir="ltr">
              {tag.name.en}
            </p>
          )}
        </div>
      </td>

      {/* Slug */}
      <td className="hidden px-4 py-3 sm:table-cell">
        <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500">
          {tag.slug}
        </code>
      </td>

      {/* Category */}
      <td className="hidden px-4 py-3 md:table-cell">
        <span className="text-xs font-medium text-gray-600">
          {categoryName}
        </span>
      </td>

      <td className="px-4 py-3 text-end">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600"
            aria-label="Edit"
          >
            <PencilIcon size={14} />
          </button>
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
