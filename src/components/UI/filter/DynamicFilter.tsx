"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, List, LayoutGrid, X } from "lucide-react";
import DateRangeSelector, { DateRange } from "../DateRangeSelector";
import { LanguageType } from "@/util/translations";
import Dropdown from "../DropDownMenu";
import { Filters } from "./FilterDrawer";
import { FilterDrawerGroup } from "@/types";
import {
  DropdownFilter,
  DynamicFilterItem,
  FilterOption,
} from "@/types/filters";

type TranslationValue = string | Record<string, string>;

interface DynamicFilterProps {
  // Configuration props
  showSearch?: boolean;
  showQuickFilters?: boolean;
  showStatusCards?: boolean;
  showViewToggle?: boolean;
  showActionButtons?: boolean;
  showMoreFilters?: boolean;

  // Filter visibility control
  visibleFilters?: string[];

  // Collapsible behavior
  defaultExpanded?: boolean;
  collapsible?: boolean;

  // Quick filters grid control
  quickFiltersGridCols?: string;

  // External controls
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;

  // Your existing props
  t: Record<string, TranslationValue>; // <-- FIXED
  locale: LanguageType;
  isRTL: boolean;
  drawerFilters: FilterDrawerGroup[];
  statusCounts?: Record<string, number>;
  filtersOpen: boolean;

  // Your existing handlers
  setFiltersOpen: (open: boolean) => void;

  // Dynamic filters
  filters?: DynamicFilterItem[];
}

