"use client";
import { ShoppingBag, Truck } from "lucide-react";
import { Product } from "@/types/product";
import { getExecuteDateFormatted } from "@/util";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface PriceSectionProps {
  product: Product;
  locale: "en" | "ar";
  currentNudgeIndex: number;
  selectedOptions?: { 
    label: { en: string; ar: string }; 
    values: { name: string; color: string }[] 
  }[];
}

const StarRating = ({ rating }: { rating: number }) => (
  <div
    className="flex items-center gap-0.5"
    role="img"
    aria-label={`${rating} out of 5 stars`}
  >
    {[...Array(5)].map((_, i) => {
      const isFull = i < Math.floor(rating);
      const isHalf = !isFull && i < rating;
      return (
        <svg
          key={i}
          className={`h-4 w-4 ${isFull || isHalf ? "text-primary" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    })}
  </div>
);

const StockBadge = ({
  stock,
  locale,
}: {
  stock: number;
  locale: "en" | "ar";
}) => {
  const t = useTranslations("product");
  const isLow = stock <= 5;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${
        isLow
          ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
      }`}
      aria-live="polite"
    >
      <div className="relative flex h-2 w-2">
        {isLow && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${isLow ? "bg-amber-500" : "bg-emerald-500"}`}
        />
      </div>
      {stock > 50 ? t("inStock") : t("leftInStock", { count: Number(stock) })}
    </div>
  );
};

const PriceSection = ({
  product,
  locale,
  currentNudgeIndex,
  selectedOptions,
}: PriceSectionProps) => {
  const t = useTranslations("product");
  const common = useTranslations("common");
  const saving = product.del_price ? product.del_price - product.price : 0;

  return (
    <section aria-label={t("priceDetails")}>
      {/* Rating */}
      <div className="mt-2 hidden w-full items-center justify-between md:flex">
        <div
          className={`flex items-center gap-2 ${locale === "ar" && "flex-row-reverse"}`}
        >
          <StarRating rating={product.rating ?? 0} />
          <span className="cursor-pointer text-xs text-blue-600 hover:underline">
            {product.rating} ★ ({product.reviewCount?.toLocaleString()}{" "}
            {t("ratings")})
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="mt-6 flex flex-col gap-4" aria-live="polite">
        <div className="flex flex-wrap items-baseline gap-4">
          <span className="text-4xl font-extrabold tracking-tight text-gray-900">
            {product.price?.toLocaleString()}
            <span className="ml-1.5 text-lg font-bold text-gray-500">
              {common("currency")}
            </span>
          </span>
          {product.del_price && (
            <span className="text-lg text-gray-400 line-through decoration-gray-300">
              {product.del_price.toLocaleString()} {common("currency")}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-4">
          {product.stock && (
            <StockBadge stock={product.stock} locale={locale} />
          )}
        </div>
      </div>


      {/* Payment Methods */}
      <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 duration-700">
        <div className="flex flex-wrap items-center gap-4">
          {[
            {
              id: "visa",
              name: "Visa",
              url: "/icons/visa.svg",
            },
            {
              id: "mastercard",
              name: "Mastercard",
              url: "/icons/mastercard.svg",
            },
            {
              id: "fawry",
              name: "Fawry",
              url: "/icons/fawry-seeklogo.png",
            },
            {
              id: "wallet",
              name: "E-Wallet",
              url: "/icons/wallet.png",
            },
            {
              id: "cod",
              name: "Cash on Delivery",
              url: "/icons/payment-method.png",
            },
          ].map((method) => (
            <div
              key={method.id}
              className="group relative flex h-12 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-white/60 p-2 shadow-sm backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-primary/40 hover:bg-white/90 hover:shadow-xl active:scale-95"
              title={method.name}
            >
              <div className="relative h-full w-full">
                <Image
                  src={method.url}
                  alt={method.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Options (Variants) */}
      {selectedOptions && selectedOptions.length > 0 && (
        <div className="mt-8 space-y-4 border-t border-gray-100 pt-6">
          {[...selectedOptions]
            .sort((a, b) => {
              const isAColor = a.label.en.toLowerCase() === "color";
              const isBColor = b.label.en.toLowerCase() === "color";
              if (isAColor && !isBColor) return -1;
              if (!isAColor && isBColor) return 1;
              return 0;
            })
            .map((opt, i) => {
              const isColor = opt.label.en.toLowerCase() === "color";
              return (
                <div key={i} className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {opt.label[locale]}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {opt.values.map((val, j) => {
                      if (isColor) {
                        const isUrl = val.color.startsWith("http");
                        return (
                          <div
                            key={j}
                            className="group relative flex flex-col items-center gap-1"
                          >
                            <div
                              className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-gray-200 shadow-sm transition-transform hover:scale-110"
                              style={!isUrl ? { backgroundColor: val.color } : {}}
                              title={val.name}
                            >
                              {isUrl && (
                                <Image
                                  src={val.color}
                                  alt={val.name}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <span className="text-[9px] font-medium text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
                              {val.name}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <span
                          key={j}
                          className="rounded-xl border border-gray-200 bg-white/50 px-4 py-1.5 text-xs font-bold text-gray-700 shadow-sm backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        >
                          {val.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
};

export default PriceSection;
