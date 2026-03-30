"use client";

import LeftFilter from "@/components/features/filter/LeftFilter";
import TapFilter from "@/components/features/filter/TapFilter";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { Product } from "@/types/product";
import ProductCard from "@/components/features/cards/ProductCard";
import { Drawer } from "@/components/layouts/Drawer";
import { ArrowDownUp, Filter } from "lucide-react";
import Dropdown from "@/components/shared/DropDownMenu";
import MobileDropdown from "@/components/layouts/MobileDropdown";
import ViewToggle from "@/components/shared/Buttons/ViewToggle";
import ListProductCard from "@/components/features/cards/ListProductCard";
import { sortOptions } from "@/constants/filters";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useGetProductsByCategory } from "@/hooks/useGetProductsByCategory";
import { getCategories } from "@/services/categoryService";
import { getBrands } from "@/services/brandService";
import { FilterGroup, MultiCategory, Brand } from "@/types";

const Text = {
  en: {
    page: "Page",
    of: "of",
    previous: "Previous",
    next: "Next",
    sortby: "Sort by",
    filter: "Filter",
  },
  ar: {
    page: "الصفحة",
    of: "من",
    previous: "السابق",
    next: "التالي",
    sortby: "الترتيب حسب",
    filter: "فلتر",
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
  const locale = useAppLocale();
  const [view, setView] = useState<"list" | "grid">("grid");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const initialPage = searchParams.get("page");
    return initialPage ? parseInt(initialPage, 10) : 1;
  });
  const itemsPerPage = 12;

  const query = searchParams.get("q") || undefined;

  const [dynamicCategories, setDynamicCategories] = useState<MultiCategory[]>([]);
  const [dynamicBrands, setDynamicBrands] = useState<Brand[]>([]);

  // Fetch dynamic filters
  useEffect(() => {
    const fetchFilters = async () => {
      const [cats, brs] = await Promise.all([getCategories(), getBrands()]);
      setDynamicCategories(cats);
      setDynamicBrands(brs);
    };
    fetchFilters();
  }, []);

  // Extract filters from URL
  const selectedBrands = useMemo(() => searchParams.get("brand")?.split(",") || [], [searchParams]);
  const selectedCategories = useMemo(() => searchParams.get("category")?.split(",") || [], [searchParams]);
  const minPrice = useMemo(() => searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined, [searchParams]);
  const maxPrice = useMemo(() => searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined, [searchParams]);
  const rating = useMemo(() => searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined, [searchParams]);
  const availability = useMemo(() => searchParams.get("availability")?.split(",") || [], [searchParams]);
  const sort = useMemo(() => searchParams.get("sort") || undefined, [searchParams]);

  // Construct dynamic Filter Groups
  const dynamicFilterGroups: FilterGroup[] = useMemo(() => {
    return [
      {
        id: "category",
        name: { en: "Category", ar: "الفئة" },
        options: dynamicCategories.map(cat => ({
          id: cat.slug || cat.id,
          name: cat.title,
          subcategories: cat.subCategories?.map(sub => ({
            id: sub.slug || sub.id,
            name: sub.title,
            subcategories: sub.subCategories?.map(child => ({
              id: child.slug || child.id,
              name: child.title
            }))
          }))
        }))
      },
      {
        id: "brand",
        name: { en: "Brand", ar: "العلامة التجارية" },
        options: dynamicBrands.map(brand => ({
          id: brand.id,
          name: brand.name,
        }))
      },
      {
        id: "price",
        name: { en: "Price", ar: "السعر" },
        options: [
          {
            id: "custom-range",
            name: { en: "Custom Range", ar: "نطاق مخصص" },
            isRange: true,
          },
        ],
      },
      {
        id: "rating",
        name: { en: "Customer Rating", ar: "تقييم العملاء" },
        options: [
          { id: "4.5", name: { en: "4.5 & Up", ar: "4.5 فأعلى" } },
          { id: "4", name: { en: "4 & Up", ar: "4 فأعلى" } },
          { id: "3.5", name: { en: "3.5 & Up", ar: "3.5 فأعلى" } },
          { id: "3", name: { en: "3 & Up", ar: "3 فأعلى" } },
        ],
      },
      {
        id: "availability",
        name: { en: "Availability", ar: "التوفر" },
        options: [
          { id: "in-stock", name: { en: "In Stock", ar: "متوفر" } },
          { id: "out-of-stock", name: { en: "Out of Stock", ar: "غير متوفر" } },
        ],
      },
    ];
  }, [dynamicCategories, dynamicBrands]);

  const {
    productsData,
    totalProducts,
    isLoading: loading,
  } = useGetProductsByCategory({
    categorySlug: category,
    searchQuery: query,
    brands: selectedBrands,
    categories: selectedCategories,
    minPrice,
    maxPrice,
    rating,
    availability,
    sort,
    page: currentPage,
    limit: itemsPerPage,
  });

  useEffect(() => {
    setTotalResults(totalProducts);
  }, [totalProducts]);

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

  // Toggle filter in URL
  const toggleFilter = (
    filterKey: string,
    filterValue: string,
    isSubcategory = false,
    parentCategory?: string,
    isNestedSubcategory = false,
    grandparentCategory?: string,
  ) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (filterKey === "category") {
      // If we are selecting a single category from the root and none are currently selected in query
      const currentQueryCategories = newSearchParams.get("category")?.split(",") || [];
      
      // Category is from path params in this page
      const pathCategory = category;

      // If we already have a category in path OR multiple in query, handle as query params
      const allSelected = new Set(currentQueryCategories);
      if (pathCategory) allSelected.add(pathCategory);

      if (allSelected.has(filterValue)) {
        allSelected.delete(filterValue);
      } else {
        allSelected.add(filterValue);
      }

      const updatedList = Array.from(allSelected);
      if (updatedList.length === 0) {
        // If nothing left, go to base search
        newSearchParams.delete("category");
        router.push(`/search?${newSearchParams.toString()}`);
      } else if (updatedList.length === 1 && updatedList[0] === pathCategory) {
        // If only the original path category remains, just toggle it (meaning remove it)
        router.push(`/search?${newSearchParams.toString()}`);
      } else if (updatedList.length === 1 && !isSubcategory) {
        // If a new single root category is selected, go to its SEO path
        newSearchParams.delete("category");
        router.push(`/search/${updatedList[0]}?${newSearchParams.toString()}`);
      } else {
        // Multiple categories or subcategories: use query params on base /search
        newSearchParams.set("category", updatedList.join(","));
        router.push(`/search?${newSearchParams.toString()}`);
      }
      return;
    }


    const currentValues = newSearchParams.get(filterKey)?.split(",") || [];
    if (currentValues.includes(filterValue)) {
      const updatedValues = currentValues.filter((v) => v !== filterValue);
      if (updatedValues.length > 0) {
        newSearchParams.set(filterKey, updatedValues.join(","));
      } else {
        newSearchParams.delete(filterKey);
      }
    } else {
      newSearchParams.set(filterKey, [...currentValues, filterValue].join(","));
    }

    newSearchParams.delete("page");
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  };

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

  const setSortOption = (sortValue: string) => {
    toggleSingleFilter("sort", sortValue);
  };

  const setPage = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", page.toString());
    router.replace(`${pathname}?${newSearchParams.toString()}`);
    setCurrentPage(page);
  };

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
    router.push(`/search?${newSearchParams.toString()}`);
  };

  // Find current category path
  const findCategoryPath = () => {
    const currentPath: { id: string; name: string }[] = [];
    const mainCategory = dynamicFilterGroups
      .find((f: FilterGroup) => f.id === "category")
      ?.options?.find((opt: any) => opt.id === category);

    if (mainCategory) {
      currentPath.push({
        id: mainCategory.id,
        name: mainCategory.name[locale],
      });

      if (subcategory && Array.isArray(subcategory) && subcategory.length > 0) {
        let currentSubcategories = mainCategory.subcategories || [];
        for (const subId of subcategory) {
          const foundSub = currentSubcategories.find((sub: any) => sub.id === subId);
          if (foundSub) {
            currentPath.push({
              id: foundSub.id,
              name: foundSub.name[locale],
            });
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
      : query
        ? query
        : "Products";

  return (
    <div className="relative bg-white">
      <div className="container mx-auto px-6 py-4 lg:max-w-[98%]">
        <div className="gap-4 lg:flex">
          <div className="hidden lg:block">
            <LeftFilter
              locale={locale}
              filterGroups={dynamicFilterGroups}
              currentFilters={getCurrentFilters()}
              onFilterToggle={toggleFilter}
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
                locale={locale}
                filterGroups={dynamicFilterGroups}
                currentFilters={getCurrentFilters()}
                onFilterToggle={toggleFilter}
                onClearFilters={clearAllFilters}
                currentCategoryPath={currentCategoryPath.map((item) => item.id)}
              />
            </div>
          </Drawer>

          <div className="fixed bottom-20 left-1/2 z-[300] flex -translate-x-1/2 items-center rounded-full bg-primary text-sm text-white md:hidden">
            <button
              onClick={() => setIsOpenDropdown(true)}
              className="flex items-center gap-1 p-2 text-sm"
            >
              {Text[locale].sortby} <ArrowDownUp size={15} />
            </button>
            |
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-1 p-2 text-sm"
            >
              {Text[locale].filter} <Filter size={15} />
            </button>
          </div>

          <div className="flex-1">
            <div className="sticky top-0 z-20 mb-4 flex w-full items-center justify-between border-y border-gray-200 bg-white md:relative md:border-none">
              <h1 className="p-3 text-xs text-gray-900 md:text-lg">
                {locale === "ar"
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
                  locale={locale}
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
              locale={locale}
            />

            <div className="mb-4 gap-2 border-b border-gray-200">
              <TapFilter
                filterGroups={dynamicFilterGroups.filter((g: FilterGroup) => g.id === "brand")}
                currentFilters={getCurrentFilters()}
                onFilterToggle={toggleFilter}
                locale={locale}
              />
            </div>

            {loading ? (
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
                    : "flex flex-col gap-4"
                }
              >
                {[...Array(itemsPerPage)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-lg bg-gray-50 shadow-sm"
                  ></div>
                ))}
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {productsData.map((product) => (
                  <div key={product.id} className="w-full flex-shrink-0">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {productsData.map((product) => (
                  <div key={product.id} className="w-full">
                    <ListProductCard locale={locale} product={product} />
                  </div>
                ))}
              </div>
            )}

            {totalResults > itemsPerPage && (
              <div
                className={`mt-6 flex flex-col gap-2 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
                  locale === "ar" ? "rtl text-right" : ""
                }`}
              >
                <div className="flex justify-center sm:justify-start">
                  <p className="text-sm text-gray-700">
                    {Text[locale].page}{" "}
                    <span className="font-medium">{currentPage}</span>{" "}
                    {Text[locale].of}{" "}
                    <span className="font-medium">
                      {Math.ceil(totalResults / itemsPerPage)}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`hidden rounded-md border px-4 py-2 text-sm font-medium md:block ${
                      currentPage === 1
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {Text[locale].previous}
                  </button>

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

                  <button
                    onClick={() =>
                      setPage(
                        Math.min(
                          Math.ceil(totalResults / itemsPerPage),
                          currentPage + 1,
                        ),
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(totalResults / itemsPerPage)
                    }
                    className={`hidden rounded-md border px-4 py-2 text-sm font-medium md:block ${
                      currentPage === Math.ceil(totalResults / itemsPerPage)
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {Text[locale].next}
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
