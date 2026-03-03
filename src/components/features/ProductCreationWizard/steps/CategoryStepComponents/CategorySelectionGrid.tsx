"use client";

import { ChevronRight, ChevronLeft, Tag, Check, Loader2 } from "lucide-react";
import { MultiCategory, Brand } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface CategorySelectionGridProps {
  loading: boolean;
  isAtBrandLevel: boolean;
  filteredItems: (MultiCategory | Brand)[];
  onSelect: (item: MultiCategory | Brand) => void;
  selectedBrandId?: string;
  locale: string;
  isArabic: boolean;
}

export const CategorySelectionGrid = ({
  loading,
  isAtBrandLevel,
  filteredItems,
  onSelect,
  selectedBrandId,
  locale,
  isArabic,
}: CategorySelectionGridProps) => {
  return (
    <div className="relative min-h-[360px] p-2">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-gray-900" />
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                Loading Data...
              </span>
            </div>
          </motion.div>
        ) : !isAtBrandLevel ? (
          <motion.div
            key="cats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 gap-2 md:grid-cols-2"
          >
            {(filteredItems as MultiCategory[]).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelect(cat)}
                className="group flex items-center justify-between rounded-2xl p-4 transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-900/5 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 transition-colors group-hover:bg-indigo-50">
                    <Tag className="h-5 w-5 text-gray-300 transition-colors group-hover:text-indigo-500" />
                  </div>
                  <span className="text-left text-base font-bold text-gray-800 transition-colors group-hover:text-gray-900">
                    {cat.title[locale as "en" | "ar"]}
                  </span>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50/50 transition-all group-hover:bg-gray-900 group-hover:text-white">
                  {isArabic ? (
                    <ChevronLeft size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </div>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-sm font-bold text-gray-400">
                  No categories found matching your search.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="brands"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
          >
            {(filteredItems as Brand[]).map((brand) => (
              <button
                key={brand.id}
                onClick={() => onSelect(brand)}
                className={`relative flex flex-col items-center gap-3 rounded-3xl border-2 p-5 transition-all active:scale-[0.98] ${selectedBrandId === brand.id ? "border-gray-900 bg-white shadow-xl" : "border-transparent bg-white/40 hover:border-gray-100 hover:bg-white/60"}`}
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-gray-50/50 p-2">
                  {brand.image ? (
                    <Image
                      src={brand.image}
                      alt={brand.name[locale as "en" | "ar"]}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-black uppercase text-gray-200">
                      {brand.name[locale as "en" | "ar"].charAt(0)}
                    </div>
                  )}
                </div>
                <span
                  className={`text-center text-[10px] font-black uppercase tracking-wider ${selectedBrandId === brand.id ? "text-gray-900" : "text-gray-400"}`}
                >
                  {brand.name[locale as "en" | "ar"]}
                </span>
                {selectedBrandId === brand.id && (
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                    <Check size={12} strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-sm font-bold text-gray-400">
                  No brands found.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
