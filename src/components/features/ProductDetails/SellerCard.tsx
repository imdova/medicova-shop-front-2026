"use client";
import Link from "next/link";
import {
  ChevronRight,
  Handshake,
  Store,
} from "lucide-react";
import { Product } from "@/types/product";
import { useTranslations } from "next-intl";

interface SellerCardProps {
  product: Product;
  locale: "en" | "ar";
}

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
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      {sellers.positiveRatings} {t("positiveRatings")}
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

              <div className="flex flex-wrap gap-4 p-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Handshake size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {t("partnerSince")}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {sellers.partnerSince}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </section>
  );
};

export default SellerCard;
