"use client";

import React, { useState } from "react";
import { products } from "@/data";
import { LanguageType } from "@/util/translations";
import { useTranslations } from "next-intl";
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import { productFilters } from "@/constants/drawerFilter";
import { DynamicFilterItem } from "@/types/filters";

// Modular Components
import ProductFilters from "../components/ProductFilters";
import ProductTableContainer from "../components/ProductTableContainer";

export default function ProductListPanel({
  locale = "en",
}: {
  locale: LanguageType;
}) {
  const t = useTranslations("admin");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "category",
      label: { en: "Category", ar: "الفئة" },
      type: "dropdown",
      options: [
        { id: "electronics", name: { en: "Electronics", ar: "إلكترونيات" } },
        { id: "clothing", name: { en: "Clothing", ar: "ملابس" } },
      ],
      visible: true,
    },
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "active", name: { en: "Active", ar: "نشط" } },
        { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
      ],
      visible: true,
    },
  ];

  const statusCounts = products.reduce(
    (acc: any, product) => {
      const status = product.status?.en || "draft";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { active: 0, pending: 0, draft: 0 },
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-1000">
      <DynamicFilter
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
        drawerFilters={productFilters}
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
      />

      <ProductFilters
        locale={locale}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleFilters={() => setIsOpen(true)}
      />

      <ProductTableContainer
        locale={locale}
        data={products}
        onEdit={(p) => console.log("edit", p.id)}
        onDelete={(p) => console.log("delete", p.id)}
      />
    </div>
  );
}
