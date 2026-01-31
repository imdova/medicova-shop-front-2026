import { useState } from "react";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductFormData } from "@/lib/validations/product-schema";
import { brands } from "@/constants/brands";
import { Brand } from "@/types";

interface BrandStepProps {
  product: ProductFormData;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  onValidate: () => void;
  onBack: () => void;
}

const translations = {
  en: {
    selectBrand: "Select Brand",
    searchBrand: "Search brand",
    noBrandsFound: "No brands found",
    selected: "Selected",
    back: "Back",
    nextIdentity: "Next: Identity",
    clearSearch: "Clear search",
  },
  ar: {
    selectBrand: "اختر العلامة التجارية",
    searchBrand: "ابحث عن علامة تجارية",
    noBrandsFound: "لا توجد علامات تجارية",
    selected: "محدد",
    back: "رجوع",
    nextIdentity: "التالي: الهوية",
    clearSearch: "مسح البحث",
  },
};

export const BrandStep = ({
  product,
  errors,
  onUpdate,
  onValidate,
  onBack,
}: BrandStepProps) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const t = translations[language];

  const filteredBrands = brands.filter((brand) =>
    brand.name[language].toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleBrandSelect = (brand: Brand) => {
    onUpdate({ brand });
    setSearchTerm("");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold">{t.selectBrand}</h2>

      {errors.brand && (
        <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
          {errors.brand}
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
            placeholder={t.searchBrand}
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

      {/* Brands List */}
      <div className="mb-6 max-h-[250px] space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
        {filteredBrands.length > 0 ? (
          filteredBrands.map((brand) => (
            <button
              type="button"
              key={brand.id}
              className={`w-full cursor-pointer rounded-md border p-3 text-left ${
                product.brand?.id === brand.id
                  ? "border-green-500 bg-green-50"
                  : "border-white hover:bg-gray-100"
              }`}
              onClick={() => handleBrandSelect(brand)}
            >
              {brand.name[language]}
            </button>
          ))
        ) : (
          <div className="p-3 text-center text-gray-500">{t.noBrandsFound}</div>
        )}
      </div>

      {/* Selected Brand */}
      {product.brand && (
        <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3">
          <div className="font-medium">{product.brand.name[language]}</div>
          <div className="text-sm text-green-600">{t.selected}</div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          onClick={onBack}
        >
          {t.back}
        </button>
        <button
          type="button"
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          disabled={!product.brand}
          onClick={onValidate}
        >
          {t.nextIdentity}
        </button>
      </div>
    </div>
  );
};
