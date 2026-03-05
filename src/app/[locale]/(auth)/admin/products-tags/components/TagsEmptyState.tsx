"use client";

import { Tag, FolderOpen, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface TagsEmptyStateProps {
  hasCategory: boolean;
  onAddTag?: () => void;
}

export default function TagsEmptyState({
  hasCategory,
  onAddTag,
}: TagsEmptyStateProps) {
  const t = useTranslations("admin.productTagsPage");

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50/80 to-white px-6 py-16 text-center">
      {/* Icon */}
      <div className="bg-primary/10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
        {hasCategory ? (
          <Tag size={28} className="text-primary" />
        ) : (
          <FolderOpen size={28} className="text-primary" />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-base font-bold text-gray-900">
        {hasCategory ? t("noTagsTitle") : t("selectCategory")}
      </h3>

      {/* Description */}
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-gray-500">
        {hasCategory ? t("noTagsDesc") : t("selectCategoryDesc")}
      </p>

      {/* CTA */}
      {hasCategory && onAddTag && (
        <button
          type="button"
          onClick={onAddTag}
          className="shadow-primary/20 hover:shadow-primary/30 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
        >
          <Plus size={16} />
          {t("addTag")}
        </button>
      )}
    </div>
  );
}
