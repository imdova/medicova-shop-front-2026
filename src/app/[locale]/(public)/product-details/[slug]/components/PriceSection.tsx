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

      {/* Nudges */}
      <div className="group relative mt-4 overflow-hidden rounded-xl border border-white/40 bg-white/40 p-3 shadow-inner backdrop-blur-sm">
        <div className="relative h-5 overflow-hidden">
          <div
            className="cubic-bezier(0.4, 0, 0.2, 1) flex flex-col transition-all duration-700"
            style={{ transform: `translateY(-${currentNudgeIndex * 20}px)` }}
          >
            {product.nudges?.[locale]?.map((nudge, index) => (
              <div
                key={index}
                className="flex h-5 items-center gap-2 text-[11px] font-semibold text-gray-500"
              >
                <div className="bg-primary/40 h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-125" />
                {nudge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="animate-in fade-in zoom-in-95 mt-6 duration-700">
        <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/40 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-4 bg-emerald-500/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <Truck size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                {product.shippingMethod?.[locale] ?? t("expressDelivery")}
              </span>
              <span className="text-sm font-bold text-gray-800">
                {t("getItBy")}{" "}
                <span className="text-emerald-700">
                  {getExecuteDateFormatted(
                    product.deliveryTime?.[locale] ?? "",
                    "EEEE, MMM d",
                    locale,
                  )}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Installment */}
      {product.installmentOptions && product.installmentOptions.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {product.installmentOptions.map((option, index) => (
            <div
              key={index}
              className="group flex items-center gap-4 rounded-xl border border-white/40 bg-white/40 p-4 shadow-sm backdrop-blur-md transition-all hover:bg-white/60 hover:shadow-md"
            >
              <div className="relative h-10 w-16 overflow-hidden rounded-lg border border-gray-100 bg-white p-1 shadow-sm">
                <Image
                  src={option.methodType.image}
                  className="h-full w-full object-contain"
                  fill
                  alt={option.methodType.name}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {t("installmentOption")}
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {option.months}{" "}
                  {t("monthlyInstallments", {
                    amount: option.amount.toLocaleString(),
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PriceSection;
