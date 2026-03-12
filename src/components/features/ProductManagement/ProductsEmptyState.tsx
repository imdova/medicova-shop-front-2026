"use client";

import Link from "next/link";
import { Package } from "lucide-react";

interface ProductsEmptyStateProps {
  isAr: boolean;
  createPath: string;
}

export function ProductsEmptyState({ isAr, createPath }: ProductsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="rounded-2xl bg-slate-100 p-4">
        <Package className="h-12 w-12 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-600">
        {isAr ? "لا توجد منتجات" : "No products found"}
      </p>
      <p className="max-w-sm text-xs text-slate-500">
        {isAr ? "غيّر الفلاتر أو أضف منتجاً جديداً." : "Try adjusting filters or add a new product."}
      </p>
      <Link
        href={createPath}
        className="hover:bg-primary/90 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition"
      >
        {isAr ? "إضافة منتج" : "Add product"}
      </Link>
    </div>
  );
}
