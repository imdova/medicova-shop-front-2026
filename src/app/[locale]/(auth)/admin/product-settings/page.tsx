"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Settings,
  LayoutGrid,
  Layers,
  FolderTree,
  Award,
  Tag,
  Box,
  ShieldCheck,
} from "lucide-react";

import CategoryPanelWrapper from "./components/CategoryPanelWrapper";
import TagsListPanel from "../products-tags/page";
import ProductVariantsPanel from "./components/ProductVariantsPanel";

type TabType =
  | "categories"
  | "subCategories"
  | "childCategory"
  | "brands"
  | "tags"
  | "variants";

const categoryTabs = [
  "categories",
  "subCategories",
  "childCategory",
  "brands",
] as const;
type CategoryTab = (typeof categoryTabs)[number];

function isCategoryTab(tab: TabType): tab is CategoryTab {
  return (categoryTabs as readonly string[]).includes(tab);
}

export default function ProductSettings2Page() {
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<TabType>("categories");

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: "categories",
      label: t("categories"),
      icon: <LayoutGrid size={16} />,
    },
    {
      id: "subCategories",
      label: t("subCategories"),
      icon: <Layers size={16} />,
    },
    {
      id: "childCategory",
      label: t("childCategory"),
      icon: <FolderTree size={16} />,
    },
    { id: "brands", label: t("brands"), icon: <Award size={16} /> },
    { id: "tags", label: t("productTags"), icon: <Tag size={16} /> },
    { id: "variants", label: t("productVariants"), icon: <Box size={16} /> },
  ];

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <Settings className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("productSettings")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("productSettingsDescription")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="bg-primary/5 flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-primary">
              <ShieldCheck size={10} />
              Logic Configured
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Engine: <span className="text-gray-900">v2.0 Stable</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="flex flex-col gap-6">
        <div className="flex w-full items-center gap-1.5 overflow-x-auto rounded-2xl border border-white/60 bg-gray-100/50 p-1.5 backdrop-blur-sm lg:w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black transition-all duration-300 ${
                activeTab === tab.id
                  ? "shadow-primary/5 scale-[1.02] bg-white text-primary shadow-lg ring-1 ring-gray-100"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Panel Content */}
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          {isCategoryTab(activeTab) && (
            <CategoryPanelWrapper activeTab={activeTab} />
          )}
          {activeTab === "tags" && <TagsListPanel />}
          {activeTab === "variants" && <ProductVariantsPanel />}
        </div>
      </div>
    </div>
  );
}
