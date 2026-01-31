"use client";

import LeftFilter from "@/components/UI/filter/LeftFilter";
import TapFilter from "@/components/UI/filter/TapFilter";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { products } from "@/constants/products";
import { Product } from "@/types/product";
import ProductCard from "@/components/UI/cards/ProductCard";
import { Drawer } from "@/components/UI/Drawer";
import { ArrowDownUp, Filter } from "lucide-react";
import Dropdown from "@/components/UI/DropDownMenu";
import MobileDropdown from "@/components/UI/MobileDropdown";
import ViewToggle from "@/components/UI/Buttons/ViewToggle";
import ListProductCard from "@/components/UI/cards/ListProductCard";
import { leftFilters, sortOptions, tapFilters } from "@/constants/filters";
import { useLanguage } from "@/contexts/LanguageContext";

const paginationTexts = {
  en: {
    page: "Page",
    of: "of",
    previous: "Previous",
    next: "Next",
  },
  ar: {
    page: "الصفحة",
    of: "من",
    previous: "السابق",
    next: "التالي",
  },
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const resolvedParams = React.use(params);
  const { category, subcategory } = resolvedParams;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [view, setView] = useState<"list" | "grid">("grid");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const initialPage = searchParams.get("page");
    return initialPage ? parseInt(initialPage, 10) : 1;
  });
  const itemsPerPage = 10;
  const { language } = useLanguage();

  // Get current filters from URL
  const getCurrentFilters = () => {
    const filters: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      if (key !== "page" && key !== "sort" && key !== "q") {
        filters[key] = value.split(",");
      }
    });
    return filters;
  };

  // Toggle filter in URL - updated to handle nested subcategories
  const toggleFilter = (
    filterKey: string,
    filterValue: string,
    isSubcategory = false,
    parentCategory?: string,
    isNestedSubcategory = false,
    grandparentCategory?: string,
  ) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    // Handle category filters differently - navigate to path
    if (filterKey === "category") {
      // Clear any existing category filters from query params
      newSearchParams.delete("category");

      if (isSubcategory) {
        // Handle nested subcategories
        if (isNestedSubcategory && grandparentCategory) {
          // Construct the path for nested subcategories
          const newPath = `/search/${grandparentCategory}/${parentCategory}/${filterValue}`;
          router.push(`${newPath}?${newSearchParams.toString()}`);
        } else if (parentCategory) {
          // Construct the path for regular subcategories
          const newPath = `/search/${parentCategory}/${filterValue}`;
          router.push(`${newPath}?${newSearchParams.toString()}`);
        }
      } else {
        // For main categories, navigate to /search/category
        router.push(`/search/${filterValue}?${newSearchParams.toString()}`);
      }
      return;
    }

    // Handle other filters
    const currentValues = newSearchParams.get(filterKey)?.split(",") || [];

    if (currentValues.includes(filterValue)) {
      // Remove the filter value
      const updatedValues = currentValues.filter((v) => v !== filterValue);
      if (updatedValues.length > 0) {
        newSearchParams.set(filterKey, updatedValues.join(","));
      } else {
        newSearchParams.delete(filterKey);
      }
    } else {
      // Add the filter value
      newSearchParams.set(filterKey, [...currentValues, filterValue].join(","));
    }

    // Reset to first page when filters change
    newSearchParams.delete("page");
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  };

  // For single-select filters (like sort)
  const toggleSingleFilter = (filterKey: string, filterValue: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (newSearchParams.get(filterKey) === filterValue) {
      newSearchParams.delete(filterKey);
    } else {
      newSearchParams.set(filterKey, filterValue);
    }

    newSearchParams.delete("page");
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  };

  // Set sort option
  const setSortOption = (sortValue: string) => {
    toggleSingleFilter("sort", sortValue);
  };

  // Set page
  const setPage = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", page.toString());
    router.replace(`${pathname}?${newSearchParams.toString()}`);
    setCurrentPage(page);
  };

  // Get current sort option
  const getCurrentSort = () => {
    return searchParams.get("sort") || "recommended";
  };

  const clearAllFilters = () => {
    const newSearchParams = new URLSearchParams();
    if (searchParams.get("q")) {
      newSearchParams.set("q", searchParams.get("q")!);
    }
    if (searchParams.get("sort")) {
      newSearchParams.set("sort", searchParams.get("sort")!);
    }
    router.push(`/search`);
  };

  // Find current category and subcategory in the filters
  const findCategoryPath = () => {
    const currentPath: { id: string; name: string }[] = [];

    // Find main category
    const mainCategory = leftFilters
      .find((f) => f.id === "category")
      ?.options?.find((opt) => opt.id === category);

    if (mainCategory) {
      currentPath.push({
        id: mainCategory.id,
        name: mainCategory.name[language],
      });

      // Handle subcategories if they exist
      if (subcategory && subcategory.length > 0) {
        let currentSubcategories = mainCategory.subcategories || [];

        for (const subId of subcategory) {
          const foundSub = currentSubcategories.find((sub) => sub.id === subId);
          if (foundSub) {
            currentPath.push({
              id: foundSub.id,
              name: foundSub.name[language],
            });
            // Update currentSubcategories to next level for next iteration
            currentSubcategories = foundSub.subcategories || [];
          } else {
            break;
          }
        }
      }
    }

    return currentPath;
  };

  const currentCategoryPath = findCategoryPath();

  const displayTitle =
    currentCategoryPath.length > 0
      ? currentCategoryPath.map((item) => item.name).join(" > ")
      : searchParams.get("q")
        ? searchParams.get("q")
        : "Products";

  // Fetch products (mock implementation)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        setProductsData(products);
        setTotalResults(products.length);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory, searchParams]);

  return (
    <div className="relative bg-white">
      <div className="container mx-auto p-3 lg:max-w-[1440px]">
        <div className="gap-4 lg:flex">
          <div className="hidden lg:block">
            <LeftFilter
              filterGroups={leftFilters}
              locale={language}
              currentFilters={getCurrentFilters()}
              onFilterToggle={(
                key,
                value,
                isSubcategory,
                parentCategory,
                isNestedSubcategory,
                grandparentCategory,
              ) => {
                toggleFilter(
                  key,
                  value,
                  isSubcategory,
                  parentCategory,
                  isNestedSubcategory,
                  grandparentCategory,
                );
              }}
              onClearFilters={clearAllFilters}
              currentCategoryPath={currentCategoryPath.map((item) => item.id)}
            />
          </div>

          <Drawer
            position="left"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          >
            <div className="mt-6">
              <LeftFilter
                filterGroups={leftFilters}
                currentFilters={getCurrentFilters()}
                locale={language}
                onFilterToggle={(
                  key,
                  value,
                  isSubcategory,
                  parentCategory,
                  isNestedSubcategory,
                  grandparentCategory,
                ) => {
                  toggleFilter(
                    key,
                    value,
                    isSubcategory,
                    parentCategory,
                    isNestedSubcategory,
                    grandparentCategory,
                  );
                }}
                onClearFilters={clearAllFilters}
                currentCategoryPath={currentCategoryPath.map((item) => item.id)}
              />
            </div>
          </Drawer>

          <div
            className="fixed bottom-20 left-1/2 z-[300] flex -translate-x-1/2 items-center rounded-full bg-primary text-sm text-white md:bottom-14 lg:hidden"
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <button
              onClick={() => setIsOpenDropdown(true)}
              className="flex items-center gap-1 p-2 text-sm"
            >
              {language === "ar" ? "ترتيب حسب" : "Sort by"}{" "}
              <ArrowDownUp size={15} />
            </button>
            <span className="px-1">|</span>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1 p-2 text-sm"
            >
              {language === "ar" ? "تصفية" : "Filter"} <Filter size={15} />
            </button>
          </div>

          <div className="flex-1">
            <div className="sticky top-0 z-20 mb-4 flex w-full items-center justify-between border-y border-gray-200 bg-white md:relative md:border-none">
              <h1 className="p-3 text-xs text-gray-900 md:text-lg">
                {language === "ar"
                  ? `نتائج ${totalResults.toLocaleString()} لـ `
                  : `${totalResults.toLocaleString()} Results for `}
                <span className="text-xs font-semibold text-primary md:text-lg">
                  &ldquo;{displayTitle}&rdquo;
                </span>
              </h1>
              <div className="hidden md:block">
                <Dropdown
                  label="Sort by"
                  icon={<ArrowDownUp size={15} />}
                  options={sortOptions}
                  selected={getCurrentSort()}
                  onSelect={(value) => setSortOption(value.toString())}
                  locale={language}
                />
              </div>
              <div className="block md:hidden">
                <ViewToggle view={view} onChange={setView} />
              </div>
            </div>

            <MobileDropdown
              label="Sort by"
              options={sortOptions}
              selected={getCurrentSort()}
              onSelect={(value) => setSortOption(value.toString())}
              isOpen={isOpenDropdown}
              setIsOpen={setIsOpenDropdown}
              locale={language}
            />

            <div className="mb-4 gap-2 border-b border-gray-100">
              <TapFilter
                filterGroups={tapFilters}
                currentFilters={getCurrentFilters()}
                onFilterToggle={toggleFilter}
                locale={language}
              />
            </div>

            {loading ? (
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 gap-4"
                    : "flex flex-col gap-4"
                }
              >
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-lg bg-white p-4 shadow-sm"
                  ></div>
                ))}
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {productsData
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((product) => (
                    <div key={product.id} className="w-full flex-shrink-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {productsData
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((product) => (
                    <div key={product.id} className="w-full">
                      <ListProductCard locale={language} product={product} />
                    </div>
                  ))}
              </div>
            )}

            {totalResults > itemsPerPage && (
              <div
                className={`mt-6 flex flex-col gap-2 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
                  language === "ar" ? "rtl text-right" : ""
                }`}
              >
                {/* Page Info */}
                <div className="flex justify-center sm:justify-start">
                  <p className="text-sm text-gray-700">
                    {paginationTexts[language].page}{" "}
                    <span className="font-medium">{currentPage}</span>{" "}
                    {paginationTexts[language].of}{" "}
                    <span className="font-medium">
                      {Math.ceil(totalResults / itemsPerPage)}
                    </span>
                  </p>
                </div>

                {/* Pagination Buttons */}
                <div className="flex flex-wrap justify-center gap-2">
                  {/* Previous */}
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`hidden rounded-md border px-4 py-2 text-sm font-medium md:block ${
                      currentPage === 1
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {paginationTexts[language].previous}
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const totalPages = Math.ceil(totalResults / itemsPerPage);
                    const pagesToShow = 5;
                    const startPage = Math.max(
                      1,
                      Math.min(
                        currentPage - Math.floor(pagesToShow / 2),
                        totalPages - pagesToShow + 1,
                      ),
                    );
                    const endPage = Math.min(
                      startPage + pagesToShow - 1,
                      totalPages,
                    );

                    return Array.from(
                      { length: endPage - startPage + 1 },
                      (_, i) => {
                        const pageNum = startPage + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`rounded-md border px-4 py-2 text-sm font-medium ${
                              currentPage === pageNum
                                ? "border-green-600 bg-green-600 text-white"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    );
                  })()}

                  {/* Next */}
                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={
                      currentPage === Math.ceil(totalResults / itemsPerPage)
                    }
                    className={`hidden rounded-md border px-4 py-2 text-sm font-medium md:block ${
                      currentPage === Math.ceil(totalResults / itemsPerPage)
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {paginationTexts[language].next}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
