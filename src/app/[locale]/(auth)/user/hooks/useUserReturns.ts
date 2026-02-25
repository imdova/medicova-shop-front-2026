"use client";

import { useState, useMemo } from "react";

export type ReturnStatus = "Requested" | "Approved" | "In Transit" | "Delivered" | "Rejected" | "All";

export const useUserReturns = <T extends { status: { en: string } }>(returns: T[]) => {
  const [activeTab, setActiveTab] = useState<ReturnStatus>("All");

  const filteredReturns = useMemo(() => {
    if (activeTab === "All") return returns;
    return returns.filter((r) => r.status.en === activeTab);
  }, [activeTab, returns]);

  const counts = useMemo(() => {
    const stats: Record<string, number> = {
      All: returns.length,
      Requested: 0,
      Approved: 0,
      "In Transit": 0,
      Delivered: 0,
      Rejected: 0,
    };

    returns.forEach((r) => {
      const status = r.status.en;
      if (status in stats) {
        stats[status]++;
      }
    });

    return stats;
  }, [returns]);

  return {
    activeTab,
    setActiveTab,
    filteredReturns,
    counts,
  };
};
