"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface BrandFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  locale: string;
}

export const BrandFilters = ({
  search,
  onSearchChange,
  locale,
}: BrandFiltersProps) => {
  const t = useTranslations("seller_brand_management");

  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={t("filters.searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="focus:ring-primary/10 w-full rounded-2xl border border-gray-100 bg-white p-3 pl-12 pr-4 font-bold shadow-sm outline-none transition-all focus:border-primary focus:ring-4"
        />
      </div>
    </div>
  );
};
