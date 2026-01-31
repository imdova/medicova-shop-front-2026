"use client";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductOptionsListPanel from "@/app/(auth)/admin/product-options/page";
import AttributesListPanel from "@/app/(auth)/admin/product-attributes/page";
import TagsListPanel from "@/app/(auth)/admin/products-tags/page";
import CategoryBrandSetup from "@/app/(auth)/admin/categories/page";

// Translation dictionary
const translations = {
  en: {
    title: "Product Settings",
    description: "Manage product configurations, attributes, options, tags, and categories",
    productOptions: "Product Options",
    productAttributes: "Product Attributes",
    productTags: "Product Tags",
    categories: "Categories",
    create: "Create",
  },
  ar: {
    title: "إعدادات المنتج",
    description: "إدارة تكوينات المنتج والخصائص والخيارات والعلامات والفئات",
    productOptions: "خيارات المنتج",
    productAttributes: "خصائص المنتج",
    productTags: "علامات المنتج",
    categories: "الفئات",
    create: "إنشاء",
  },
};

type TabType = "options" | "attributes" | "tags" | "categories";

export default function ProductSettingsPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>("options");
  const t = translations[language];
  const isRTL = language === "ar";

  return (
    <div className="relative space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h2 className="mb-1 text-2xl font-bold">{t.title}</h2>
        <p className="max-w-lg text-sm text-gray-600">{t.description}</p>
      </div>

      {/* Tabs Navigation */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex justify-start">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "options"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("options")}
            >
              {t.productOptions}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "attributes"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("attributes")}
            >
              {t.productAttributes}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "tags"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("tags")}
            >
              {t.productTags}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "categories"
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("categories")}
            >
              {t.categories}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "options" && <ProductOptionsListPanel />}
          {activeTab === "attributes" && <AttributesListPanel />}
          {activeTab === "tags" && <TagsListPanel />}
          {activeTab === "categories" && <CategoryBrandSetup />}
        </div>
      </div>
    </div>
  );
}

