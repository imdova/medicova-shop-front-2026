"use client";

import { Search, Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

interface Brand {
  id: string;
  name: { en: string; ar: string };
  image?: string;
}

interface BrandStepProps {
  brands: Brand[];
  selectedBrand: Brand | null;
  onSelect: (brand: Brand) => void;
  locale: string;
}

export const BrandStep = ({
  brands,
  selectedBrand,
  onSelect,
  locale,
}: BrandStepProps) => {
  const t = useTranslations("create_product.brand");
  const [searchTerm, setSearchTerm] = useState("");

  const displayedBrands = brands.filter((brand) =>
    brand.name[locale as "en" | "ar"]
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-primary/10 w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-3 pl-12 pr-4 font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-4"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid max-h-[450px] grid-cols-2 gap-4 overflow-y-auto p-1 sm:grid-cols-3 md:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {displayedBrands.length > 0 ? (
            displayedBrands.map((brand) => (
              <motion.button
                key={brand.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(brand)}
                className={`relative flex flex-col items-center gap-3 rounded-3xl border p-4 transition-all ${
                  selectedBrand?.id === brand.id
                    ? "bg-primary/5 shadow-primary/10 border-primary shadow-lg"
                    : "hover:border-primary/30 border-gray-50 bg-white"
                }`}
              >
                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 p-2">
                  {brand.image ? (
                    <Image
                      src={brand.image}
                      alt={brand.name[locale as "en" | "ar"]}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <span className="text-2xl font-black uppercase text-gray-200">
                      {brand.name[locale as "en" | "ar"][0]}
                    </span>
                  )}
                </div>

                <span
                  className={`text-center text-sm font-bold ${
                    selectedBrand?.id === brand.id
                      ? "text-primary"
                      : "text-gray-700"
                  }`}
                >
                  {brand.name[locale as "en" | "ar"]}
                </span>

                {selectedBrand?.id === brand.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-lg"
                  >
                    <Check size={14} strokeWidth={4} />
                  </motion.div>
                )}
              </motion.button>
            ))
          ) : (
            <div className="col-span-full p-12 text-center font-medium text-gray-400">
              {t("noResults")}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
