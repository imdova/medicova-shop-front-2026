"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { CategoryType } from "@/types";
import { cn } from "@/lib/utils";

interface SubcategoryChipsProps {
  subcategories: CategoryType[];
  activeSlug?: string;
  onSelect: (slug: string | undefined) => void;
}

export default function SubcategoryChips({
  subcategories,
  activeSlug,
  onSelect,
}: SubcategoryChipsProps) {
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  if (!subcategories || subcategories.length === 0) return null;

  return (
    <div className="no-scrollbar flex w-full gap-3 overflow-x-auto pb-4 pt-2">
      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          "flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap cursor-pointer",
          !activeSlug
            ? "bg-primary text-white shadow-md shadow-primary/20"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        {isArabic ? "الكل" : "All"}
      </button>

      {subcategories.map((sub) => {
        const subSlug = isArabic ? sub.slugAr || sub.slug : sub.slug;
        const isActive = activeSlug === subSlug;

        return (
          <button
            key={sub.id}
            onClick={() => onSelect(subSlug)}
            className={cn(
              "flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap cursor-pointer",
              isActive
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {sub.title[locale]}
          </button>
        );
      })}
    </div>
  );
}
