"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Zap, ShieldCheck, Activity, Timer } from "lucide-react";

// Types & Data
import { FlashSale } from "@/types/product";
import { FlashSalesData } from "@/constants/flashSales";
import { DynamicFilterItem } from "@/types/filters";

// Components
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import FlashSaleFilters from "./components/FlashSaleFilters";
import FlashSaleTableContainer from "./components/FlashSaleTableContainer";

export default function FlashSalesPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFlashSales = useMemo(() => {
    return FlashSalesData.filter((sale) => {
      const matchesSearch =
        !searchQuery ||
        sale.name[locale].toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery, locale]);

  const statusCounts = useMemo(
    () =>
      FlashSalesData.reduce(
        (acc: Record<string, number>, sale) => {
          const status = sale.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        { published: 0, expired: 0, upcoming: 0, draft: 0 },
      ),
    [],
  );

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "published", name: { en: "Published", ar: "منشور" } },
        { id: "upcoming", name: { en: "Upcoming", ar: "قادم" } },
        { id: "expired", name: { en: "Expired", ar: "منتهي" } },
        { id: "draft", name: { en: "Draft", ar: "مسودة" } },
      ],
      visible: true,
    },
    {
      id: "dateRange",
      label: { en: "Date Range", ar: "نطاق التاريخ" },
      type: "date-range",
      visible: true,
    },
  ];

  const handleReset = () => {
    setSearchQuery("");
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <Zap className="text-rose-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("flashSales")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("flashSalesDescription")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-rose-500">
              <Timer size={10} />
              Campaign Engine
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Campaigns: <span className="text-gray-900">Active</span>
            </span>
          </div>
        </div>
      </div>

      <DynamicFilter
        t={{
          filters: t("filters"),
          reset: t("reset"),
          showData: t("showData"),
        }}
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}

        isRTL={isArabic}
        drawerFilters={[]}
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
      />

      <FlashSaleFilters

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
          {filteredFlashSales.length} {t("flashSales")} {t("found")}
        </p>
      </div>

      <FlashSaleTableContainer
        data={filteredFlashSales}

        onEdit={(s) => router.push(`/${locale}/admin/flash-sales/edit/${s.id}`)}
        onDelete={(s) => console.log("delete", s.id)}
      />
    </div>
  );
}
