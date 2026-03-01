"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import ProductsSlider from "@/components/features/sliders/ProductsSlider";
import { products } from "@/data";
import ProductCard from "@/components/features/cards/ProductCard";

export default function EmptyCart() {
  const t = useTranslations();

  return (
    <div className="container mx-auto p-4 lg:max-w-[98%]">
      {/* Empty cart hero */}
      <div className="my-10 flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700">
          {t("cart.emptyTitle")}
        </h2>
        <p className="text-sm text-gray-400">{t("cart.emptySubtitle")}</p>
        <Link
          href="/"
          className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
        >
          {t("cart.continueShopping")}
        </Link>
      </div>

      {/* Items you previously viewed */}
      <div className="mt-10 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 text-xl font-bold text-gray-700">
          {t("cart.previouslyViewed")}
        </h2>
        <ProductsSlider>
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[200px] flex-shrink-0 px-1 py-4 md:w-[240px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </ProductsSlider>
      </div>

      {/* Bestsellers for you */}
      <div className="mt-6 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 text-xl font-bold text-gray-700">
          {t("cart.bestsellers")}
        </h2>
        <ProductsSlider>
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[200px] flex-shrink-0 px-1 py-4 md:w-[240px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </ProductsSlider>
      </div>
    </div>
  );
}
