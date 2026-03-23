"use client";
import Link from "next/link";
import { ChevronRight, Landmark } from "lucide-react";
import { Product } from "@/types/product";
import { useTranslations } from "next-intl";

interface BankOffersProps {
  product: Product;
  locale: "en" | "ar";
}

const BankOffers = ({ product, locale }: BankOffersProps) => {
  const t = useTranslations("product");
  const { bankOffers } = product;

  if (!bankOffers || bankOffers.length === 0) return null;

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 mt-8 duration-700">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-gray-900">
          {t("bankOffers")}
        </h2>
        <span className="bg-primary/5 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          {bankOffers.length} {t("available")}
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        {bankOffers.map((offer, index) => (
          <Link
            key={index}
            href={offer.url}
            className="hover:border-primary/30 group flex min-w-[280px] flex-1 items-center justify-between rounded-2xl border border-white/40 bg-white/40 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white/60 hover:shadow-lg active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 group-hover:shadow-primary/20 flex h-12 w-12 items-center justify-center rounded-xl text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg">
                <Landmark size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 transition-colors group-hover:text-primary">
                  {offer.title[locale]}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {t("clickToViewDetails")}
                </span>
              </div>
            </div>
            <div className="group-hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 transition-colors">
              <ChevronRight
                className={`text-gray-400 transition-all duration-300 group-hover:translate-x-1 ${locale === "ar" ? "rotate-180 group-hover:-translate-x-1" : ""} group-hover:text-primary`}
                size={18}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BankOffers;
