"use client";

import { useState, useMemo } from "react";
import { Search, Tag, ChevronDown, FolderOpen } from "lucide-react";
import { MultiCategory } from "@/types";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useTranslations } from "next-intl";

interface CategorySidebarProps {
  categories: MultiCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  tagCountMap: Record<string, number>;
}

export default function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  tagCountMap,
}: CategorySidebarProps) {
  const locale = useAppLocale();
  const t = useTranslations("admin.productTagsPage");
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.title.en.toLowerCase().includes(q) ||
        c.title.ar.toLowerCase().includes(q),
    );
  }, [categories, search]);

  const selectedLabel = useMemo(() => {
    if (!selectedCategoryId) return t("allTags");
    const cat = categories.find((c) => c.id === selectedCategoryId);
    return cat?.title[locale] || t("allTags");
  }, [selectedCategoryId, categories, locale, t]);

  return (
    <>
      {/* Mobile dropdown */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition-all hover:border-gray-300"
          aria-expanded={mobileOpen}
          aria-label={t("selectCategory")}
        >
          <span className="flex items-center gap-2">
            <FolderOpen size={16} className="text-primary" />
            {selectedLabel}
          </span>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
          />
        </button>
        {mobileOpen && (
          <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
            <CategoryList
              categories={filtered}
              selectedId={selectedCategoryId}
              locale={locale}
              tagCountMap={tagCountMap}
              onSelect={(id) => {
                onSelectCategory(id);
                setMobileOpen(false);
              }}
              allLabel={t("allTags")}
            />
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block" aria-label="Categories">
        <div className="sticky top-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Search */}
          <div className="border-b border-gray-100 p-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchCategories")}
                className="focus:ring-primary/20 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pe-3 ps-9 text-xs transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-1"
                aria-label={t("searchCategories")}
              />
            </div>
          </div>

          {/* List */}
          <nav className="max-h-[calc(100vh-220px)] overflow-y-auto p-2">
            <CategoryList
              categories={filtered}
              selectedId={selectedCategoryId}
              locale={locale}
              tagCountMap={tagCountMap}
              onSelect={onSelectCategory}
              allLabel={t("allTags")}
            />
          </nav>
        </div>
      </aside>
    </>
  );
}

/* ── Inner List (shared between mobile + desktop) ────────────── */
function CategoryList({
  categories,
  selectedId,
  locale,
  tagCountMap,
  onSelect,
  allLabel,
}: {
  categories: MultiCategory[];
  selectedId: string | null;
  locale: "en" | "ar";
  tagCountMap: Record<string, number>;
  onSelect: (id: string | null) => void;
  allLabel: string;
}) {
  return (
    <ul className="space-y-0.5" role="listbox">
      {/* "All Tags" option */}
      <li role="option" aria-selected={selectedId === null}>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
            selectedId === null
              ? "bg-primary/10 font-bold text-primary"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Tag size={14} />
          <span className="flex-1 truncate text-start">{allLabel}</span>
        </button>
      </li>

      {categories.map((cat) => {
        const isActive = cat.id === selectedId;
        const count = tagCountMap[cat.id] ?? 0;

        return (
          <li key={cat.id} role="option" aria-selected={isActive}>
            <button
              type="button"
              onClick={() => onSelect(cat.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary/10 font-bold text-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <FolderOpen size={14} />
              <span className="flex-1 truncate text-start">
                {cat.title[locale]}
              </span>
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
