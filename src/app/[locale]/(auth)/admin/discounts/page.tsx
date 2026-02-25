"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Ticket, ShieldCheck, Activity, Gift } from "lucide-react";

// Types & Data
import { Discount } from "@/types/product";
import { dummyDiscounts } from "@/constants/discounts";
import { DynamicFilterItem } from "@/types/filters";
import { productFilters } from "@/constants/drawerFilter";

// Components
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import DiscountFilters from "./components/DiscountFilters";
import DiscountTableContainer from "./components/DiscountTableContainer";

export default function DiscountsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDiscounts = useMemo(() => {
    return dummyDiscounts.filter((discount) => {
      const matchesSearch =
        !searchQuery ||
        discount.couponCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discount.store.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery, locale]);

  const statusCounts = useMemo(
    () =>
      dummyDiscounts.reduce(
        (acc: Record<string, number>, discount) => {
          const status = discount.status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        { active: 0, expired: 0, scheduled: 0 },
      ),
    [locale],
  );

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "active", name: { en: "Active", ar: "نشط" } },
        { id: "expired", name: { en: "Expired", ar: "منتهي" } },
        { id: "scheduled", name: { en: "Scheduled", ar: "مجدول" } },
      ],
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
            <Ticket className="text-rose-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("discounts")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("managePromotions")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-rose-500">
              <Gift size={10} />
              Promotion Engine
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Campaigns: <span className="text-gray-900">Live</span>
            </span>
          </div>
        </div>
      </div>

      <DynamicFilter
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
        drawerFilters={productFilters}
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
      />

      <DiscountFilters
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
          {filteredDiscounts.length} {t("discounts")} {t("found")}
        </p>
      </div>

      <DiscountTableContainer
        data={filteredDiscounts}
        locale={locale}
        onEdit={(d) => router.push(`/${locale}/admin/discounts/edit/${d.id}`)}
        onDelete={(d) => console.log("delete", d.id)}
      />
    </div>
  );
}
