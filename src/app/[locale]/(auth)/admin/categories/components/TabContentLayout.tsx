"use client";

import React from "react";
import { Search, Plus, Download } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface TabContentLayoutProps {
  title: string;
  itemCount: number;
  itemLabel: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateClick: () => void;
  children: React.ReactNode;
}

const TabContentLayout: React.FC<TabContentLayoutProps> = ({
  title,
  itemCount,
  itemLabel,
  searchQuery,
  onSearchChange,
  onCreateClick,
  children,
}) => {
  const locale = useLocale();
  const t = useTranslations("admin");
  const isRTL = locale === "ar";

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl text-primary shadow-inner">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">{title}</h3>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {itemCount} {itemLabel}
            </p>
          </div>
        </div>

        {/* Search + Actions */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:max-w-2xl">
          <div className="relative flex-1">
            <Search
              className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 ${isRTL ? "right-4" : "left-4"}`}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className={`focus:border-primary/30 focus:ring-primary/5 h-12 w-full rounded-2xl border border-gray-100 bg-gray-50/50 text-sm outline-none transition-all duration-300 focus:bg-white focus:ring-4 ${isRTL ? "pl-4 pr-11" : "pl-11 pr-4"}`}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCreateClick}
              className="shadow-primary/20 group flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:brightness-110 active:scale-95"
              aria-label={t("create")}
            >
              <Plus
                size={18}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
              <span>{t("create")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-xl shadow-gray-200/40 backdrop-blur-xl sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default TabContentLayout;
