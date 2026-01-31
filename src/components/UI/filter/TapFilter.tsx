"use client";

import {
  ChevronDown,
  ChevronUp,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import MobileDropdown from "../MobileDropdown";
import { useRouter, useSearchParams } from "next/navigation";
import { FilterGroup, FilterOption } from "@/types";
import { LanguageType } from "@/util/translations";

type TapFilterProps = {
  filterGroups: FilterGroup[];
  currentFilters: Record<string, string[]>;
  onFilterToggle: (filterKey: string, filterValue: string) => void;
  onPriceRangeSubmit?: (min: string, max: string) => void;
  locale: LanguageType;
};

export default function TapFilter({
  filterGroups,
  currentFilters,
  onFilterToggle,
  onPriceRangeSubmit,
  locale,
}: TapFilterProps) {
  const [openTapDropdown, setOpenTapDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<FilterOption[]>([]);
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("min_price") || "",
    max: searchParams.get("max_price") || "",
  });

  // Initialize price range from URL
  useEffect(() => {
    setPriceRange({
      min: searchParams.get("min_price") || "",
      max: searchParams.get("max_price") || "",
    });
  }, [searchParams]);

  const handleToggleDropdown = (
    group: FilterGroup,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    const button = event.currentTarget;
    if (openTapDropdown === group.id) {
      setOpenTapDropdown(null);
      setDropdownPosition(null);
    } else {
      const rect = button.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setDropdownPosition({
          left: rect.left - containerRect.left,
          top: rect.bottom - containerRect.top,
        });
      }
      setOpenTapDropdown(group.id);
      setFilteredOptions(group.options || []);
      setSearchTerm("");
      setIsDrawerOpen(true);
    }
  };

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openTapDropdown &&
        containerRef.current &&
        dropdownRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenTapDropdown(null);
        setDropdownPosition(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openTapDropdown]);

  // Navigation handlers
  const handleScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollNav = (direction: "left" | "right") => {
    if (navRef.current) {
      const scrollAmount = 200;
      navRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => scrollNav("right"),
    onSwipedRight: () => scrollNav("left"),
    trackMouse: true,
  });

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      if (navRef.current) {
        navRef.current.scrollLeft = 0;
        setTimeout(handleScroll, 100);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    handleScroll();
  }, []);

  const isFilterActive = (filterKey: string, filterValue: string): boolean => {
    // Special case for price range filter
    if (filterKey === "price" && typeof searchParams !== "undefined") {
      if (searchParams.has("min_price") || searchParams.has("max_price")) {
        // You can refine this to check filterValue matches price range criteria if needed
        return true;
      }
    }

    const groups = filterGroups.filter((g) => g.id === filterKey);
    if (groups.length === 0) return false;

    return groups.some((group) => {
      if (group.options && group.options.length > 0) {
        // Check if filterValue is among selected filter values for this key
        return currentFilters[filterKey]?.includes(filterValue) ?? false;
      } else if (group.option) {
        // For single option groups (like brand with option="apple")
        return (
          group.option === filterValue &&
          (currentFilters[filterKey]?.includes(filterValue) ?? false)
        );
      } else {
        // fallback: check if filterValue is present in currentFilters[filterKey]
        return currentFilters[filterKey]?.includes(filterValue) ?? false;
      }
    });
  };

  // Search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const group = filterGroups.find((g) => g.id === openTapDropdown);
    if (group?.options) {
      const filtered = group.options.filter((option) =>
        option.name?.[locale].toLowerCase().includes(term.toLowerCase()),
      );
      setFilteredOptions(filtered);
    }
  };

  // Price range handlers
  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePriceRangeSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Clear any existing price filters
    ["under-1000", "1000-2000", "2000-5000", "over-5000"].forEach((id) => {
      params.delete("price", id);
    });

    // Set new price range
    if (priceRange.min) {
      params.set("min_price", priceRange.min);
    } else {
      params.delete("min_price");
    }

    if (priceRange.max) {
      params.set("max_price", priceRange.max);
    } else {
      params.delete("max_price");
    }

    // Reset to first page
    params.delete("page");

    router.push(`?${params.toString()}`);

    if (onPriceRangeSubmit) {
      onPriceRangeSubmit(priceRange.min, priceRange.max);
    }

    // Close the dropdown
    setOpenTapDropdown(null);
  };

  const selectedGroup = filterGroups.find((g) => g.id === openTapDropdown);

  return (
    <div className="relative" ref={containerRef}>
      {/* Navigation arrows */}
      {showLeftArrow && (
        <button
          onClick={() => scrollNav("left")}
          className="absolute left-0 top-1/2 z-10 flex h-8 w-14 -translate-y-1/2 items-center justify-center bg-gradient-to-r from-white via-white to-white/25"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-full w-5 text-gray-700" />
        </button>
      )}

      {/* Main filter buttons */}
      <div
        {...handlers}
        ref={navRef}
        onScroll={handleScroll}
        className="no-scrollbar relative flex overflow-x-auto py-2 pl-2"
      >
        <div className="flex items-center gap-2">
          {filterGroups.map((group) => (
            <div key={group.name["en"]} className="relative shrink-0">
              <button
                onClick={(e) =>
                  group.options?.length
                    ? handleToggleDropdown(group, e)
                    : onFilterToggle(group.id, group.option ?? "")
                }
                className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm ${
                  isFilterActive(group.id, group.option ?? "")
                    ? "border border-green-300 bg-green-100 text-green-800"
                    : "border border-gray-200 bg-gray-100 text-gray-800"
                }`}
              >
                {group.name[locale]}
                {group.options?.length &&
                  group.options.length > 0 &&
                  (openTapDropdown === group.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
              </button>
            </div>
          ))}
        </div>
      </div>

      {showRightArrow && (
        <button
          onClick={() => scrollNav("right")}
          className="absolute right-0 top-1/2 z-10 flex h-8 w-14 -translate-y-1/2 items-center justify-center bg-gradient-to-l from-white via-white to-white/25"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 text-gray-700" />
        </button>
      )}

      {/* Desktop dropdown */}
      {selectedGroup && openTapDropdown && (
        <>
          <div
            ref={dropdownRef}
            style={{
              left: dropdownPosition?.left ?? 0,
              top: dropdownPosition?.top ?? 0,
            }}
            className="absolute z-10 mt-1 hidden w-56 rounded-md border border-gray-200 bg-white shadow-lg md:block"
          >
            {selectedGroup.id !== "price" && (
              <div className="border-b p-2">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={
                      locale === "ar"
                        ? `بحث في ${selectedGroup.name[locale]}`
                        : `Search ${selectedGroup.name[locale]}`
                    }
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:outline-none sm:text-sm"
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto">
              {selectedGroup.id === "price" ? (
                <div className="space-y-2 p-3">
                  <div
                    className="flex items-center gap-2"
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <input
                      type="number"
                      name="min"
                      placeholder={locale === "ar" ? "الحد الأدنى" : "Min"}
                      value={priceRange.min}
                      onChange={handlePriceRangeChange}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none"
                    />
                    <span className="text-gray-500">
                      {locale === "ar" ? "إلى" : "to"}
                    </span>
                    <input
                      type="number"
                      name="max"
                      placeholder={locale === "ar" ? "الحد الأقصى" : "Max"}
                      value={priceRange.max}
                      onChange={handlePriceRangeChange}
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none"
                    />
                  </div>
                  <button
                    onClick={handlePriceRangeSubmit}
                    className="w-full rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-800"
                  >
                    {locale === "ar" ? "تطبيق" : "Apply"}
                  </button>
                </div>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex cursor-pointer items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      onFilterToggle(selectedGroup.id, option.id);
                      setOpenTapDropdown(null);
                    }}
                  >
                    <span>{option.name[locale]}</span>
                    {option.count && (
                      <span className="text-xs text-gray-500">
                        {option.count}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  {locale === "ar"
                    ? "لم يتم العثور على خيارات"
                    : " No options found"}{" "}
                </div>
              )}
            </div>
          </div>

          {/* Mobile dropdown */}
          <div className="md:hidden">
            <MobileDropdown
              label={selectedGroup.name[locale]}
              isOpen={isDrawerOpen}
              setIsOpen={setIsDrawerOpen}
              locale={locale}
            >
              <div className="w-full">
                {selectedGroup.id !== "price" && (
                  <div className="border-b p-2">
                    <div
                      className="relative"
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    >
                      <div
                        className={`pointer-events-none absolute inset-y-0 ${
                          locale === "ar" ? "right-0 pr-3" : "left-0 pl-3"
                        } flex items-center`}
                      >
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder={
                          locale === "ar"
                            ? `ابحث في ${selectedGroup.name[locale]}`
                            : `Search ${selectedGroup.name[locale]}`
                        }
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={`block w-full rounded-md border border-gray-300 py-2 ${
                          locale === "ar" ? "pl-3 pr-10" : "pl-10 pr-3"
                        } leading-5 placeholder-gray-500 focus:outline-none sm:text-sm`}
                      />
                    </div>
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto">
                  {selectedGroup.id === "price" ? (
                    <div
                      className="space-y-2 p-3"
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          name="min"
                          placeholder={locale === "ar" ? "الحد الأدنى" : "Min"}
                          value={priceRange.min}
                          onChange={handlePriceRangeChange}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-gray-500">
                          {locale === "ar" ? "إلى" : "to"}
                        </span>
                        <input
                          type="number"
                          name="max"
                          placeholder={locale === "ar" ? "الحد الأقصى" : "Max"}
                          value={priceRange.max}
                          onChange={handlePriceRangeChange}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <button
                        onClick={handlePriceRangeSubmit}
                        className="w-full rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-800"
                      >
                        {locale === "ar" ? "تطبيق" : "Apply"}
                      </button>
                    </div>
                  ) : filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex cursor-pointer items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          onFilterToggle(selectedGroup.id, option.id);
                          setOpenTapDropdown(null);
                          setIsDrawerOpen(false);
                        }}
                      >
                        <span>{option.name[locale]}</span>
                        {option.count && (
                          <span className="text-xs text-gray-500">
                            {option.count}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {locale === "ar"
                        ? "لم يتم العثور على خيارات"
                        : " No options found"}
                    </div>
                  )}
                </div>
              </div>
            </MobileDropdown>
          </div>
        </>
      )}
    </div>
  );
}
