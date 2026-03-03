"use client";

import { Search, Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { ProductFormData } from "@/lib/validations/product-schema";
import { getBrandsData } from "@/data";
import { Brand } from "@/types";

const brands = getBrandsData();

interface BrandStepProps {
  product: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  locale: string;
}

export const BrandStep = ({ product, onUpdate, locale }: BrandStepProps) => {
  const t = useTranslations("create_product.brand");
  const [searchTerm, setSearchTerm] = useState("");
  const selectedBrand = product.brand;

  const displayedBrands = (brands as unknown as Brand[]).filter((brand) =>
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
        <h2 className="text-xl font-black text-gray-900">{t("title")}</h2>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-4 pl-12 pr-4 font-bold outline-none transition-all focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-900"
            >
              <X size={18} />
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
                onClick={() => onUpdate({ brand })}
                className={`relative flex flex-col items-center gap-4 rounded-[2rem] border-2 p-6 transition-all ${
                  selectedBrand?.id === brand.id
                    ? "border-gray-900 bg-white shadow-2xl shadow-gray-200"
                    : "border-transparent bg-white/40 shadow-sm backdrop-blur-sm hover:border-gray-200"
                }`}
              >
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-gray-50/50 p-2 transition-colors group-hover:bg-white">
                  {brand.image ? (
                    <Image
                      src={brand.image}
                      alt={brand.name[locale as "en" | "ar"]}
                      fill
                      className="object-contain p-3"
                    />
                  ) : (
                    <span className="text-3xl font-black uppercase text-gray-200">
                      {brand.name[locale as "en" | "ar"][0]}
                    </span>
                  )}
                </div>

                <span
                  className={`text-center text-sm font-black ${
                    selectedBrand?.id === brand.id
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {brand.name[locale as "en" | "ar"]}
                </span>

                {selectedBrand?.id === brand.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-xl"
                  >
                    <Check size={16} strokeWidth={4} />
                  </motion.div>
                )}
              </motion.button>
            ))
          ) : (
            <div className="col-span-full p-20 text-center font-bold text-gray-400">
              {t("noResults")}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
