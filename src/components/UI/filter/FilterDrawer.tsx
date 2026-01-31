"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Drawer } from "../Drawer";
import DynamicCheckbox from "../DynamicCheckbox";
import { FilterDrawerGroup } from "@/types";
import { LanguageType } from "@/util/translations";

export const Filters = ({
  isOpen,
  onClose,
  filtersData,
  locale = "en",
}: {
  isOpen: boolean;
  onClose: () => void;
  filtersData: FilterDrawerGroup[];
  locale: LanguageType;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterDrawerGroup[]>(filtersData);
  const labels = {
    allFilters: {
      en: "All filters",
      ar: "كل الفلاتر",
    },
    clearAll: {
      en: "Clear all",
      ar: "مسح الكل",
    },
    cancel: {
      en: "Cancel",
      ar: "إلغاء",
    },
    apply: {
      en: "Apply",
      ar: "تطبيق",
    },
  };

  // Initialize filters from URL params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    setFilters((prevFilters) =>
      prevFilters.map((group) => ({
        ...group,
        options: group.options.map((option) => ({
          ...option,
          selected: params.getAll(group.id).includes(option.id),
        })),
      })),
    );
  }, [searchParams]);

  const toggleGroup = (groupId: string) => {
    setFilters((prevFilters) =>
      prevFilters.map((group) =>
        group.id === groupId
          ? { ...group, collapsed: !group.collapsed }
          : group,
      ),
    );
  };

  const toggleOption = (groupId: string, optionId: string) => {
    const params = new URLSearchParams(searchParams);
    const group = filters.find((g) => g.id === groupId);

    if (group?.isSingleSelect) {
      // For single select groups, replace any existing value
      params.delete(groupId);
      params.append(groupId, optionId);
    } else {
      // For multi-select groups, keep the existing behavior
      const currentValues = params.getAll(groupId);
      if (currentValues.includes(optionId)) {
        params.delete(groupId);
        currentValues
          .filter((id) => id !== optionId)
          .forEach((id) => params.append(groupId, id));
      } else {
        params.append(groupId, optionId);
      }
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.replace(pathname);
  };

  const applyFilters = () => {
    onClose();
  };

  return (
    <Drawer
      hiddenCloseBtn
      mobile={false}
      isOpen={isOpen}
      onClose={onClose}
      width="w-80"
      position="right"
    >
      <div className="no-scrollbar h-full max-h-[600px] overflow-y-auto pb-14">
        <div className="h-full p-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">{labels.allFilters[locale]}</h2>
            <button
              onClick={clearAllFilters}
              className="text-sm text-green-600 hover:text-green-800"
            >
              {labels.clearAll[locale]}
            </button>
          </div>

          <div className="space-y-6">
            {filters.map((group) => (
              <div key={group.id} className="border-b pb-4">
                <button
                  className="flex w-full items-center justify-between text-left font-medium"
                  onClick={() => toggleGroup(group.id)}
                >
                  <span>{group.label[locale]}</span>
                  {group.collapsed ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronUp size={18} />
                  )}
                </button>

                {!group.collapsed && (
                  <div className="mt-2 space-y-2 pl-2">
                    {group.options.map((option) => {
                      const isSelected = searchParams
                        .getAll(group.id)
                        .includes(option.id);
                      return (
                        <div
                          key={option.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <DynamicCheckbox
                            label={option.label[locale]}
                            checked={isSelected}
                            onChange={() => toggleOption(group.id, option.id)}
                          />
                          {option.count !== undefined && (
                            <span className="text-sm text-gray-500">
                              ({option.count})
                            </span>
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
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 py-2 hover:bg-gray-50"
            >
              {labels.cancel[(locale = "en")]}
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 rounded-md bg-green-600 py-2 text-white hover:bg-green-700"
            >
              {labels.apply[(locale = "en")]}
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
