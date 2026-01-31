import { useState } from "react";
import { ChevronLeft, Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductFormData } from "@/lib/validations/product-schema";

import { CategoryType } from "@/types";
import { allCategories } from "@/constants/categouries";
import { CategoryItem } from "../CategoryItem";

interface CategoryStepProps {
  product: ProductFormData;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  onValidate: () => void;
  onBack: () => void;
}

const translations = {
  en: {
    selectProductCategory: "Select Product Category",
    searchCategories: "Search categories",
    searchSubcategories: "Search subcategories",
    noCategoriesFound: "No categories found",
    selected: "Selected",
    nextBrand: "Next: Brand",
    clearSearch: "Clear search",
  },
  ar: {
    selectProductCategory: "اختر فئة المنتج",
    searchCategories: "ابحث في الفئات",
    searchSubcategories: "ابحث في الفئات الفرعية",
    noCategoriesFound: "لا توجد فئات",
    selected: "محدد",
    nextBrand: "التالي: العلامة التجارية",
    clearSearch: "مسح البحث",
  },
};

export const CategoryStep = ({
  product,
  errors,
  onUpdate,
  onValidate,
}: CategoryStepProps) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentParentCategory, setCurrentParentCategory] =
    useState<CategoryType | null>(null);
  const t = translations[language];

  const filteredCategories = allCategories.filter((cat) =>
    cat.title?.[language].toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCategorySelect = (category: CategoryType) => {
    onUpdate({ category });
    setSearchTerm("");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="mb-4 flex items-center">
        {currentParentCategory && (
          <button
            type="button"
            className={`flex items-center text-gray-600 hover:text-gray-800 ${language === "ar" ? "ml-2" : "mr-2"}`}
            onClick={() => setCurrentParentCategory(null)}
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <h2 className="text-xl font-semibold">
          {currentParentCategory
            ? currentParentCategory.title[language]
            : t.selectProductCategory}
        </h2>
      </div>

      {/* Error Display */}
      {errors.category && (
        <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
          {errors.category}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div
            className={`pointer-events-none absolute inset-y-0 ${
              language === "ar" ? "right-0 pr-3" : "left-0 pl-3"
            } flex items-center`}
          >
            <Search className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            className={`w-full rounded-md border border-gray-300 py-2 ${
              language === "ar" ? "pl-4 pr-10" : "pl-10 pr-4"
            } focus:outline-none`}
            placeholder={
              currentParentCategory ? t.searchSubcategories : t.searchCategories
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            dir={language === "ar" ? "rtl" : "ltr"}
          />
          {searchTerm && (
            <button
              type="button"
              className={`absolute inset-y-0 ${
                language === "ar" ? "left-0 pl-3" : "right-0 pr-3"
              } flex items-center text-gray-500 hover:text-gray-700`}
              onClick={() => setSearchTerm("")}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category List */}
      <div className="mb-2 max-h-[250px] space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
        {(searchTerm
          ? filteredCategories
          : (currentParentCategory?.subCategories ?? allCategories)
        ).map((category, index) => (
          <CategoryItem
            key={index}
            category={category}
            onSelect={handleCategorySelect}
            onNavigate={setCurrentParentCategory}
          />
        ))}

        {searchTerm && filteredCategories.length === 0 && (
          <div className="p-3 text-center text-gray-500">
            {t.noCategoriesFound}
          </div>
        )}
      </div>

      {/* Selected Category */}
      {product.category && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3">
          <div className="font-medium">{product.category.title[language]}</div>
          <div className="text-sm text-green-600">{t.selected}</div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          disabled={!product.category}
          onClick={onValidate}
        >
          {t.nextBrand}
        </button>
      </div>
    </div>
  );
};
