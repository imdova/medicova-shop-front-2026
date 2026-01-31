// components/UI/EnhancedDynamicSearchMenu.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  Check,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export interface SearchableItem {
  id: string;
  label: Record<string, string>;
  subItems?: SearchableItem[];
  parentId?: string;
  [key: string]: any;
}

interface EnhancedDynamicSearchMenuProps {
  items: SearchableItem[];
  selectedItem: SearchableItem | null;
  onSelect: (item: SearchableItem | null) => void;
  placeholder: Record<string, string>;
  searchPlaceholder: Record<string, string>;
  noResultsText: Record<string, string>;
  disabled?: boolean;
  error?: string;
  className?: string;
  maxHeight?: number;
  allowClear?: boolean;
  level?: number;
  onNavigate?: (item: SearchableItem) => void;
  showNavigation?: boolean;
  clearText?: Record<string, string>;
  backText?: Record<string, string>;
}

export const EnhancedDynamicSearchMenu = ({
  items,
  selectedItem,
  onSelect,
  placeholder,
  searchPlaceholder,
  noResultsText,
  disabled = false,
  error,
  className,
  maxHeight = 300,
  allowClear = true,
  level = 0,
  onNavigate,
  showNavigation = false,
  clearText = { en: "Clear Selection", ar: "مسح الاختيار" },
  backText = { en: "Back", ar: "رجوع" },
}: EnhancedDynamicSearchMenuProps) => {
  const { language, direction } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubmenu, setActiveSubmenu] = useState<SearchableItem | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get localized text
  const getLocalizedText = useCallback(
    (textObj: Record<string, string>) => {
      return textObj[language] || textObj.en || "";
    },
    [language],
  );

  // Flatten all items for searching - memoize
  const flattenItems = useCallback(
    (itemsToFlatten: SearchableItem[]): SearchableItem[] => {
      return itemsToFlatten.reduce((acc: SearchableItem[], item) => {
        acc.push(item);
        if (item.subItems && item.subItems.length > 0) {
          acc.push(...flattenItems(item.subItems));
        }
        return acc;
      }, []);
    },
    [],
  );

  const allItems = useMemo(() => flattenItems(items), [items, flattenItems]);

  // Filter items based on search term - memoize
  const filteredItems = useMemo(() => {
    if (searchTerm) {
      return allItems.filter((item) =>
        item.label[language]?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return activeSubmenu ? activeSubmenu.subItems || [] : items;
  }, [searchTerm, allItems, activeSubmenu, items, language]);

  // Find item by ID - memoize
  const findItemById = useCallback(
    (itemsToSearch: SearchableItem[], id: string): SearchableItem | null => {
      for (const item of itemsToSearch) {
        if (item.id === id) return item;
        if (item.subItems) {
          const found = findItemById(item.subItems, id);
          if (found) return found;
        }
      }
      return null;
    },
    [],
  );

  // Handle item selection
  const handleSelect = useCallback(
    (item: SearchableItem) => {
      if (item.subItems && item.subItems.length > 0 && !searchTerm) {
        setActiveSubmenu(item);
        if (onNavigate) onNavigate(item);
      } else {
        onSelect(item);
        setIsOpen(false);
        setSearchTerm("");
        setActiveSubmenu(null);
      }
    },
    [searchTerm, onNavigate, onSelect],
  );

  // Handle clear selection
  const handleClear = useCallback(() => {
    onSelect(null);
    setSearchTerm("");
    setActiveSubmenu(null);
  }, [onSelect]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (activeSubmenu?.parentId) {
      const parent = findItemById(items, activeSubmenu.parentId);
      setActiveSubmenu(parent);
      if (onNavigate && parent) onNavigate(parent);
    } else {
      setActiveSubmenu(null);
      if (onNavigate) onNavigate({} as SearchableItem);
    }
  }, [activeSubmenu, items, findItemById, onNavigate]);

  // Get breadcrumb path - memoize
  const getBreadcrumbPath = useCallback((): string[] => {
    const path: string[] = [];
    let current = activeSubmenu;
    while (current) {
      path.unshift(current.label[language] || current.label.en || "");
      if (current.parentId) {
        current = findItemById(items, current.parentId);
      } else {
        current = null;
      }
    }
    return path;
  }, [activeSubmenu, items, findItemById, language]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset active submenu when items change
  useEffect(() => {
    setActiveSubmenu(null);
  }, [items]);

  // Get appropriate Chevron icon based on direction
  const BackIcon = direction === "rtl" ? ChevronLeft : ChevronRight;
  const ForwardIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between rounded-md border bg-white px-4 py-3 text-left transition-colors rtl:text-right",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-green-500",
          disabled
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "hover:border-gray-400",
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        dir={direction}
      >
        <span
          className={cn(
            "truncate",
            !selectedItem && "text-gray-500",
            disabled && "text-gray-400",
          )}
        >
          {selectedItem
            ? selectedItem.label[language] || selectedItem.label.en || ""
            : getLocalizedText(placeholder)}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180",
            disabled && "text-gray-400",
          )}
        />
      </button>

      {/* Error Message */}
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute top-full z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
              direction === "rtl" ? "right-0" : "left-0",
            )}
            style={{
              maxHeight: `${maxHeight}px`,
              minWidth: "100%",
              width: "max-content",
            }}
            dir={direction}
          >
            {/* Breadcrumb Navigation */}
            {showNavigation && activeSubmenu && (
              <div className="sticky top-0 flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <BackIcon className="h-4 w-4" />
                  {getLocalizedText(backText)}
                </button>
                <div className="flex-1 truncate text-xs text-gray-500">
                  {getBreadcrumbPath().join(" › ")}
                </div>
              </div>
            )}

            {/* Search Input */}
            <div className="sticky top-0 border-b border-gray-200 bg-white p-2">
              <div className="relative">
                <Search
                  className={cn(
                    "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400",
                    direction === "rtl" ? "right-3" : "left-3",
                  )}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  className={cn(
                    "w-full rounded-md border border-gray-300 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500",
                    direction === "rtl" ? "pl-4 pr-10" : "pl-10 pr-4",
                  )}
                  placeholder={getLocalizedText(searchPlaceholder)}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setActiveSubmenu(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  dir={direction}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
                      direction === "rtl" ? "left-3" : "right-3",
                    )}
                    onClick={() => setSearchTerm("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="overflow-y-auto p-1">
              {filteredItems.length > 0 ? (
                <div className="space-y-1">
                  {filteredItems.map((item, index) => {
                    const hasSubItems =
                      item.subItems && item.subItems.length > 0;
                    const isSelected = selectedItem?.id === item.id;

                    return (
                      <button
                        key={index}
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between rounded-md p-3 text-left transition-colors rtl:text-right",
                          isSelected
                            ? "border border-green-200 bg-green-50"
                            : "hover:bg-gray-50",
                        )}
                        onClick={() => handleSelect(item)}
                        dir={direction}
                      >
                        <div className={cn("flex flex-1 items-center gap-2")}>
                          <span className="truncate text-sm">
                            {item.label[language] || item.label.en || ""}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            direction === "rtl" ? "flex-row-reverse" : "",
                          )}
                        >
                          {hasSubItems && !searchTerm && (
                            <ForwardIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-gray-500">
                  {getLocalizedText(noResultsText)}
                </div>
              )}
            </div>

            {/* Clear Selection */}
            {allowClear && selectedItem && !searchTerm && (
              <div className="sticky bottom-0 border-t border-gray-200 bg-white p-2">
                <button
                  type="button"
                  className="w-full rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                  onClick={handleClear}
                  dir={direction}
                >
                  {getLocalizedText(clearText)}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
