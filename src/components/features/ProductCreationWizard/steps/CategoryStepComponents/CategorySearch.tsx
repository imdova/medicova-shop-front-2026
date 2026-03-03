"use client";

import { Search, Briefcase, Layers } from "lucide-react";

interface CategorySearchProps {
  isAtBrandLevel: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  brandTitle: string;
  categoryTitle: string;
  searchPlaceholder: string;
}

export const CategorySearch = ({
  isAtBrandLevel,
  searchTerm,
  onSearchChange,
  brandTitle,
  categoryTitle,
  searchPlaceholder,
}: CategorySearchProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${isAtBrandLevel ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"}`}
          >
            {isAtBrandLevel ? <Briefcase size={20} /> : <Layers size={20} />}
          </div>
          <div>
            <h2 className="text-lg font-black leading-tight text-gray-900">
              {isAtBrandLevel ? brandTitle : categoryTitle}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Step 01: Classification
            </p>
          </div>
        </div>
      </div>

      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-5 flex items-center">
          <Search className="h-5 w-5 text-gray-300 transition-colors group-focus-within:text-gray-900" />
        </div>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-[1.5rem] border-2 border-gray-100/60 bg-white/50 py-5 pl-14 pr-6 font-bold shadow-sm outline-none transition-all placeholder:text-gray-300 focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
        />
      </div>
    </div>
  );
};
