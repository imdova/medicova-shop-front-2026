"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { LayoutGrid, Layers, Award } from "lucide-react";

// Modular Components
import CategoryTabContent from "./components/CategoryTabContent";
import SubCategoryTabContent from "./components/SubCategoryTabContent";
import BrandTabContent from "./components/BrandTabContent";

// Constants & Types
import {
  sampleCategories,
  sampleSubCategories,
  sampleBrands,
  Category,
  SubCategory,
  Brand,
} from "./constants";

export default function CategoriesPage() {
  const t = useTranslations("admin");
  const locale = useLocale() as "en" | "ar";
  const [activeTab, setActiveTab] = useState<
    "categories" | "subCategories" | "brands"
  >("categories");
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState<Category[]>(sampleCategories);
  const [subCategories, setSubCategories] =
    useState<SubCategory[]>(sampleSubCategories);
  const [brands, setBrands] = useState<Brand[]>(sampleBrands);

  const tabs = [
    { id: "categories", label: t("categoriesLabel"), icon: LayoutGrid },
    { id: "subCategories", label: t("subCategories"), icon: Layers },
    { id: "brands", label: t("brands"), icon: Award },
  ] as const;

  const handleStatusChange = (type: string, item: any, newStatus: boolean) => {
    const update = (prev: any[]) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              isActive: newStatus,
              status: newStatus ? "active" : "inactive",
            }
          : i,
      );
    if (type === "category") setCategories(update);
    if (type === "subCategory") setSubCategories(update);
    if (type === "brand") setBrands(update);
  };

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F8FAFC] p-4 duration-700 md:p-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            {t("categorySetup")}
          </h1>
          <p className="font-medium text-gray-400">
            {t("categoriesDescription")}
          </p>
        </div>

        {/* Luxury Tabs */}
        <div className="mb-8 flex w-fit items-center gap-2 rounded-2xl bg-gray-100/40 p-1.5 backdrop-blur-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-white text-gray-900 shadow-lg shadow-gray-200/50"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div
                  className={`flex size-5 items-center justify-center rounded-md ${
                    isActive ? "bg-[#EDF3F0] text-[#7BA68E]" : "bg-gray-100/50"
                  }`}
                >
                  <tab.icon size={14} />
                </div>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-500">
          {activeTab === "categories" && (
            <CategoryTabContent
              data={categories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onStatusChange={(item, status) => handleStatusChange("category", item, status)}
              onEdit={(item) => console.log("Edit cat", item.id)}
              onDelete={(item) => console.log("Delete cat", item.id)}             />
          )}
          {activeTab === "subCategories" && (
            <SubCategoryTabContent
              data={subCategories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onStatusChange={(item, status) => handleStatusChange("subCategory", item, status)}
              onEdit={(item) => console.log("Edit subcat", item.id)}
              onDelete={(item) => console.log("Delete subcat", item.id)}             />
          )}
          {activeTab === "brands" && (
            <BrandTabContent
              data={brands}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onStatusChange={(item, status) => handleStatusChange("brand", item, status)}
              onEdit={(item) => console.log("Edit brand", item.id)}
              onDelete={(item) => console.log("Delete brand", item.id)}             />
          )}
        </div>
      </div>
    </div>
  );
}
