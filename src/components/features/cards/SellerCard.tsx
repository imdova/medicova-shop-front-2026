import React from "react";
import Image from "next/image";
import { Seller } from "@/types/product";
import { DollarSign, Package, Star, Users } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { LanguageType } from "@/util/translations";

interface SellerCardProps {
  seller: Seller;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller }) => {
  const locale = useLocale() as LanguageType;
  const isAr = locale === "ar";
  const t = useTranslations("admin");

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
      className="group relative overflow-hidden rounded-[40px] border border-white/60 bg-white p-8 shadow-2xl shadow-slate-200/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-slate-200/60"
    >
      <div className={`relative z-10 ${isAr ? "text-right" : "text-left"}`}>
        <div
          className={`mb-8 flex items-center ${isAr ? "space-x-reverse" : "space-x-5"}`}
        >
          {seller.image ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-[24px] shadow-lg ring-1 ring-white/20">
              <Image
                src={seller.image}
                alt={seller.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-emerald-50 text-2xl font-black text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              {seller.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className={`flex-1 ${isAr ? "pr-2" : "pl-2"}`}>
            <h3 className="text-xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-emerald-600">
              {seller.name}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {isAr
                  ? `${seller.city}، ${seller.country}`
                  : `${seller.country}, ${seller.city}`}
              </p>
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5">
                <Star
                  className="text-amber-500"
                  size={10}
                  fill="currentColor"
                />
                <span className="text-[10px] font-bold text-amber-600">
                  {seller.rating}.0
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`grid grid-cols-3 gap-4 border-t border-slate-50 pt-6 ${isAr ? "flex-row-reverse" : ""}`}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-gray-400 transition-colors group-hover:text-emerald-600">
              <Package size={14} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">
                {t("products")}
              </span>
            </div>
            <span className="text-sm font-black text-gray-900">
              {formatNumber(seller.products ?? 0)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 border-x border-slate-50">
            <div className="flex items-center gap-1.5 text-gray-400 transition-colors group-hover:text-blue-600">
              <Users size={14} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">
                {t("customers")}
              </span>
            </div>
            <span className="text-sm font-black text-gray-900">
              {shortenNumber(seller.customers ?? 0)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-gray-400 transition-colors group-hover:text-amber-600">
              <DollarSign size={14} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">
                {t("sales")}
              </span>
            </div>
            <span className="text-sm font-black text-gray-900">
              {shortenNumber(seller.sales ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Luxury Background Detail */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-50/30 blur-3xl transition-all duration-500 group-hover:bg-emerald-100/40" />
    </Link>
  );
};

export default SellerCard;
