"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Order } from "@/app/[locale]/(auth)/user/types/account";

export const useUserOrders = (mockOrders: Order[], pageSize: number = 8) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchTerm = searchParams.get("search") || "";
  const timeFilter = (searchParams.get("timeFilter") as "all" | "last3months") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateSearchParam = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set(param, value);
    } else {
      params.delete(param);
    }

    if (["search", "timeFilter"].includes(param)) {
      params.set("page", "1");
    }

    router.push(`/user/orders?${params.toString()}`);
  };

  const filteredOrders = useMemo(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return mockOrders.filter((order) => {
      const matchesSearch =
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productBrand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTimePeriod =
        timeFilter === "all" || order.createdAt >= threeMonthsAgo.getTime();

      return matchesSearch && matchesTimePeriod;
    });
  }, [searchTerm, timeFilter, mockOrders]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const currentPage = Math.min(Math.max(page, 1), totalPages || 1);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return {
    searchTerm,
    timeFilter,
    currentPage,
    totalPages,
    paginatedOrders,
    filteredCount: filteredOrders.length,
    updateSearchParam,
  };
};
