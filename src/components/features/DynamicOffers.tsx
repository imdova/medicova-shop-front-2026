import React from "react";
import { MultiCategory, Offer } from "@/types";
import FallbackImage from "@/components/shared/FallbackImage";
import Link from "next/link";

type DynamicOffersProps = {
  category: MultiCategory;
  offers: Offer[];
  locale: "en" | "ar";
};
const DynamicOffers: React.FC<DynamicOffersProps> = ({
  category,
  offers,
  locale,
}) => {
  return (
    <div className="relative my-10 overflow-hidden rounded-[28px] bg-gradient-to-b from-gray-50/80 to-white px-4 py-10 shadow-sm ring-1 ring-gray-100/50">
      {/* Decorative subtle background shapes */}
      <div className="bg-primary/5 pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl" />
      <div className="relative z-10 mb-10 text-center">
        <p
          className={`flex items-center justify-center gap-2 text-2xl font-bold uppercase tracking-wide md:text-3xl ${locale === "ar" ? "flex-row-reverse" : ""} text-gray-800`}
        >
          <span className="text-primary">{category.title[locale]}</span>{" "}
          {locale === "ar" ? "عروض" : "Offers"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <Link
            className="group relative h-[170px] select-none overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:ring-teal-200 md:h-[230px]"
            href={offer.url}
            key={offer.id}
          >
            <div className="absolute inset-0 z-10 bg-gray-900/0 transition-colors duration-300 group-hover:bg-gray-900/5" />
            <FallbackImage
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              src={offer.imgUrl}
              alt={offer.title[locale]}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DynamicOffers;
