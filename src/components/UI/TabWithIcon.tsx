"use client";

import { useState, useMemo } from "react";
import { LucideIcon } from "lucide-react";

interface Tab {
  label: string;
  content: React.ReactNode;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: Tab[];
  leftbutton?: React.ReactNode;
}

export const TabWithIcon = ({ tabs, leftbutton }: TabsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Memoize the active content to prevent unnecessary re-renders
  const activeContent = useMemo(() => {
    return tabs[activeIndex]?.content;
  }, [activeIndex, tabs]);

  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-3 rounded-lg border border-gray-300 bg-white p-2 sm:items-center sm:justify-between lg:flex-row">
        {/* Tabs List */}
        <div className="flex w-full flex-col flex-wrap gap-2 sm:flex-row lg:w-fit">
          {tabs.map((tab, index) => {
            const isActive = activeIndex === index;
            const Icon = tab.icon;

            return (
              <button
                key={`tab-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors lg:w-fit ${
                  isActive
                    ? "border-gray-300 bg-gray-200 text-gray-800 shadow-sm"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100"
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Optional Button */}
        {leftbutton && (
          <div className="w-full sm:flex-shrink-0 lg:w-fit">{leftbutton}</div>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-4">{activeContent}</div>
    </div>
  );
};
