"use client";

import { Search, Filter, Plus } from "lucide-react";
import Dropdown from "@/components/shared/DropDownMenu";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface ProductFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  stockFilter: string;
  onStockChange: (value: string) => void;
  offerFilter: string;
  onOfferChange: (value: string) => void;
  onOpenAdvancedFilters: () => void;
  locale: string;
}

export const ProductFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  stockFilter,
  onStockChange,
  offerFilter,
  onOfferChange,
  onOpenAdvancedFilters,
  locale,
}: ProductFiltersProps) => {
  const t = useTranslations("seller_products");
  const isAr = locale === "ar";

  const statusOptions = [
    { id: "all", name: t("status.all") },
    { id: "active", name: t("status.active") },
    { id: "out_of_stock", name: t("status.inactive") },
  ];

  const stockOptions = [
    { id: "all", name: t("stockOptions.all") },
    { id: "in_stock", name: t("stockOptions.inStock") },
    { id: "out_of_stock", name: t("stockOptions.outOfStock") },
  ];

  const offerOptions = [
    { id: "all", name: t("offerOptions.all") },
    { id: "yes", name: t("offerOptions.onOffer") },
    { id: "no", name: t("offerOptions.notOnOffer") },
  ];

  return (
    <div className="relative z-20 rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <input
            type="text"
            defaultValue={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="focus:ring-primary/20 w-full rounded-2xl border-none bg-gray-50/50 py-3 pl-12 pr-4 text-sm font-medium text-gray-900 outline-none ring-1 ring-gray-100 transition-all focus:bg-white focus:ring-2"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[140px]">
            <Dropdown
              options={statusOptions}
              selected={statusFilter}
              onSelect={(val) => onStatusChange(val.toString())}
              locale={locale as any}
            />
          </div>
          <div className="min-w-[140px]">
            <Dropdown
              options={stockOptions}
              selected={stockFilter}
              onSelect={(val) => onStockChange(val.toString())}
              locale={locale as any}
            />
          </div>
          <div className="min-w-[140px]">
            <Dropdown
              options={offerOptions}
              selected={offerFilter}
              onSelect={(val) => onOfferChange(val.toString())}
              locale={locale as any}
            />
          </div>
          <button
            onClick={onOpenAdvancedFilters}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50/50 text-gray-500 ring-1 ring-gray-100 transition-all hover:bg-white hover:text-primary hover:shadow-lg"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
