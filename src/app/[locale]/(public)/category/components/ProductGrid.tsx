"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { Product } from "@/types/product";
import ProductCard from "@/components/features/cards/ProductCard";
import { Pagination } from "@/components/shared/Pagination";
import { useTranslations } from "next-intl";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface ProductGridProps {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function ProductGrid({
  products,
  totalProducts,
  currentPage,
  itemsPerPage,
}: ProductGridProps) {
  const locale = useAppLocale();
  const t = useTranslations("common");
  const isArabic = locale === "ar";
  const [view, setView] = useState<"grid" | "list">("grid");

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-6">
          <LayoutGrid size={48} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {isArabic ? "لا توجد منتجات حالياً" : "No products found"}
        </h3>
        <p className="text-gray-500">
          {isArabic 
            ? "حاول تغيير الفلاتر أو البحث عن شيء آخر" 
            : "Try changing the filters or searching for something else"}
        </p>
      </div>
    );
  }

  return (
    <section className="my-8">
      {/* Grid Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {totalProducts} {isArabic ? "منتج" : "Products"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown Placeholder - In real app this would be a Select component */}
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 ring-1 ring-gray-200">
            <SlidersHorizontal size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {isArabic ? "ترتيب حسب: الأحدث" : "Sort by: Newest"}
            </span>
          </div>

          <div className="hidden items-center gap-1 rounded-xl bg-gray-50 p-1 ring-1 ring-gray-200 sm:flex">
            <button
              onClick={() => setView("grid")}
              className={`rounded-lg p-1.5 transition-colors ${view === "grid" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-lg p-1.5 transition-colors ${view === "list" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 pb-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {products.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <Pagination
          totalItems={totalProducts}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
        />
      </div>
    </section>
  );
}
