"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ReturnStatus } from "../hooks/useUserReturns";

interface ReturnFiltersProps {
  activeTab: ReturnStatus;
  setActiveTab: (tab: ReturnStatus) => void;
  counts: Record<string, number>;
  locale: string;
}

export const ReturnFilters: React.FC<ReturnFiltersProps> = ({
  activeTab,
  setActiveTab,
  counts,
}) => {
  const t = useTranslations("user");

  const tabs: ReturnStatus[] = [
    "All",
    "Requested",
    "Approved",
    "In Transit",
    "Delivered",
    "Rejected",
  ];

  const getLabel = (tab: ReturnStatus) => {
    switch (tab) {
      case "All":
        return t("allReturns");
      case "Requested":
        return t("requested");
      case "Approved":
        return t("approved");
      case "In Transit":
        return t("inTransit");
      case "Delivered":
        return t("delivered");
      case "Rejected":
        return t("rejected");
      default:
        return tab;
    }
  };

  return (
    <div className="no-scrollbar sticky top-0 z-20 -mx-4 mb-8 overflow-x-auto bg-[#fcfcfd]/80 px-4 py-2 backdrop-blur-md">
      <div className="flex min-w-max gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-300 ${
              activeTab === tab
                ? "bg-white text-primary shadow-lg shadow-gray-200/50 ring-1 ring-gray-100"
                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            }`}
          >
            {getLabel(tab)}
            <span
              className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black tracking-tight transition-colors duration-300 ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {counts[tab] || 0}
            </span>
            {activeTab === tab && (
              <div className="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
