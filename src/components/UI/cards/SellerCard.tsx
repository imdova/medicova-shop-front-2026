import React from "react";
import Image from "next/image";
import { Seller } from "@/types/product";
import { DollarSign, Package, Star, Users } from "lucide-react";
import Link from "next/link";
import { LanguageType } from "@/util/translations";

interface SellerCardProps {
  seller: Seller;
  locale: LanguageType;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller, locale }) => {
  const isAr = locale === "ar";

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const shortenNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return formatNumber(num);
  };

  return (
    <Link
      href={`sellers/${seller.id}`}
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <div className={`p-4 ${isAr ? "text-right" : "text-left"}`}>
        <div
          className={`mb-6 flex items-center ${isAr ? "space-x-reverse" : "space-x-4"}`}
        >
          {seller.image ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-xl">
              <Image
                src={seller.image}
                alt={seller.name}
                layout="fill"
                objectFit="cover"
                className="rounded-xl"
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-2xl font-bold text-white">
              {seller.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className={`flex-1 ${isAr ? "pr-3" : "pl-3"}`}>
            <h3 className="text-lg font-semibold text-gray-900">
              {seller.name}
            </h3>

            <div className={`flex flex-wrap items-center gap-2`}>
              <p className="text-sm text-gray-500">
                {isAr
                  ? `${seller.city}، ${seller.country}`
                  : `${seller.country}, ${seller.city}`}
              </p>
              <div className="flex items-center gap-1 text-gray-500">
                <Star className="text-orange-500" size={15} />
                <span className="text-xs">
                  ({seller.rating} {isAr ? "تقييمات" : "Reviews"})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`flex flex-wrap justify-between gap-2 ${isAr ? "flex-row-reverse" : ""}`}
        >
          <div className="flex items-center gap-1">
            <Package size={16} className="text-primary" />
            <p className="text-xs text-gray-900">
              {formatNumber(seller.products ?? 0)}{" "}
              {isAr ? "منتجات" : "Products"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} className="text-primary" />
            <p className="text-xs text-gray-900">
              {shortenNumber(seller.customers ?? 0)}{" "}
              {isAr ? "عملاء" : "Customers"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={16} className="text-primary" />
            <p className="text-xs text-gray-900">
              {shortenNumber(1212)} {isAr ? "الإيرادات" : "Revenue"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SellerCard;
