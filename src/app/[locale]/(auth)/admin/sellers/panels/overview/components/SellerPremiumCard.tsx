"use client";

import { Star, MapPin, Package, Eye, ShoppingBag } from "lucide-react";
import { LanguageType } from "@/util/translations";
import { Seller } from "@/types/product";
import Image from "next/image";

interface Props {
  seller: Seller;
  locale: LanguageType;
}

export const SellerPremiumCard = ({ seller, locale }: Props) => {
  const isArabic = locale === "ar";
  const sellerImage = seller.image || "";

  return (
    <div className="group relative rounded-[28px] border border-slate-100 bg-white p-5 transition-all duration-300 hover:border-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/5">
      <div className="mb-6 flex items-center gap-4">
        <div className="relative size-16 overflow-hidden rounded-2xl bg-slate-100">
          <Image
            src={sellerImage}
            alt={seller.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-900 transition-colors group-hover:text-emerald-600">
            {seller.name}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="text-sm leading-none">
              {seller.country === "Egypt"
                ? "🇪🇬"
                : seller.country === "Saudi Arabia"
                  ? "🇸🇦"
                  : seller.country === "UAE"
                    ? "🇦🇪"
                    : "🇺🇸"}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider">
              {seller.country}, {seller.city}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[10px] font-black text-amber-500">
              ★ {seller.rating}.0
            </span>
            <span className="ml-1 text-[9px] font-extrabold text-gray-300">
              ({seller.sales} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-slate-50 py-4">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Package size={12} />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {isArabic ? "منتج" : "Products"}
            </span>
          </div>
          <span className="text-sm font-black text-gray-900">
            {seller.products}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 border-x border-slate-50">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Eye size={12} />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {isArabic ? "مشاهدة" : "Views"}
            </span>
          </div>
          <span className="text-sm font-black text-gray-900">
            {seller.customers}k
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 text-gray-400">
            <ShoppingBag size={12} />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {isArabic ? "مبيعات" : "Sales"}
            </span>
          </div>
          <span className="text-sm font-black text-gray-900">
            {seller.sales}
          </span>
        </div>
      </div>
    </div>
  );
};
