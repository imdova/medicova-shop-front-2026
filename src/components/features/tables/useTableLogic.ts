"use client";

import { useState, useMemo, useCallback } from "react";
import { SortDirection, ColumnDefinition } from "./types";

interface UseTableLogicProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  itemsPerPage: number;
  pagination: boolean;
  rowIdKey: keyof T;
  onSelectionChange?: (selectedItems: T[]) => void;
  defaultSort?: { key: string; direction: SortDirection };
}

export const useTableLogic = <T extends object>({
  data,
  columns,
  itemsPerPage,
  pagination,
  rowIdKey,
  onSelectionChange,
  defaultSort,
}: UseTableLogicProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  } | null>(defaultSort || null);
  const [selectedRows, setSelectedRows] = useState<Set<T[keyof T]>>(new Set());
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key);

      if (column?.sortFn) {
        return sortConfig.direction === "asc"
          ? column.sortFn(a, b)
          : column.sortFn(b, a);
      }

      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, columns]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedData = pagination
    ? sortedData.slice(startIndex, endIndex)
    : sortedData;

  // Handlers
  const handleSort = useCallback((key: string) => {
    let direction: SortDirection = "asc";
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === "asc") direction = "desc";
      else if (sortConfig.direction === "desc") direction = null;
    }
    setSortConfig(direction ? { key, direction } : null);
    setCurrentPage(1);
  }, [sortConfig]);

  const toggleRowSelection = useCallback((rowId: T[keyof T]) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId);
      else next.add(rowId);

      if (onSelectionChange) {
        const selectedItems = sortedData.filter((item) => next.has(item[rowIdKey]));
        onSelectionChange(selectedItems);
      }
      return next;
    });
  }, [onSelectionChange, sortedData, rowIdKey]);

  const toggleSelectAll = useCallback(() => {
    if (selectedRows.size === displayedData.length) {
      setSelectedRows(new Set());
      if (onSelectionChange) onSelectionChange([]);
    } else {
      const next = new Set<T[keyof T]>();
      displayedData.forEach((item) => next.add(item[rowIdKey]));
      setSelectedRows(next);
      if (onSelectionChange) {
        const selectedItems = sortedData.filter((item) => next.has(item[rowIdKey]));
        onSelectionChange(selectedItems);
      }
    }
  }, [selectedRows.size, displayedData, rowIdKey, onSelectionChange, sortedData]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }, [totalPages]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  }, [currentPage, totalPages]);

  const toggleDropdown = useCallback((index: number) => {
    setOpenDropdownIndex((prev) => (prev === index ? null : index));
  }, []);

  // Helpers
  const allSelectedOnPage = displayedData.length > 0 && 
    displayedData.every((item) => selectedRows.has(item[rowIdKey]));
  
  const someSelectedOnPage = displayedData.length > 0 && 
    displayedData.some((item) => selectedRows.has(item[rowIdKey])) && 
    !allSelectedOnPage;

  return {
    currentPage,
    sortConfig,
    selectedRows,
    openDropdownIndex,
    setOpenDropdownIndex,
    displayedData,
    sortedData,
    totalPages,
    startIndex,
    endIndex,
    handleSort,
    toggleRowSelection,
    toggleSelectAll,
    handlePageChange,
    handlePrevious,
    handleNext,
    toggleDropdown,
    allSelectedOnPage,
    someSelectedOnPage,
  };
};
