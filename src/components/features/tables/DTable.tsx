"use client";

import React, { useRef, useEffect } from "react";
import { DynamicTableProps } from "./types";
import { useTableLogic } from "./useTableLogic";
import { TableActions } from "./TableActions";
import { TablePagination } from "./TablePagination";
import { useLocale } from "next-intl";
import { LocalizedTitle } from "@/types/language";
import { LanguageType } from "@/util/translations";

const DynamicTable = <T extends object>({
  data,
  columns,
  pagination = false,
  itemsPerPage = 10,
  className = "",
  headerClassName = "bg-gray-100 text-gray-700 text-sm",
  rowClassName = "hover:bg-gray-50 text-sm",
  cellClassName = "py-3 px-2",
  emptyMessage = { en: "No data available", ar: "لا توجد بيانات متاحة" },
  selectable = false,
  onSelectionChange,
  rowIdKey = "id" as keyof T,
  defaultSort,
  minWidth = 900,
  actions = [],
  solidActions = [],
  actionsColumnHeader = { en: "Actions", ar: "إجراءات" },
  actionsColumnWidth = "50px",
}: DynamicTableProps<T>) => {
  const locale = useLocale() as LanguageType;
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  const {
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
  } = useTableLogic({
    data,
    columns,
    itemsPerPage,
    pagination,
    rowIdKey,
    onSelectionChange,
    defaultSort,
  });

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openDropdownIndex !== null &&
        dropdownRefs.current[openDropdownIndex] &&
        !dropdownRefs.current[openDropdownIndex]?.contains(event.target as Node)
      ) {
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownIndex, setOpenDropdownIndex]);

  const isRTL = locale === "ar";
  const tableDirection = isRTL ? "rtl" : "ltr";

  return (
    <div
      className={`relative flex flex-col rounded-md ${className}`}
      dir={tableDirection}
    >
      <div className="scroll-bar-minimal grid grid-cols-1 overflow-x-auto">
        <table style={{ minWidth }} className="divide-y divide-gray-200">
          <thead className={headerClassName}>
            <tr>
              {selectable && (
                <th scope="col" className={`${cellClassName} w-10 text-center`}>
                  <label className="relative inline-flex h-5 w-5 cursor-pointer items-center justify-center">
                    <input
                      type="checkbox"
                      checked={allSelectedOnPage && displayedData.length > 0}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelectedOnPage;
                      }}
                      onChange={toggleSelectAll}
                      className="absolute z-10 h-full w-full cursor-pointer opacity-0"
                    />
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-all duration-150 ease-in-out ${
                        (allSelectedOnPage && displayedData.length > 0) ||
                        someSelectedOnPage
                          ? "border-white bg-green-500"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {allSelectedOnPage && displayedData.length > 0 ? (
                        <CheckIcon />
                      ) : someSelectedOnPage ? (
                        <MinusIcon />
                      ) : null}
                    </div>
                  </label>
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={{ textAlign: isRTL ? "right" : "left" }}
                  className={`${cellClassName} text-${column.align || (isRTL ? "right" : "left")} ${column.width || ""} select-none font-medium ${column.sortable ? "cursor-pointer hover:bg-gray-200" : ""}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div
                    className={`flex items-center ${column.align === "center" ? "justify-center" : column.align === "right" ? "justify-end" : "justify-start"}`}
                  >
                    {column.header}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "↓" : "↑"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {(actions.length || solidActions.length) > 0 && (
                <th
                  scope="col"
                  className={`${cellClassName} ${isRTL ? "text-left" : "text-right"} text-sm font-semibold`}
                  style={{ width: actionsColumnWidth }}
                >
                  {actionsColumnHeader[locale as keyof LocalizedTitle]}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedData.length > 0 ? (
              displayedData.map((item, rowIndex) => (
                <tr key={rowIndex} className={rowClassName}>
                  {selectable && (
                    <td className={`${cellClassName} text-center`}>
                      <label className="relative inline-flex h-5 w-5 cursor-pointer items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(item[rowIdKey])}
                          onChange={() => toggleRowSelection(item[rowIdKey])}
                          className="absolute h-full w-full opacity-0"
                        />
                        <div
                          className={`h-5 w-5 rounded border transition-all duration-150 ease-in-out ${
                            selectedRows.has(item[rowIdKey])
                              ? "border-white bg-green-500"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {selectedRows.has(item[rowIdKey]) && <CheckIcon />}
                        </div>
                      </label>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex}-${column.key}`}
                      className={`${cellClassName} text-${column.align || (isRTL ? "right" : "left")}`}
                    >
                      {column.render
                        ? column.render(item, rowIndex) ||
                          String(item[column.key as keyof T])
                        : String(item[column.key as keyof T])}
                    </td>
                  ))}
                  {(actions.length > 0 || solidActions.length > 0) && (
                    <td
                      className={`${cellClassName} ${isRTL ? "text-left" : "text-right"}`}
                      style={{ width: actionsColumnWidth }}
                    >
                      <TableActions
                        item={item}
                        index={rowIndex}
                        actions={actions}
                        solidActions={solidActions}
                        openDropdownIndex={openDropdownIndex}
                        toggleDropdown={toggleDropdown}
                        setOpenDropdownIndex={setOpenDropdownIndex}
                        dropdownRefs={dropdownRefs}
                      />
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                  className={`${cellClassName} py-10 text-center text-sm text-gray-600`}
                >
                  {emptyMessage[locale as keyof LocalizedTitle]}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && sortedData.length > itemsPerPage && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={sortedData.length}
          selectedCount={selectedRows.size}
          selectable={selectable}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          handlePageChange={handlePageChange}
        />
      )}
    </div>
  );
};

const CheckIcon = () => (
  <svg
    className="h-3.5 w-3.5 text-white"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const MinusIcon = () => (
  <svg
    className="h-3.5 w-3.5 text-white"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="6" y1="12" x2="18" y2="12" />
  </svg>
);

export default DynamicTable;
