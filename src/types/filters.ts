// Types
export interface FilterOption {
  id: string;
  name: { en: string; ar: string };
}

export type FilterType =
  | "dropdown"
  | "search"
  | "date"
  | "number"
  | "checkbox"
  | "date-range"
  | "number-range";

export interface BaseFilter {
  id: string;
  label: { en: string; ar: string };
  type: FilterType;
  visible?: boolean;
}

export interface DropdownFilter extends BaseFilter {
  type: "dropdown";
  options: FilterOption[];
}

export interface SearchFilter extends BaseFilter {
  type: "search";
}

export interface DateFilter extends BaseFilter {
  type: "date";
  options: [];
}

export interface NumberFilter extends BaseFilter {
  type: "number";
}

export interface NumberRangeFilter extends BaseFilter {
  type: "number-range";
}

export interface CheckboxFilter extends BaseFilter {
  type: "checkbox";
  options: FilterOption[];
}
export interface DateRangeFilter extends BaseFilter {
  type: "date-range";
}

export type DynamicFilterItem =
  | DropdownFilter
  | SearchFilter
  | DateFilter
  | NumberFilter
  | NumberRangeFilter
  | DateRangeFilter
  | CheckboxFilter;
