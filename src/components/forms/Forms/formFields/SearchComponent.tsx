"use client";

import { Search, X, Menu, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface SearchComponentProps {
  locale?: string;
  inputClassName?: string;
  iconClassName?: string;
  variant?: "default" | "header";
}

const SearchComponent = ({
  locale = "en",
  inputClassName,
  iconClassName,
  variant = "default",
}: SearchComponentProps) => {
  const t = useTranslations("header");
  const isRtl = locale === "ar";

  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const performSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      performSearch(searchQuery);
    }
  };

  return (
    <div className="relative w-full">
      <div
        className={`relative flex w-full items-center transition-all duration-300 ${
          variant === "header" ? "overflow-hidden rounded-md bg-white" : ""
        }`}
      >
        <div className="relative flex h-full w-full flex-1 items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder={t("searchPlaceholder")}
            className={`h-full w-full bg-transparent ${inputClassName || ""} ${
              variant === "header"
                ? "min-h-[48px] px-4 py-3 text-sm text-gray-800 placeholder:text-gray-500"
                : `rounded-lg bg-white/10 py-2 text-sm backdrop-blur-sm focus:bg-white/20 focus:ring-2 focus:ring-white/30 md:py-3 ${
                    isRtl ? "pl-10 pr-12" : "pl-12 pr-10"
                  }`
            } outline-none transition-all duration-300`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {variant !== "header" && (
            <div
              className={`absolute top-1/2 -translate-y-1/2 ${
                isRtl ? "right-4" : "left-4"
              }`}
            >
              <Search className={iconClassName} size={15} />
            </div>
          )}

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                inputRef.current?.focus();
              }}
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 transition-transform hover:scale-110 hover:text-gray-600 ${
                isRtl ? "left-4" : "right-4"
              } ${variant === "header" ? (isRtl ? "left-3" : "right-3") : ""}`}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {variant === "header" && (
          <button
            onClick={() => performSearch(searchQuery)}
            className="hidden h-[50px] shrink-0 items-center justify-center bg-[#174F30] px-8 font-semibold text-white transition-colors hover:bg-[#0f3420] md:flex"
          >
            {t("searchButton")}
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
