"use client";

import React from "react";
import { Search, Filter, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageType } from "@/util/translations";
import Link from "next/link";

interface ReviewFiltersProps {
  locale: LanguageType;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  locale,
  searchQuery,
  onSearchChange,
}) => {
  const t = useTranslations("admin");
  const isRTL = locale === "ar";

  return (
    <div className="mb-8 flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:justify-end">
          <div className="relative flex-1">
            <Search
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${isRTL ? "right-4" : "left-4"}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className={`focus:border-primary/30 focus:ring-primary/5 h-12 w-full rounded-2xl border border-gray-100 bg-gray-50/50 text-sm outline-none transition-all duration-300 focus:bg-white focus:ring-4 ${isRTL ? "pl-4 pr-11" : "pl-11 pr-4"}`}
            />
          </div>

          <div className="flex gap-2">
            <Link
              href={`/${locale}/admin/reviews/create`}
              className="shadow-primary/20 flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:brightness-110 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{t("create")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewFilters;
