import { LanguageType } from "@/util/translations";
import React from "react";

export type alignType = "left" | "center" | "right";

export type ColumnDefinition<T> = {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode | void;
  width?: string;
  align?: alignType;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
};

export type ActionButton<T> = {
  label:
    | {
        en: string;
        ar: string;
      }
    | React.ReactNode;
  onClick: (item: T, index: number) => void;
  className?: string;
  icon?: React.ReactNode;
  hide?: (item: T) => boolean;
};

export type ActionSolidButton<T> = {
  onClick: (item: T, index: number) => void;
  className?: string;
  color?: string;
  icon?: React.ReactNode;
  label?: string;
  hide?: (item: T) => boolean;
};

export type SortDirection = "asc" | "desc" | null;

export type DynamicTableProps<T> = {
  data: T[];
  columns: ColumnDefinition<T>[];
  pagination?: boolean;
  itemsPerPage?: number;
  className?: string;
  minWidth?: number;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  emptyMessage?: {
    en: string;
    ar: string;
  };
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  rowIdKey?: keyof T;
  defaultSort?: {
    key: string;
    direction: SortDirection;
  };
  actions?: ActionButton<T>[];
  solidActions?: ActionSolidButton<T>[];
  actionsColumnHeader?: {
    en: string;
    ar: string;
  };
  actionsColumnWidth?: string;
  locale?: LanguageType;
};
