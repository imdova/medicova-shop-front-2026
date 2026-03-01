"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Sellers } from "@/constants/sellers";
import { LanguageType } from "@/util/translations";
import { useTranslations } from "next-intl";
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import { productFilters } from "@/constants/drawerFilter";
import { DynamicFilterItem } from "@/types/filters";
import { formatDate } from "@/util/dateUtils";
import { motion, AnimatePresence } from "framer-motion";

// Modular Components
import SellerFilters from "../components/SellerFilters";
import SellerTableContainer from "../components/SellerTableContainer";
import { SellersListHeader } from "./list/SellersListHeader";

export default function SellersListPanel({ locale }: { locale: LanguageType }) {
  const t = useTranslations("admin");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const statusFilter = searchParams.get("status") || "all";
  const currentPage = Number(searchParams.get("page")) || 1;
  const ITEMS_PER_PAGE = 8;

  const statusCounts = Sellers.reduce<Record<string, number>>(
    (acc, seller) => {
      const status = seller.status.en || "draft";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { active: 0, pending: 0, draft: 0, best_seller: 0 },
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (startDate)
      params.set("start_date", formatDate(startDate, "yyyy-MM-dd"));
    else params.delete("start_date");
    if (endDate) params.set("end_date", formatDate(endDate, "yyyy-MM-dd"));
    else params.delete("end_date");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [startDate, endDate]);

  const filteredSellers = useMemo(() => {
    return Sellers.filter((seller) => {
      if (statusFilter !== "all" && seller.status.en !== statusFilter)
        return false;
      if (
        searchQuery &&
        !seller.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [statusFilter, searchQuery]);

  const paginatedSellers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSellers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSellers, currentPage]);

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "active", name: { en: "Active", ar: "نشط" } },
        { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
        { id: "best_seller", name: { en: "Best Seller", ar: "أفضل بائع" } },
      ],
      visible: true,
    },
  ];

  const handleDateChange = (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStartDate(null);
    setEndDate(null);
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/60 bg-white p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-sm">
        <DynamicFilter
          isOpen={isOpen}
          onToggle={() => setIsOpen(false)}
          drawerFilters={productFilters}
          statusCounts={statusCounts}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          filters={predefinedFilters}
        />

        <SellerFilters
          locale={locale}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleFilters={() => setIsOpen(true)}
          onDateChange={handleDateChange}
          onReset={resetFilters}
        />

        <div className="mt-8 border-t border-slate-50 pt-8">
          <SellersListHeader
            locale={locale}
            filteredCount={filteredSellers.length}
          />

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6"
            >
              <SellerTableContainer
                locale={locale}
                data={filteredSellers}
                onEdit={(s) => console.log("edit", s.id)}
                onDelete={(s) => console.log("delete", s.id)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
