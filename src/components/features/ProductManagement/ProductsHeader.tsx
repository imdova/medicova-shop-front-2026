"use client";

import Link from "next/link";
import { Download, Plus, Upload } from "lucide-react";

interface ProductsHeaderProps {
  isAr: boolean;
  createPath: string;
}

export function ProductsHeader({ isAr, createPath }: ProductsHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          {isAr ? "إدارة المنتجات" : "Products Management"}
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-slate-300 hover:shadow active:scale-[0.98]"
        >
          <Upload className="h-4 w-4 opacity-70" />
          {isAr ? "إجراءات جماعية" : "Bulk Actions"}
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-slate-300 hover:shadow active:scale-[0.98]"
        >
          <Download className="h-4 w-4 opacity-70" />
          {isAr ? "تصدير CSV" : "Export CSV"}
        </button>

        <Link
          href={createPath}
          className="shadow-primary/25 hover:shadow-primary/30 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          {isAr ? "إضافة منتج جديد" : "Add New Product"}
        </Link>
      </div>
    </div>
  );
}
