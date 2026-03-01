import React from "react";
import Image from "next/image";
import { Seller } from "@/types/product";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { LanguageType } from "@/util/translations";
import { useLocale, useTranslations } from "next-intl";

interface SellerReviewCardProps {
  className?: string;
  seller: Seller;
}

const SellerReviewCard: React.FC<SellerReviewCardProps> = ({
  className = "",
  seller,
}) => {
  const locale = useLocale() as LanguageType;
  const t = useTranslations("common");
  const isAr = locale === "ar";

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(seller.rating);
    const hasHalfStar = seller.rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg
            key={i}
            className="h-3 w-3 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg
            key={i}
            className="h-3 w-3 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <defs>
              <linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half-star)"
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>,
        );
      } else {
        stars.push(
          <svg
            key={i}
            className="h-3 w-3 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>,
        );
      }
    }
    return stars;
  };

  return (
    <Link
      href={`sellers/${seller.id}`}
      className={`hover:ring-primary/10 group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-4 shadow-xl shadow-gray-200/20 backdrop-blur-xl transition-all duration-300 hover:shadow-gray-200/40 hover:ring-1 ${className}`}
    >
      <div className="flex items-start gap-4">
        {seller.image ? (
          <div className="relative h-12 w-12 overflow-hidden rounded-xl shadow-sm ring-1 ring-gray-100">
            <Image
              src={seller.image}
              alt={seller.name}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        ) : (
          <div className="bg-primary/10 ring-primary/20 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-primary ring-1">
            {seller.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 transition-colors group-hover:text-primary">
            {seller.name}
          </h3>
          <div className="mt-1 flex items-center space-x-1 rtl:space-x-reverse">
            {renderStars()}
            <span className="ml-1 text-[10px] font-bold text-gray-400 rtl:ml-0 rtl:mr-1">
              {seller.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100/50 pt-3">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 rtl:flex-row-reverse">
          <MapPin className="text-primary/50 h-3 w-3" />
          <span>
            {isAr
              ? `${seller.city}، ${seller.country}`
              : `${seller.country}, ${seller.city}`}
          </span>
        </div>
        <div className="text-[10px] font-bold text-gray-900">
          <span className="font-semibold text-gray-400">{t("sales")}:</span>{" "}
          {seller.sales}
        </div>
      </div>

      {/* Subtle hover accent */}
      <div className="bg-primary/20 absolute right-0 top-0 h-full w-1 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />
    </Link>
  );
};

export default SellerReviewCard;
