"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface BrandFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  locale: string;
}

export const BrandFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
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

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="focus:ring-primary/10 rounded-2xl border border-gray-100 bg-white py-3 pl-4 pr-10 text-sm font-black uppercase tracking-wider text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-4"
      >
        <option value="all">{t("filters.status.all")}</option>
        <option value="pending">{t("filters.status.pending")}</option>
        <option value="approved">{t("filters.status.approved")}</option>
        <option value="rejected">{t("filters.status.rejected")}</option>
      </select>
    </div>
  );
};
