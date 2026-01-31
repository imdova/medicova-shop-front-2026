"use client";

import { LanguageType } from "@/util/translations";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  locale?: LanguageType;
}

const paginationLabels = {
  en: {
    previous: "Previous",
    next: "Next",
  },
  ar: {
    previous: "السابق",
    next: "التالي",
  },
};

export const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  locale = "en",
}: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handlePageChange = (page: number) => {
    const queryString = createQueryString("page", page.toString());
    router.push(`?${queryString}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-md border px-3 py-1 disabled:opacity-50"
      >
        {paginationLabels[locale].previous}
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`rounded-md border px-3 py-1 ${
            currentPage === page ? "bg-primary text-white" : ""
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-md border px-3 py-1 disabled:opacity-50"
      >
        {paginationLabels[locale].next}
      </button>
    </div>
  );
};
