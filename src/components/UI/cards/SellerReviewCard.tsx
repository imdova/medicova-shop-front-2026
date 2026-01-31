import React from "react";
import Image from "next/image";
import { Seller } from "@/types/product";
import Link from "next/link";
import { LanguageType } from "@/util/translations";

interface SellerReviewCardProps {
  className?: string;
  seller: Seller;
  locale: LanguageType;
}

const SellerReviewCard: React.FC<SellerReviewCardProps> = ({
  className = "",
  seller,
  locale,
}) => {
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
      className={`rounded-lg border border-gray-200 bg-white p-2 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        {seller.image ? (
          <div className="relative h-10 w-10 overflow-hidden rounded-md">
            <Image
              src={seller.image}
              alt={seller.name}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-bold text-white">
            {seller.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">{seller.name}</h3>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            {renderStars()}
            <span className="ml-1 text-sm text-gray-500 rtl:ml-0 rtl:mr-1">
              ({seller.rating})
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 pt-2 text-[10px] text-gray-500">
        <div className="flex items-center gap-1 rtl:flex-row-reverse">
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {isAr
            ? `${seller.city}، ${seller.country}`
            : `${seller.country}, ${seller.city}`}
        </div>
        <div>
          {isAr ? `${seller.sales} عملية بيع` : `${seller.sales} Sales`}
        </div>
      </div>
    </Link>
  );
};

export default SellerReviewCard;
