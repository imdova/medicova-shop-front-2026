"use client";

import { Search, ChevronRight, ChevronLeft, X, Check } from "lucide-react";
import { CategoryType } from "@/types";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface CategoryStepProps {
  categories: CategoryType[];
  selectedCategory: CategoryType | null;
  onSelect: (category: CategoryType) => void;
  locale: string;
}

export const CategoryStep = ({
  categories,
  selectedCategory,
  onSelect,
  locale,
}: CategoryStepProps) => {
  const t = useTranslations("create_product.category");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentParent, setCurrentParent] = useState<CategoryType | null>(null);

  const isArabic = locale === "ar";

  const displayedCategories = (
    currentParent?.subCategories || categories
  ).filter((cat) =>
    cat.title[locale as "en" | "ar"]
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-primary/10 w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3 pl-12 pr-4 font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white/50 shadow-sm backdrop-blur-xl">
        {currentParent && (
          <button
            onClick={() => setCurrentParent(null)}
            className="flex w-full items-center gap-2 border-b border-gray-50 bg-gray-50/30 p-4 text-sm font-bold text-primary transition-colors hover:bg-gray-100/50"
          >
            {isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {currentParent.title[locale as "en" | "ar"]}
          </button>
        )}

        <div className="max-h-[400px] divide-y divide-gray-50 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {displayedCategories.length > 0 ? (
              displayedCategories.map((cat, index) => (
                <motion.button
                  key={`${currentParent?.id || "root"}-${cat.id}-${index}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    if (cat.subCategories && cat.subCategories.length > 0) {
                      setCurrentParent(cat);
                    } else {
                      onSelect(cat);
                    }
                  }}
                  className={`hover:bg-primary/5 flex w-full items-center justify-between p-4 transition-all ${
                    selectedCategory?.id === cat.id
                      ? "bg-primary/10 text-primary"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex flex-col items-start gap-0.5 text-right rtl:text-right">
                    <span className="font-bold">
                      {cat.title[locale as "en" | "ar"]}
                    </span>
                    {cat.slug && (
                      <span className="text-[10px] uppercase tracking-widest text-gray-400">
                        {cat.slug}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {cat.subCategories && cat.subCategories.length > 0 && (
                      <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase text-gray-400">
                        {cat.subCategories.length} {t("subcategories")}
                      </span>
                    )}
                    {isArabic ? (
                      <ChevronLeft
                        size={18}
                        className={
                          selectedCategory?.id === cat.id
                            ? "text-primary"
                            : "text-gray-300"
                        }
                      />
                    ) : (
                      <ChevronRight
                        size={18}
                        className={
                          selectedCategory?.id === cat.id
                            ? "text-primary"
                            : "text-gray-300"
                        }
                      />
                    )}
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="p-12 text-center font-medium text-gray-400">
                {t("noResults")}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              Currently Selected
            </span>
            <span className="font-bold text-emerald-900">
              {selectedCategory.title[locale as "en" | "ar"]}
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <Check size={18} strokeWidth={3} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
