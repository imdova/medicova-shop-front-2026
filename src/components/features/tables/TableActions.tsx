"use client";

import React from "react";
import { MoreVertical } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shared/Tooltip";
import { ActionButton, ActionSolidButton } from "./types";
import { LanguageType } from "@/util/translations";
import { LocalizedTitle } from "@/types/language";
import { useLocale } from "next-intl";

interface TableActionsProps<T> {
  item: T;
  index: number;
  actions: ActionButton<T>[];
  solidActions: ActionSolidButton<T>[];
  openDropdownIndex: number | null;
  toggleDropdown: (index: number) => void;
  setOpenDropdownIndex: (index: number | null) => void;
  dropdownRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export const TableActions = <T extends object>({
  item,
  index,
  actions,
  solidActions,
  openDropdownIndex,
  toggleDropdown,
  setOpenDropdownIndex,
  dropdownRefs,
}: TableActionsProps<T>) => {
  const locale = useLocale() as LanguageType;
  const visibleActions = actions.filter(
    (action) => !action.hide || !action.hide(item),
  );
  const visibleSolidActions = solidActions.filter(
    (action) => !action.hide || !action.hide(item),
  );

  return (
    <div className="flex gap-1">
      {/* Solid Actions */}
      <div className="relative flex justify-end gap-2">
        {visibleSolidActions.map((action, i) => (
          <TooltipProvider key={i}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => action.onClick(item, index)}
                  style={{ color: action.color }}
                  className="inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-500 shadow-sm hover:bg-gray-100 focus:outline-none"
                  aria-label={
                    typeof action.label === "string" ? action.label : undefined
                  }
                >
                  {action.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Dropdown Actions */}
      {visibleActions.length > 0 && (
        <div className="relative flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown(index);
            }}
            className="inline-flex items-center rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none"
            aria-label="Actions"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {openDropdownIndex === index && (
            <div
              ref={(el) => {
                dropdownRefs.current[index] = el;
              }}
              className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-gray-100 bg-white p-1 py-1 shadow-lg ring-opacity-5 focus:outline-none"
            >
              {visibleActions.map((action, actionIndex) => (
                <button
                  key={actionIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(item, index);
                    setOpenDropdownIndex(null);
                  }}
                  className={`mb-1 flex w-full items-center gap-1 rounded-md px-4 py-2 text-sm text-gray-700 transition duration-200 last:mb-0 hover:bg-gray-100 ${action.className || ""}`}
                >
                  {action.icon && <span>{action.icon}</span>}
                  {action.label &&
                  typeof action.label === "object" &&
                  !React.isValidElement(action.label) &&
                  "en" in action.label
                    ? (action.label as { en: string; ar: string })[
                        locale as keyof LocalizedTitle
                      ]
                    : action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
