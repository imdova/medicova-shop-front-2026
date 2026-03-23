"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { Product } from "@/types/product";
import ProductCard from "@/components/features/cards/ProductCard";
import ProductsSlider from "@/components/features/sliders/ProductsSlider";
import { useTranslations } from "next-intl";

interface BestsellerBannerProps {
  products: Product[];
  categoryName: string;
}

export default function BestsellerBanner({
  products,
  categoryName,
}: BestsellerBannerProps) {
  const locale = useAppLocale();
  const t = useTranslations("home");
  const isArabic = locale === "ar";

  if (!products || products.length === 0) return null;

  return (
    <section className="my-8 rounded-[32px] bg-primary/10 p-6 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            {isArabic ? `الأكثر مبيعاً في ${categoryName}` : `Bestsellers in ${categoryName}`}
          </h2>
          <p className="text-gray-600">
            {isArabic 
              ? "اكتشف المنتجات التي اختارها عملاؤنا بعناية وبناءً على تقييماتهم الإيجابية." 
              : "Discover the products our customers have carefully chosen based on their positive reviews."}
          </p>
        </div>
        <button className="w-fit rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95">
          {isArabic ? "عرض الكل" : "View All"}
        </button>
      </div>

      <ProductsSlider>
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[220px] flex-shrink-0 px-2 py-4 md:w-[280px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </ProductsSlider>
    </section>
  );
}
