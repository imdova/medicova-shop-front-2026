"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { LanguageType } from "@/util/translations";
import { Sellers } from "@/constants/sellers";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Star } from "lucide-react";

interface Props {
  locale: LanguageType;
  itemVariants: any;
}

export const SellerReviewsList = ({ locale, itemVariants }: Props) => {
  const t = useTranslations("admin");
  const isArabic = locale === "ar";
  const reviewsSellers = Sellers.slice(0, 5);

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-[32px] border border-white/60 bg-white p-6 shadow-2xl shadow-slate-200/50"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-900">
          {isArabic ? "مراجعات أفضل البائعين" : "Top Sellers Reviews"}
        </h2>
        <Link
          href="#"
          className="group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 transition-colors hover:text-emerald-600"
        >
          <span>{t("viewAll")}</span>
          {isArabic ? (
            <ChevronLeft size={12} />
          ) : (
            <ChevronRight
              size={12}
              className="transition-transform group-hover:translate-x-0.5"
            />
          )}
        </Link>
      </div>

      <div className="space-y-4">
        {reviewsSellers.map((seller) => (
          <div
            key={seller.id}
            className="group flex items-center justify-between gap-4 rounded-2xl p-2 transition-all duration-300 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="relative size-10 overflow-hidden rounded-full ring-2 ring-slate-100">
                <Image
                  src={seller.image || ""}
                  alt={seller.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 transition-colors group-hover:text-emerald-600">
                  {seller.name}
                </h4>
                <div className="mt-0.5 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={9}
                      className={
                        i < seller.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                  <p className="ml-1 text-[10px] font-bold text-gray-400">
                    {seller.rating}.0
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-gray-900">
                {Math.ceil((seller.sales || 0) / 2.5)}
              </span>
              <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-300">
                {isArabic ? "مراجعة" : "Reviews"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
