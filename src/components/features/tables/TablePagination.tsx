"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { LanguageType } from "@/util/translations";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  selectedCount: number;
  selectable: boolean;
  handlePrevious: () => void;
  handleNext: () => void;
  handlePageChange: (page: number) => void;
}

import { useLocale } from "next-intl";

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  selectedCount,
  selectable,
  handlePrevious,
  handleNext,
  handlePageChange,
}) => {
  const locale = useLocale() as LanguageType;
  const t = useTranslations("table");
  const tCommon = useTranslations("common");
  const isRTL = locale === "ar";

  return (
    <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {tCommon("previous")}
        </button>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {tCommon("next")}
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            {t.rich("showingCount", {
              start: startIndex + 1,
              end: Math.min(endIndex, totalItems),
              total: totalItems,
              span: (chunks) => <span className="font-medium">{chunks}</span>,
            })}
            {selectable && selectedCount > 0 && (
              <span className="mx-2 font-medium text-green-600">
                {t("selectedCount", { count: selectedCount })}
              </span>
            )}
          </p>
        </div>

        <div>
          <nav
            className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center ${isRTL ? "rounded-r-md" : "rounded-l-md"} border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="sr-only">{tCommon("previous")}</span>
              {isRTL ? "→" : "←"}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                  currentPage === page
                    ? "z-10 border-green-500 bg-green-50 text-green-600"
                    : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center ${isRTL ? "rounded-l-md" : "rounded-r-md"} border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="sr-only">{tCommon("next")}</span>
              {isRTL ? "←" : "→"}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