const DynamicFilter = ({
  // Configuration defaults
  showQuickFilters = true,
  showStatusCards = true,
  showViewToggle = true,
  showActionButtons = true,
  showMoreFilters = true,

  // Filter visibility control
  visibleFilters = ["search", "date", "quick", "status", "actions"],

  // Collapsible behavior
  defaultExpanded = true,
  collapsible = true,

  // Quick filters grid control
  quickFiltersGridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",

  // External control
  isOpen: externalIsOpen,
  onToggle,

  // Your existing props
  t,
  locale,
  isRTL,
  drawerFilters,
  statusCounts,
  filtersOpen,
  setFiltersOpen,

  // Dynamic filters
  filters = [],
}: DynamicFilterProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [internalIsOpen, setInternalIsOpen] = useState(defaultExpanded);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    const newState = !isOpen;
    if (onToggle) {
      onToggle(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  const setQuery = (key: string, value: string | null | string[]) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (Array.isArray(value)) {
      if (value.length > 0) {
        newSearchParams.set(key, value.join(","));
      } else {
        newSearchParams.delete(key);
      }
    } else if (value) {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }

    router.push(`?${newSearchParams.toString()}`, { scroll: false });
  };

  function useSetQuery() {
    return (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        if (params.get(key) === value) return; // prevent loop
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.replace(`?${params.toString()}`);
    };
  }

  const setVeiw = (mode: "grid" | "list") => {
    setQuery("veiw", mode);
  };
  const veiwMode = (searchParams.get("veiw") as "grid" | "list") || "grid";

  const handleStatusClick = (id: string) => {
    setQuery("status", id);
  };

  const isStatusActive = (id: string) => {
    return searchParams.get("status") === id;
  };

  const resetFilters = () => {
    router.push(window.location.pathname, { scroll: false });
  };

  // Make a component for the date-range filter
  function DateRangeFilter({ locale }: { locale: LanguageType }) {
    const setQuery = useSetQuery();

    return (
      <DateRangeSelector
        onDateChange={(range: DateRange | undefined) => {
          const startDate = range?.startDate
            ? new Date(range.startDate).toISOString()
            : null;
          const endDate = range?.endDate
            ? new Date(range.endDate).toISOString()
            : null;

          setQuery("startDate", startDate);
          setQuery("endDate", endDate);
        }}
        formatString="MM/dd/yyyy"
        className="w-full"
        locale={locale}
      />
    );
  }

  const renderFilterInput = (filter: DynamicFilterItem) => {
    switch (filter.type) {
      case "dropdown":
        const dropdownValue = searchParams.get(filter.id) || "";
        return (
          <Dropdown
            options={filter.options}
            selected={dropdownValue}
            onSelect={(value) => setQuery(filter.id, value.toString())}
            locale={locale}
            placeholder={`${locale === "en" ? "Select From" : "أختر من"} ${filter.label[locale]}`}
          />
        );
      case "search":
        const searchValue = searchParams.get(filter.id) || "";
        return (
          <div className="relative">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setQuery(filter.id, e.target.value)}
              placeholder={`Search ${filter.label[locale]}`}
              className="w-full rounded border border-gray-300 px-3 py-1.5 pl-8 text-sm outline-none"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              size={15}
            />{" "}
          </div>
        );
      case "number":
        const numberValue = searchParams.get(filter.id) || "";
        return (
          <input
            type="number"
            value={numberValue}
            onChange={(e) => setQuery(filter.id, e.target.value)}
            placeholder={` ${locale === "en" ? "Enter" : "ادخل"} ${filter.label[locale]}`}
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm outline-none"
          />
        );
      case "date-range":
        return <DateRangeFilter locale={locale} />;
      case "number-range":
        const minVal = searchParams.get(`${filter.id}Min`) || "";
        const maxVal = searchParams.get(`${filter.id}Max`) || "";
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={minVal}
              onChange={(e) => setQuery(`${filter.id}Min`, e.target.value)}
              placeholder={` ${locale === "en" ? "Min" : "اقل"} ${filter.label[locale]}`}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm outline-none"
            />
            <input
              type="number"
              value={maxVal}
              onChange={(e) => setQuery(`${filter.id}Max`, e.target.value)}
              placeholder={`${locale === "en" ? "Max" : "اعلي"} ${filter.label[locale]}`}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm outline-none"
            />
          </div>
        );
      case "checkbox":
        const currentValues = (searchParams.get(filter.id) || "")
          .split(",")
          .filter(Boolean);
        return (
          <div className="space-y-2">
            {filter.options.map((option: FilterOption) => (
              <label key={option.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={currentValues.includes(option.id)}
                  onChange={(e) => {
                    const newValue = e.target.checked
                      ? [...currentValues, option.id]
                      : currentValues.filter((id) => id !== option.id);
                    setQuery(filter.id, newValue.join(","));
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{option.name[locale]}</span>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {isOpen && (
        <div className="shadow-xs space-y-6 rounded-lg border border-gray-200 bg-white p-3">
          <>
            {collapsible && (
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {(t.filters as string) || "Filters"}
                </h3>
                <button
                  onClick={handleToggle}
                  className="flex items-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {showQuickFilters && visibleFilters.includes("quick") && (
              <div>
                <div className={`grid gap-4 ${quickFiltersGridCols}`}>
                  {filters.map((filter) => (
                    <div key={filter.id} className="space-y-2">
                      <h3 className="text-sm font-medium">
                        {filter.label[locale]}
                      </h3>
                      {renderFilterInput(filter)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showStatusCards && visibleFilters.includes("status") && (
              <div className="flex flex-col flex-wrap justify-between gap-4 md:flex-row">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  {(
                    (
                      filters.find((f) => f.id === "status") as
                        | DropdownFilter
                        | undefined
                    )?.options ?? []
                  ).map((option: FilterOption) => (
                    <button
                      key={option.id}
                      onClick={() => handleStatusClick(option.id)}
                      className={`w-full rounded-lg border px-4 py-2 text-xs shadow-sm transition-colors sm:w-fit ${
                        isStatusActive(option.id)
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 bg-white text-gray-500"
                      }`}
                    >
                      <h3 className="text-xs font-medium">
                        {option.name[locale]} ({statusCounts?.[option.id] || 0})
                      </h3>
                    </button>
                  ))}
                </div>

                {showActionButtons && visibleFilters.includes("actions") && (
                  <div className="flex justify-between gap-4">
                    {showViewToggle && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setVeiw("list")}
                          className={`flex h-9 w-9 items-center justify-center rounded border border-primary text-sm text-primary transition hover:bg-primary hover:text-white ${
                            veiwMode === "list" ? "bg-primary text-white" : ""
                          }`}
                        >
                          <List size={16} />
                        </button>
                        <button
                          onClick={() => setVeiw("grid")}
                          className={`flex h-9 w-9 items-center justify-center rounded border border-primary text-sm text-primary transition hover:bg-primary hover:text-white ${
                            veiwMode === "grid" ? "bg-primary text-white" : ""
                          }`}
                        >
                          <LayoutGrid size={16} />
                        </button>
                      </div>
                    )}

                    <div
                      className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <button
                        onClick={resetFilters}
                        className="rounded border border-primary px-3 py-1.5 text-sm text-primary transition hover:bg-primary hover:text-white"
                      >
                        {t.reset as string}
                      </button>
                      {showMoreFilters && (
                        <button
                          onClick={() => setFiltersOpen(true)}
                          className={`flex items-center justify-center rounded border border-primary p-2 text-sm text-primary transition hover:bg-primary hover:text-white`}
                        >
                          Show More filter
                        </button>
                      )}
                      <button className="rounded bg-secondary px-3 py-1.5 text-sm text-white transition hover:brightness-95">
                        {t.showData as string}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>

          {showMoreFilters && (
            <Filters
              filtersData={drawerFilters}
              isOpen={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              locale={locale ?? "en"}
            />
          )}
        </div>
      )}
    </>
  );
};

export default DynamicFilter;
