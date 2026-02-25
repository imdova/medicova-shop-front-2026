"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface OrderPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: string) => void;
  locale: string;
}

export const OrderPagination: React.FC<OrderPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  locale,
}) => {
  const t = useTranslations("user");
  const isRTL = locale === "ar";

  return (
    <div className="mt-12 flex items-center justify-center gap-6">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(String(currentPage - 1))}
        className={`flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-300 ${
          currentPage === 1
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-primary hover:text-primary active:scale-95"
        }`}
      >
        {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        {t("prev")}
      </button>

      <div className="flex min-w-[100px] items-center justify-center gap-1.5">
        <span className="text-sm font-medium text-gray-400">{t("page")}</span>
        <span className="text-base font-bold text-gray-900">{currentPage}</span>
        <span className="px-1 text-sm font-medium text-gray-400">
          {t("of")}
        </span>
        <span className="text-base font-bold text-gray-900">{totalPages}</span>
      </div>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(String(currentPage + 1))}
        className={`flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-300 ${
          currentPage === totalPages
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-primary hover:text-primary active:scale-95"
        }`}
      >
        {t("next")}
        {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </div>
  );
};
