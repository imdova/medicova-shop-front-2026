"use client";

import { Check } from "lucide-react";
import { MultiCategory, Brand } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface SelectionFeedbackProps {
  selectedCategory?: { title: { en: string; ar: string }; id: string };
  selectedBrand?: { name: { en: string; ar: string }; id: string };
  locale: string;
}

export const SelectionFeedback = ({
  selectedCategory,
  selectedBrand,
  locale,
}: SelectionFeedbackProps) => {
  return (
    <AnimatePresence>
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-between gap-6 rounded-[2.5rem] border border-white bg-gray-900/5 p-6 shadow-inner backdrop-blur-xl md:flex-row"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Current Selection
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-gray-900">
                {selectedCategory.title[locale as "en" | "ar"]}
              </span>
              {selectedBrand && (
                <>
                  <div className="h-4 w-[2px] rotate-12 bg-gray-200" />
                  <span className="text-xl font-black text-indigo-600">
                    {selectedBrand.name[locale as "en" | "ar"]}
                  </span>
                </>
              )}
            </div>
          </div>

          {selectedBrand ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 shadow-sm transition-all hover:scale-105">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
                Ready to proceed
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-3 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-xs font-black uppercase tracking-widest text-amber-700">
                Please select a brand
              </span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
