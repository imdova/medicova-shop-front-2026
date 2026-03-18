"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { CategoryType } from "@/types";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface SubcategoryChipsProps {
  subcategories: CategoryType[];
  currentPath: string;
  activeSlug?: string;
}

export default function SubcategoryChips({
  subcategories,
  currentPath,
  activeSlug,
}: SubcategoryChipsProps) {
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  if (!subcategories || subcategories.length === 0) return null;

  return (
    <div className="no-scrollbar flex w-full gap-3 overflow-x-auto pb-4 pt-2">
      <Link
        href={`/category/${currentPath}`}
        scroll={false}
        className={cn(
          "flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap",
          !activeSlug
            ? "bg-primary text-white shadow-md shadow-primary/20"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        )}
      >
        {isArabic ? "الكل" : "All"}
      </Link>

      {subcategories.map((sub) => {
        const subSlug = isArabic ? sub.slugAr || sub.slug : sub.slug;
        const isActive = activeSlug === subSlug;

        return (
          <Link
            key={sub.id}
            href={`/category/${currentPath}?subcategory=${subSlug}`}
            scroll={false}
            className={cn(
              "flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap",
              isActive
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {sub.title[locale]}
          </Link>
        );
      })}
    </div>
  );
}
