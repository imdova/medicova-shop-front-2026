"use client";

import { CategoryType, Brand, MultiCategory } from "@/types";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect, useCallback } from "react";
import { ProductFormData } from "@/lib/validations/product-schema";
import {
  getCategories,
  getSubCategories,
  getSubCategoryChildren,
} from "@/services/categoryService";
import { getBrands } from "@/services/brandService";

// Sub-components extracted for better maintainability and to stay under 200 lines
import { CategorySearch } from "./CategoryStepComponents/CategorySearch";
import { CategoryBreadcrumbs } from "./CategoryStepComponents/CategoryBreadcrumbs";
import { CategorySelectionGrid } from "./CategoryStepComponents/CategorySelectionGrid";
import { SelectionFeedback } from "./CategoryStepComponents/SelectionFeedback";

interface CategoryStepProps {
  product: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  locale: string;
}

export const CategoryStep = ({
  product,
  onUpdate,
  locale,
}: CategoryStepProps) => {
  const t = useTranslations("create_product.category");
  const brandT = useTranslations("create_product.brand");

  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState<MultiCategory[]>([]);
  const [items, setItems] = useState<(MultiCategory | Brand)[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAtBrandLevel, setIsAtBrandLevel] = useState(false);

  // Local state to hold full objects for display (SelectionFeedback, grid highlight, etc.)
  const [selectedCategory, setSelectedCategory] = useState<
    MultiCategory | undefined
  >();
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();

  const isArabic = locale === "ar";

  const fetchLevel = useCallback(async (level: number, parentId?: string) => {
    setLoading(true);
    try {
      let data: (MultiCategory | Brand)[] = [];
      if (level === 0) {
        data = await getCategories();
        setIsAtBrandLevel(false);
      } else if (level === 1 && parentId) {
        data = await getSubCategories(parentId);
        setIsAtBrandLevel(false);
        if (data.length === 0) {
          data = await getBrands();
          setIsAtBrandLevel(true);
        }
      } else if (level === 2 && parentId) {
        data = await getSubCategoryChildren(parentId);
        setIsAtBrandLevel(false);
        if (data.length === 0) {
          data = await getBrands();
          setIsAtBrandLevel(true);
        }
      } else {
        data = await getBrands();
        setIsAtBrandLevel(true);
      }
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch classification data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLevel(0);
  }, [fetchLevel]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const name =
        "title" in item
          ? item.title[locale as "en" | "ar"]
          : item.name[locale as "en" | "ar"];
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [items, searchTerm, locale]);

  const handleSelect = async (item: MultiCategory | Brand) => {
    setSearchTerm("");
    if ("title" in item) {
      // It's a category
      const newHistory = [...history, item];
      setHistory(newHistory);
      setSelectedCategory(item);

      // Store string IDs in the form based on depth
      const classificationUpdate = { ...product.classification };
      if (newHistory.length === 1) {
        classificationUpdate.category = item.id;
        classificationUpdate.subcategory = "";
        classificationUpdate.childCategory = "";
      } else if (newHistory.length === 2) {
        classificationUpdate.subcategory = item.id;
        classificationUpdate.childCategory = "";
      } else if (newHistory.length === 3) {
        classificationUpdate.childCategory = item.id;
      }
      onUpdate({ classification: classificationUpdate });

      await fetchLevel(newHistory.length, item.id);
    } else {
      // It's a brand
      setSelectedBrand(item);
      onUpdate({
        classification: {
          ...product.classification,
          brand: item.id,
        },
      });
    }
  };

  const handleNavigateIdx = (idx: number, cat: MultiCategory) => {
    const newHistory = history.slice(0, idx + 1);
    setHistory(newHistory);
    setSelectedCategory(cat);
    setSelectedBrand(undefined);

    // Reset classification IDs for levels deeper than the navigated index
    const classificationUpdate = { ...product.classification, brand: "" };
    if (idx < 1) {
      classificationUpdate.subcategory = "";
      classificationUpdate.childCategory = "";
    } else if (idx < 2) {
      classificationUpdate.childCategory = "";
    }
    onUpdate({ classification: classificationUpdate });

    fetchLevel(idx + 1, cat.id);
  };

  const handleReset = () => {
    setHistory([]);
    setSelectedCategory(undefined);
    setSelectedBrand(undefined);
    onUpdate({
      classification: {
        ...product.classification,
        category: "",
        subcategory: "",
        childCategory: "",
        brand: "",
      },
    });
    fetchLevel(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <CategorySearch
        isAtBrandLevel={isAtBrandLevel}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        brandTitle={brandT("title")}
        categoryTitle={t("title")}
        searchPlaceholder={
          isAtBrandLevel ? brandT("searchPlaceholder") : t("searchPlaceholder")
        }
      />

      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/40 p-2 shadow-xl backdrop-blur-xl">
        <CategoryBreadcrumbs
          history={history}
          isAtBrandLevel={isAtBrandLevel}
          onReset={handleReset}
          onNavigateIdx={handleNavigateIdx}
          locale={locale}
          brandTitle={brandT("title")}
        />

        <CategorySelectionGrid
          loading={loading}
          isAtBrandLevel={isAtBrandLevel}
          filteredItems={filteredItems}
          onSelect={handleSelect}
          selectedBrandId={selectedBrand?.id}
          locale={locale}
          isArabic={isArabic}
        />
      </div>

      <SelectionFeedback
        selectedCategory={selectedCategory}
        selectedBrand={selectedBrand}
        locale={locale}
      />
    </motion.div>
  );
};
