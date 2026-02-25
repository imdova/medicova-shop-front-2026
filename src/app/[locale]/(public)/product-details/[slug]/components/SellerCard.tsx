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
                <div className="flex min-w-[120px] flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Archive size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                      {t("itemAsShown")}
                    </span>
                  </div>
                  <ProgressLine
                    progress={sellers.itemShown ?? 0}
                    height="h-2"
                    showLabel
                  />
                </div>
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
                <div className="bg-primary/5 hover:bg-primary/10 flex w-full items-center gap-3 rounded-xl p-3 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                    <ListRestart size={14} />
                  </div>
                  <span className="text-xs font-bold text-gray-700">
                    {t("lowReturnSeller")}
                  </span>
                </div>
              </div>
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
