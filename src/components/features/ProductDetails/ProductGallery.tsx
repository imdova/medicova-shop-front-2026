"use client";
import Link from "next/link";
import ProductImagesSlider from "@/components/features/sliders/ProductImagesSlider";
import AddToCartButton from "./AddToCartButton";
import { Product } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
  locale: "en" | "ar";
  quantity: number;
  loading: boolean;
  isInCart: boolean;
  onAddToCart: () => void;
}

const ProductGallery = ({
  product,
  locale,
  quantity,
  loading,
  isInCart,
  onAddToCart,
}: ProductGalleryProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-left-4 sticky top-4 flex h-full flex-col justify-between rounded-3xl border border-white/40 bg-white/40 p-6 shadow-xl backdrop-blur-xl duration-1000">
      {/* Mobile-only brand and title */}
      <div className="mb-6 block md:hidden">
        <Link
          href={product.brand?.url ?? "#"}
          className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:text-secondary"
        >
          {product.brand?.name[locale]}
        </Link>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900">
          {product.title[locale]}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: "1", name: { en: "Premium", ar: "ممتاز" }, slug: "premium" },
            { id: "2", name: { en: "Medical Grade", ar: "درجة طبية" }, slug: "medical-grade" },
            { id: "3", name: { en: "Eco-Friendly", ar: "صديق للبيئة" }, slug: "eco-friendly" },
          ].map((tag) => (
            <Link
              key={tag.id}
              href={`/search?tag=${tag.slug}`}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[10px] font-medium text-gray-600 transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              {tag.name[locale]}
            </Link>
          ))}
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl bg-white p-2 shadow-inner h-full">
        <ProductImagesSlider
          locale={locale}
          product={product}
          images={product.images}
        />
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-black/5" />
      </div>

      <div className="mt-8">
        <AddToCartButton
          productId={product.id}
          quantity={quantity}
          maxStock={product.stock || 0}
          loading={loading}
          isInCart={isInCart}
          onAddToCart={onAddToCart}
          locale={locale}
        />
      </div>
    </div>
  );
};

export default ProductGallery;
