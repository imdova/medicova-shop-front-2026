"use client";
import Link from "next/link";
import {
  Archive,
  ChevronRight,
  Handshake,
  ListRestart,
  RefreshCcw,
  Store,
  Truck,
} from "lucide-react";
import { Product } from "@/types/product";
import { ProgressLine } from "@/components/shared/ProgressLine";
import { useTranslations } from "next-intl";

interface SellerCardProps {
  product: Product;
  locale: "en" | "ar";
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
          className={`h-3 w-3 ${isFull || isHalf ? "text-primary" : "text-gray-200"}`}
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

const SellerCard = ({ product, locale }: SellerCardProps) => {
  const t = useTranslations("product");
  const { sellers } = product;

  return (
    <section
      className="animate-in fade-in slide-in-from-bottom-4 mt-12 duration-700"
      aria-label={t("seller")}
    >
      <div className="flex flex-wrap gap-8">
        {/* Seller Info */}
        {sellers && (
          <div className="min-w-[320px] flex-1 space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-gray-900">
              {t("seller")}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/40 shadow-sm backdrop-blur-md">
              <Link
                href="#"
                className="group flex items-center justify-between border-b border-gray-100 p-4 transition-colors hover:bg-white/60"
              >
                <div className="flex items-center gap-4">
                  <span className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full text-primary shadow-inner">
                    <Store size={26} />
                  </span>
                  <div>
                    <div className="text-sm text-gray-500">
                      {t("soldBy")}{" "}
                      <span className="decoration-primary/30 font-bold text-primary underline-offset-4 hover:underline">
                        {sellers.name}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating rating={sellers.rating} />
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        {sellers.positiveRatings} {t("positiveRatings")}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="group-hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 transition-colors">
                  <ChevronRight
                    className={`text-gray-400 transition-all duration-300 group-hover:translate-x-1 ${locale === "ar" ? "rotate-180 group-hover:-translate-x-1" : ""} group-hover:text-primary`}
                    size={16}
                  />
                </div>
              </Link>

            </div>
          </div>
        )}

        {/* Delivery & Returns */}
        <div className="min-w-[320px] flex-1 space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            {t("shippingReturns")}
          </h2>
          <div className="flex flex-col gap-4">
            <Link
              className="group flex items-center justify-between rounded-2xl border border-white/40 bg-white/40 p-5 shadow-sm backdrop-blur-md transition-all hover:bg-white/60 hover:shadow-md"
              href="#"
            >
              <div className="flex items-center gap-4 text-sm font-bold text-gray-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-inner">
                  <Truck size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="mb-0.5 text-xs font-bold uppercase tracking-widest text-emerald-600">
                    {t("shipping")}
                  </span>
                  {t("freeDeliveryLocker")}
                </div>
              </div>
              <div className="group-hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 transition-colors">
                <ChevronRight
                  className={`text-gray-400 transition-all duration-300 group-hover:translate-x-1 ${locale === "ar" ? "rotate-180 group-hover:-translate-x-1" : ""} group-hover:text-primary`}
                  size={16}
                />
              </div>
            </Link>
            <Link
              className="group flex items-center justify-between rounded-2xl border border-white/40 bg-white/40 p-5 shadow-sm backdrop-blur-md transition-all hover:bg-white/60 hover:shadow-md"
              href="#"
            >
              <div className="flex items-center gap-4 text-sm font-bold text-gray-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-inner">
                  <RefreshCcw size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="mb-0.5 text-xs font-bold uppercase tracking-widest text-blue-600">
                    {t("returns")}
                  </span>
                  {sellers?.returnPolicy[locale]}
                </div>
              </div>
              <div className="group-hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 transition-colors">
                <ChevronRight
                  className={`text-gray-400 transition-all duration-300 group-hover:translate-x-1 ${locale === "ar" ? "rotate-180 group-hover:-translate-x-1" : ""} group-hover:text-primary`}
                  size={16}
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerCard;
