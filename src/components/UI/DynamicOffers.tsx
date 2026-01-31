import React from "react";
import { MultiCategory, Offer } from "@/types";
import Image from "next/image";
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
    <div className="bg-green-100 p-4">
      <div className="mb-8 text-center">
        <p
          className={`flex items-center justify-center gap-2 text-4xl font-bold uppercase ${locale === "ar" ? "flex-row-reverse" : ""} text-gray-600`}
        >
          <span className="text-primary">{category.title[locale]}</span>{" "}
          {locale === "ar" ? "عروض" : "Offers"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <Link
            className="h-[170px] select-none md:h-[230px]"
            href={offer.url}
            key={offer.id}
          >
            <Image
              className="h-full w-full"
              src={offer.imgUrl}
              alt={offer.title[locale]}
              width={300}
              height={300}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DynamicOffers;
