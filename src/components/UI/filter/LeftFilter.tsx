"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FilterGroup, FilterOption } from "@/types";
import { LanguageType } from "@/util/translations";

type LeftFilterProps = {
  filterGroups: FilterGroup[];
  currentFilters: Record<string, string[]>;
  onFilterToggle: (
    filterKey: string,
    filterValue: string,
    isSubcategory?: boolean,
    parentCategory?: string,
    isNestedSubcategory?: boolean,
    grandparentCategory?: string,
  ) => void;
  onClearFilters: () => void;
  onPriceRangeSubmit?: (min: string, max: string) => void;
  currentCategoryPath?: string[];
  locale: LanguageType;
};

export default function LeftFilter({
  filterGroups,
  currentFilters,
  onFilterToggle,
  onClearFilters,
  onPriceRangeSubmit,
  locale,
  currentCategoryPath = [],
}: LeftFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openFilterGroups, setOpenFilterGroups] = useState<
    Record<string, boolean>
  >(filterGroups.reduce((acc, group) => ({ ...acc, [group.id]: true }), {}));

  const [openSubcategories, setOpenSubcategories] = useState<
    Record<string, boolean>
  >(currentCategoryPath.reduce((acc, id) => ({ ...acc, [id]: true }), {}));

  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("min_price") || "",
    max: searchParams.get("max_price") || "",
  });

  const toggleFilterGroup = (groupId: string) => {
    setOpenFilterGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleSubcategory = (categoryId: string) => {
    setOpenSubcategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const isFilterActive = (filterKey: string, filterValue: string) => {
    if (filterKey === "category") {
      return (
        currentCategoryPath[currentCategoryPath.length - 1] === filterValue
      );
    }
    return currentFilters[filterKey]?.includes(filterValue) || false;
  };

  const hasActiveFilters =
    Object.values(currentFilters).some((filters) => filters.length > 0) ||
    currentCategoryPath.length > 0;

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePriceRangeSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());

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

    ["under-1000", "1000-2000", "2000-5000", "over-5000"].forEach((id) => {
      if (params.has("price", id)) {
        params.delete("price", id);
      }
    });

    router.push(`?${params.toString()}`);

    if (onPriceRangeSubmit) {
      onPriceRangeSubmit(priceRange.min, priceRange.max);
    }
  };

  const renderRatingStars = (rating: string) => {
    const numericRating = parseFloat(rating);
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= numericRating
                ? "fill-green-600 text-green-600"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-500">& Up</span>
      </div>
    );
  };

  const renderSubcategories = (
    subcategories: FilterOption[],
    groupId: string,
    parentCategoryId: string,
    grandparentCategoryId?: string,
    level = 0,
  ) => {
    return (
      <div className={`${level > 0 ? "ml-6" : ""} my-2 space-y-2`}>
        {subcategories.map((sub) => (
          <div key={sub.id} className="relative cursor-pointer">
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-3">
                <div className="relative h-5 w-5 cursor-pointer">
                  <input
                    id={`subcategory-${sub.id}`}
                    name="subcategory"
                    type="checkbox"
                    checked={isFilterActive(groupId, sub.id)}
                    onChange={() =>
                      onFilterToggle(
                        groupId,
                        sub.id,
                        true,
                        parentCategoryId,
                        level > 0,
                        grandparentCategoryId,
                      )
                    }
                    className="peer relative h-full w-full cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-green-500 checked:bg-green-500"
                  />
                  <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                    <Check className="text-white" size={13} />
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {sub.name[locale]}
                </span>
              </label>
              {sub.subcategories && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSubcategory(sub.id);
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  {openSubcategories[sub.id] ? (
                    <Minus className="text-gray-700" size={13} />
                  ) : (
                    <Plus className="text-gray-700" size={13} />
                  )}
                </button>
              )}
            </div>
            {sub.subcategories &&
              openSubcategories[sub.id] &&
              renderSubcategories(
                sub.subcategories,
                groupId,
                sub.id,
                parentCategoryId,
                level + 1,
              )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex-shrink-0 md:w-72">
      <div className="rounded-lg bg-white p-4 shadow-sm">
        {hasActiveFilters && (
          <div
            className="mb-4 flex justify-end"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <button
              onClick={() => {
                router.push(`/search`);
                onClearFilters();
                setPriceRange({ min: "", max: "" });
              }}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              {locale === "ar" ? "مسح الكل" : "Clear all"}
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {filterGroups.map((group) => (
          <div key={group.id} className="border-gray-100 pb-6">
            <div
              className="mb-4 flex cursor-pointer items-center justify-between"
              onClick={() => toggleFilterGroup(group.id)}
            >
              <h3 className="text-md font-bold text-gray-600">
                {group.name[locale]}
              </h3>
              {openFilterGroups[group.id] ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>

            {openFilterGroups[group.id] && (
              <div className="mt-2 space-y-4 pl-2">
                {group.options?.map((option) => {
                  if (group.id === "price" && option.isRange) {
                    return (
                      <div
                        key="custom-price-range"
                        className="space-y-2"
                        dir={locale === "ar" ? "rtl" : "ltr"}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            name="min"
                            placeholder={
                              locale === "ar" ? "الحد الأدنى" : "Min"
                            }
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
                            placeholder={
                              locale === "ar" ? "الحد الأقصى" : "Max"
                            }
                            value={priceRange.max}
                            onChange={handlePriceRangeChange}
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm outline-none"
                          />
                        </div>
                        <button
                          onClick={handlePriceRangeSubmit}
                          className="w-full rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-800"
                        >
                          {locale === "ar" ? "اذهب" : "Go"}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div key={option.id}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center">
                          <label className="flex cursor-pointer items-center gap-3">
                            <div className="relative h-5 w-5 cursor-pointer">
                              <input
                                id={`${group.id}-${option.id}`}
                                name={group.id}
                                type="checkbox"
                                checked={isFilterActive(group.id, option.id)}
                                onChange={() =>
                                  onFilterToggle(group.id, option.id)
                                }
                                className="peer relative h-full w-full cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-green-500 checked:bg-green-500"
                              />
                              <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                                <Check className="text-white" size={13} />
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-gray-600">
                              {group.id === "rating"
                                ? renderRatingStars(option.id)
                                : option.name[locale]}
                            </span>
                          </label>
                        </div>
                        {option.subcategories ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubcategory(option.id);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            {openSubcategories[option.id] ? (
                              <Minus className="text-gray-700" size={13} />
                            ) : (
                              <Plus className="text-gray-700" size={13} />
                            )}
                          </button>
                        ) : option.count ? (
                          <span className="text-xs text-gray-500">
                            {option.count}
                          </span>
                        ) : null}
                      </div>
                      {option.subcategories &&
                        openSubcategories[option.id] &&
                        renderSubcategories(
                          option.subcategories,
                          group.id,
                          option.id,
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
