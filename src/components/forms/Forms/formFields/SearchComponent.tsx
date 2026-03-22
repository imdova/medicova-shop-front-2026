"use client";

import { Search, X, Menu, ChevronDown, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getProducts, mapApiProductToProduct } from "@/services/productService";
import { Product } from "@/types/product";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

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
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoadingSuggestions(true);
        try {
          const allApiProducts = await getProducts();
          const allProducts = allApiProducts.map(mapApiProductToProduct);
          
          const filtered = allProducts.filter((p: Product) => {
            const nameEn = p.title.en.toLowerCase();
            const nameAr = p.title.ar.toLowerCase();
            const query = searchQuery.toLowerCase();
            return nameEn.includes(query) || nameAr.includes(query);
          }).slice(0, 6); // Limit suggestions

          setSuggestions(filtered);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Suggestions fetch failed:", error);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />
          {isLoadingSuggestions && (
            <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "left-12" : "right-12"}`}>
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
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

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className={`absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 ${
            variant === "header" ? "mx-0" : "mx-0"
          }`}
        >
          <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
            {suggestions.map((product) => (
              <Link
                key={product.id}
                href={`/product-details/${product.slug[locale as "en" | "ar"]}`}
                onClick={() => setShowSuggestions(false)}
                className="flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-gray-50 group"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                  <Image
                    src={product.images[0] || "/images/placeholder.jpg"}
                    alt={product.title[locale as "en" | "ar"]}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <h4 className="line-clamp-1 text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {product.title[locale as "en" | "ar"]}
                  </h4>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {product.category?.title?.[locale as "en" | "ar"] || "Category"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-black text-primary">
                      {product.price} EGP
                    </span>
                    {product.del_price && (
                      <span className="text-[10px] text-gray-400 line-through font-bold">
                        {product.del_price} EGP
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="border-t border-gray-50 bg-gray-50/50 p-2">
            <button
              onClick={() => performSearch(searchQuery)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors"
            >
              <Search size={14} />
              {isRtl ? `عرض جميع النتائج لـ "${searchQuery}"` : `View all results for "${searchQuery}"`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
