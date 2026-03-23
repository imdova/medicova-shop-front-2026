"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { CategoryType } from "@/types";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

interface BrowseCategoriesProps {
  categories: CategoryType[];
  currentPath: string;
}

export default function BrowseCategories({
  categories,
  currentPath,
}: BrowseCategoriesProps) {
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  if (!categories || categories.length === 0) return null;

  return (
    <section className="my-16">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          {isArabic ? "تصفح حسب الفئات" : "Browse By Categories"}
        </h2>
        <p className="mt-2 text-gray-500">
          {isArabic 
            ? "استكشف مجموعتنا المتنوعة من الفئات الفرعية" 
            : "Explore our diverse range of subcategories"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${currentPath}?subcategory=${isArabic ? cat.slugAr || cat.slug : cat.slug}`}
            scroll={false}
            className="group flex flex-col items-center rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-xl hover:ring-primary/20"
          >
            <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-2xl bg-gray-50 p-2 transition-transform group-hover:scale-110">
              <Image
                src={cat.image || "/images/placeholder.jpg"}
                alt={cat.title[locale]}
                fill
                className="object-contain p-2"
              />
            </div>
            <span className="text-center text-sm font-bold text-gray-900 group-hover:text-primary">
              {cat.title[locale]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
