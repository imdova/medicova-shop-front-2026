"use client";

import { Product } from "@/types/product";
import { LanguageType } from "@/util/translations";
import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  locale: LanguageType;
}

export const RecentProductCard = ({ product, locale }: ProductCardProps) => {
  return (
    <div className="group relative flex h-32 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all">
      {/* Product Image */}
      <div className="relative h-full w-full max-w-[300px]">
        <Image
          src={product.images?.[0] || "/images/placeholder.jpg"}
          alt={product.title[locale]}
          fill
          className="h-full w-full object-cover"
        />
      </div>

      {/* Product Content */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            {product.category?.title[locale]}
          </span>
        </div>

        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">
          {product.title[locale]}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-gray-600">
          {product.description[locale]}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
        </div>
      </div>
      <Link
        href={`/product-details/${product.id}`}
        className="absolute left-0 top-0 flex h-full w-full items-center justify-center gap-2 bg-white/70 font-semibold text-gray-700 opacity-0 backdrop-blur-md transition-opacity duration-300 ease-linear group-hover:opacity-100"
      >
        <span className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2 text-xs">
          <Eye size={16} /> {locale === "ar" ? "عرض التفاصيل" : "View Details"}
        </span>
      </Link>
    </div>
  );
};
