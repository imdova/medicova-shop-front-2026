"use client";
import { Product } from "@/types/product";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface PriceSectionProps {
  product: Product;
  locale: "en" | "ar";
  currentNudgeIndex: number;
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
      {t("onlyStock", { count: stock })}
    </div>
  );
};

const PriceSection = ({
  product,
  locale,
  currentNudgeIndex,
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
          {saving > 0 && (
            <span className="animate-in zoom-in-50 rounded-lg bg-primary px-3 py-1 text-sm font-bold text-white shadow-sm duration-500">
              {Math.round((saving / product.del_price!) * 100)}% {t("off")}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-4">
          {product.stock && (
            <StockBadge stock={product.stock} locale={locale} />
          )}
          {saving > 0 && (
            <span className="text-xs font-semibold text-emerald-600">
              {t("youSave")} {saving.toLocaleString()} {common("currency")}
            </span>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <div className="flex flex-wrap items-center gap-4">
          {[
            { name: "Visa", src: "/icons/card-visa.svg" },
            { name: "Mastercard", src: "/icons/card-mastercard.svg" },
            { name: "Amex", src: "/icons/card-amex.svg" },
            { name: "valU", src: "/icons/valu_v2.svg" },
            { name: "COD", src: "/icons/cod-en.svg" },
            { name: "Vodafone Cash", src: "/icons/vodafone-cash.png" },
            { name: "Fawry", src: "/icons/fawry.png" },
          ].map((method) => (
            <div
              key={method.name}
              className="group relative flex h-10 w-16 items-center justify-center rounded-xl border border-gray-100 bg-white p-2 shadow-sm transition-all hover:border-primary/20 hover:scale-105"
            >
              <Image
                src={method.src}
                alt={method.name}
                fill
                className="object-contain p-1.5 transition-all"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PriceSection;
