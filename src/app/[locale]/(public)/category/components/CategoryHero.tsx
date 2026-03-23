"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { MultiCategory } from "@/types";
import { Link } from "@/i18n/navigation";
import { ChevronRight, ChevronLeft, Package, Star, Users } from "lucide-react";

interface CategoryHeroProps {
  category: MultiCategory;
  fullPath?: string;
  itemCount?: number;
}

export default function CategoryHero({
  category,
  fullPath,
  itemCount = 0,
}: CategoryHeroProps) {
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  const breadcrumbs = fullPath ? fullPath.split("/") : [];

  return (
    <section className="relative overflow-hidden bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4 lg:max-w-[98%]">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">
            {isArabic ? "الرئيسية" : "Home"}
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {isArabic ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              <span className={index === breadcrumbs.length - 1 ? "font-semibold text-gray-900" : "capitalize"}>
                {crumb.replace(/-/g, " ")}
              </span>
            </div>
          ))}
        </nav>

        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {category.title[locale]}
            </h1>
            <p className="max-w-2xl text-lg text-gray-600">
              {category.headline?.[locale] ||
                category.description?.[locale] ||
                (isArabic
                  ? `اكتشف أفضل المنتجات في قسم ${category.title.ar}`
                  : `Explore the best products in ${category.title.en}`)}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 min-w-[100px]">
              <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Package size={18} />
              </div>
              <span className="text-xl font-bold text-gray-900">{itemCount}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {isArabic ? "منتج" : "Items"}
              </span>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 min-w-[100px]">
              <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Users size={18} />
              </div>
              <span className="text-xl font-bold text-gray-900">2.5k+</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {isArabic ? "عميل" : "Customers"}
              </span>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 min-w-[100px]">
              <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                <Star size={18} className="fill-amber-500" />
              </div>
              <span className="text-xl font-bold text-gray-900">4.8</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {isArabic ? "تقييم" : "Rating"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-secondary/5 blur-2xl" />
    </section>
  );
}
