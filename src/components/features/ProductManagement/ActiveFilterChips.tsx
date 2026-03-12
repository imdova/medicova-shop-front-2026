"use client";

import { X } from "lucide-react";

export interface FilterChip {
  key: string;
  label: string;
  value: string;
  clear: () => void;
}

interface ActiveFilterChipsProps {
  isAr: boolean;
  chips: FilterChip[];
}

export function ActiveFilterChips({ isAr, chips }: ActiveFilterChipsProps) {
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-500">{isAr ? "فلاتر نشطة:" : "Active filters:"}</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80"
        >
          <span className="text-slate-500">{chip.label}</span>
          <span className="max-w-[220px] truncate">{chip.value}</span>
          <button
            type="button"
            onClick={chip.clear}
            className="rounded-full p-0.5 text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-700"
            aria-label={isAr ? "إزالة الفلتر" : "Remove filter"}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}
