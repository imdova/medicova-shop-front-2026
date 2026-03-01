"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Database, ShieldCheck, Activity, Package } from "lucide-react";

// Types & Data
import { ProductInventory } from "@/types/product";
import { mockProductInventory } from "@/constants/inventory";
import { DynamicFilterItem } from "@/types/filters";

// Components
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import InventoryFilters from "./components/InventoryFilters";
import InventoryTableContainer from "./components/InventoryTableContainer";

export default function ProductInventoryPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const filteredInventory = useMemo(() => {
    return mockProductInventory.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery]);

  const stockCounts = useMemo(() => {
    return mockProductInventory.reduce(
      (acc, item) => {
        if (item.quantity === 0) acc.outOfStock++;
        else if (item.quantity < 10) acc.lowStock++;
        else acc.inStock++;
        return acc;
      },
      { inStock: 0, lowStock: 0, outOfStock: 0 },
    );
  }, []);

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "stockStatus",
      label: { en: "Stock Status", ar: "حالة المخزون" },
      type: "dropdown",
      options: [
        { id: "inStock", name: { en: "In Stock", ar: "متوفر" } },
        { id: "lowStock", name: { en: "Low Stock", ar: "منخفض المخزون" } },
        { id: "outOfStock", name: { en: "Out of Stock", ar: "غير متوفر" } },
      ],
      visible: true,
    },
    {
      id: "storefrontManagement",
      label: { en: "Storefront Management", ar: "إدارة المتجر" },
      type: "dropdown",
      options: [
        { id: "in_stock", name: { en: "Managed", ar: "مدار" } },
        { id: "out_stock", name: { en: "Not Managed", ar: "غير مدار" } },
      ],
      visible: true,
    },
  ];

  const toggleExpand = (id: number) => {
    const next = new Set(expandedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedItems(next);
  };

  const handleReset = () => {
    setSearchQuery("");
  };

  const handleSave = (
    id: number,
    data: { storefrontManagement: string; quantity: number },
  ) => {
    console.log("Saving inventory update:", id, data);
    alert(`Inventory updated for ID: ${id}`);
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <Database className="text-indigo-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("inventory")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("inventoryDescription")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-500">
              <ShieldCheck size={10} />
              Warehouse Sync
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Inventory: <span className="text-gray-900">Synchronized</span>
            </span>
          </div>
        </div>
      </div>

      <DynamicFilter
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
        drawerFilters={[]}
        statusCounts={stockCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
      />

      <InventoryFilters
        locale={locale}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleFilters={() => setIsOpen(true)}
        onReset={handleReset}
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-gray-100/50 p-1 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-primary shadow-sm">
            <Activity size={14} />
            {t("allStatuses")}
          </div>
        </div>

        <p className="rounded-xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-sm">
          {filteredInventory.length} {t("products")} {t("found")}
        </p>
      </div>

      <InventoryTableContainer
        locale={locale}
        data={filteredInventory}
        expandedItems={expandedItems}
        toggleExpand={toggleExpand}
        onSave={handleSave}
      />
    </div>
  );
}
