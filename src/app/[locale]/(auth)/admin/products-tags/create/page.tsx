"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { MultiCategory } from "@/types";
import { getCategories } from "@/services/categoryService";
import CategorySidebar from "../components/CategorySidebar";
import CreateTagForm from "../components/CreateTagForm";
import TagsEmptyState from "../components/TagsEmptyState";
import Link from "next/link";

export default function CreateTagPage() {
  const locale = useAppLocale();
  const t = useTranslations("admin.productTagsPage");
  const isRTL = locale === "ar";

  const [categories, setCategories] = useState<MultiCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/product-settings"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-all hover:border-gray-300 hover:text-gray-700"
          aria-label={t("cancelForm")}
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Tag size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              {t("addTag")}
            </h1>
            <p className="mt-0.5 text-sm text-gray-400">
              {t("selectCategoryDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* Body: Sidebar + Content */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <CategorySidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          tagCountMap={{}}
        />

        <div className="min-w-0 flex-1">
          {selectedCategory ? (
            <CreateTagForm
              categoryName={selectedCategory.title[locale]}
              categoryId={selectedCategoryId!}
            />
          ) : (
            <TagsEmptyState hasCategory={false} />
          )}
        </div>
      </div>
    </div>
  );
}
