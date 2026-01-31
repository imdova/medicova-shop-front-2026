import { ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CategoryType } from "@/types";

interface CategoryItemProps {
  category: CategoryType;
  onSelect: (category: CategoryType) => void;
  onNavigate: (category: CategoryType) => void;
}

export const CategoryItem = ({
  category,
  onSelect,
  onNavigate,
}: CategoryItemProps) => {
  const { language, isArabic } = useLanguage();
  const hasSubcategories =
    category.subCategories && category.subCategories.length > 0;

  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-md p-2 text-left hover:bg-gray-100"
      onClick={() => {
        if (hasSubcategories) {
          onNavigate(category);
        } else {
          onSelect(category);
        }
      }}
    >
      <div className="flex flex-col items-start">
        <div className="font-medium">{category.title[language]}</div>
        {category.slug && (
          <div className="text-sm text-gray-500">{category.slug}</div>
        )}
      </div>
      {hasSubcategories && (
        <div className="flex items-center">
          <span className="mr-2 text-xs text-gray-400">
            {category.subCategories?.length}{" "}
            {isArabic ? "فئات الفرعية" : "subcategories"}
          </span>
          {isArabic ? (
            <ChevronLeft className="text-gray-400" size={16} />
          ) : (
            <ChevronRight className="text-gray-400" size={16} />
          )}
        </div>
      )}
    </button>
  );
};
