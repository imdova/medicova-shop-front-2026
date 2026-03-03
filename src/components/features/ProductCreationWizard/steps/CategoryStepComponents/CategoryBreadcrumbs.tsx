"use client";

import { ChevronRight } from "lucide-react";
import { MultiCategory } from "@/types";

interface CategoryBreadcrumbsProps {
  history: MultiCategory[];
  isAtBrandLevel: boolean;
  onReset: () => void;
  onNavigateIdx: (idx: number, cat: MultiCategory) => void;
  locale: string;
  brandTitle: string;
}

export const CategoryBreadcrumbs = ({
  history,
  isAtBrandLevel,
  onReset,
  onNavigateIdx,
  locale,
  brandTitle,
}: CategoryBreadcrumbsProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-white/40 p-2 shadow-xl backdrop-blur-xl">
      <nav className="no-scrollbar flex items-center gap-1 overflow-x-auto p-2">
        <button
          onClick={onReset}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${history.length === 0 ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
        >
          Catalog
        </button>
        {history.map((cat, idx) => (
          <div key={`${cat.id}-${idx}`} className="flex items-center gap-1">
            <ChevronRight size={14} className="text-gray-200" />
            <button
              onClick={() => onNavigateIdx(idx, cat)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${idx === history.length - 1 && !isAtBrandLevel ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"}`}
            >
              {cat.title[locale as "en" | "ar"]}
            </button>
          </div>
        ))}
        {isAtBrandLevel && (
          <div className="flex items-center gap-1">
            <ChevronRight size={14} className="text-gray-200" />
            <div className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
              {brandTitle}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
