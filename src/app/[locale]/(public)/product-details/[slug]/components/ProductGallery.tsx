"use client";
import Link from "next/link";
import ProductImagesSlider from "@/components/features/sliders/ProductImagesSlider";
import AddToCartButton from "./AddToCartButton";
import { Product, ProductTag } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
  locale: "en" | "ar";
  quantity: number;
  loading: boolean;
  isInCart: boolean;
  onAddToCart: () => void;
  setQuantity: (quantity: number) => void;
  productTags?: ProductTag[];
}

const ProductGallery = ({
  product,
  locale,
  quantity,
  loading,
  isInCart,
  onAddToCart,
  setQuantity,
  productTags = [],
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
        <div className="mt-4 flex flex-wrap gap-2">
          {productTags.map((tag) => (
            <Link
              key={tag.id}
              href={`/search?tag=${tag.slug}`}
              className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:shadow-md active:scale-95"
            >
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current opacity-40" />
              {tag.name[locale]}
            </Link>
          ))}
        </div>
      </div>

      <div className="group relative overflow-hidden rounded-2xl bg-white p-2 shadow-inner h-full ">
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
          onQuantityChange={setQuantity}
          locale={locale}
        />
      </div>
    </div>
  );
};

export default ProductGallery;
