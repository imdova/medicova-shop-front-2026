"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LanguageType } from "@/util/translations";
import { Filters } from "@/components/features/filter/FilterDrawer";
import { formatDate } from "@/util/dateUtils";

// Modularized Components
import OrderStats from "../components/OrderStats";
import OrderFilters from "../components/OrderFilters";
import OrderTableContainer from "../components/OrderTableContainer";

// Constants & Types
import { orders, Order } from "../constants";

export default function OrdersListPanel({
  locale = "en",
}: {
  locale: LanguageType;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State Management
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  // URL State Management
  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // Filters State from URL
  const filters = useMemo(
    () => ({
      seller: searchParams.get("seller") || "all",
      customer: searchParams.get("customer") || "all",
      category: searchParams.get("category") || "all",
      status: searchParams.get("status") || "all",
      brand: searchParams.get("brand") || "all",
    }),
    [searchParams],
  );

  // Derived Data: Order Counts
  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      pending: 0,
      packaging: 0,
      for_delivery: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      const statusKey = order.status.toLowerCase().replace(" ", "_");
      if (counts[statusKey] !== undefined) {
        counts[statusKey]++;
      }
    });

    return counts;
  }, []);

  // Filtered Data
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusMatch =
        activeStatus === "all" ||
        order.status.toLowerCase().replace(" ", "_") === activeStatus;

      const sellerMatch =
        filters.seller === "all" ||
        order.seller.toLowerCase() === filters.seller;

      // Add more filters as needed

      return statusMatch && sellerMatch;
    });
  }, [activeStatus, filters]);

  // Event Handlers
  const handleDateChange = useCallback(
    (range: { startDate: Date | null; endDate: Date | null }) => {
      updateQueryParams({
        start_date: range.startDate
          ? formatDate(range.startDate, "yyyy-MM-dd")
          : null,
        end_date: range.endDate
          ? formatDate(range.endDate, "yyyy-MM-dd")
          : null,
      });
    },
    [updateQueryParams],
  );

  const handleFilterChange = useCallback(
    (filterType: string, value: string) => {
      updateQueryParams({ [filterType]: value });
    },
    [updateQueryParams],
  );

  const handleReset = useCallback(() => {
    setActiveStatus("all");
    router.replace(pathname);
  }, [router, pathname]);

  const handleEdit = useCallback((order: Order) => {
    console.log("Editing order:", order.id);
  }, []);

  const handleDelete = useCallback((order: Order) => {
    console.log("Deleting order:", order.id);
  }, []);

  return (
    <div className="animate-in fade-in fill-mode-forwards relative space-y-2 duration-500">
      {/* Header Stats */}
      <OrderStats
        orderCounts={orderCounts}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      />

      {/* Main Filter Section */}
      <OrderFilters

        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={() => handleFilterChange("search", searchQuery)}
        onFiltersOpen={() => setFiltersOpen(true)}
        onDateChange={handleDateChange}
        onReset={handleReset}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Data Table Section */}
      <OrderTableContainer
        data={filteredOrders}

        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Slide-out Filters (Optional) */}
      <Filters
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filtersData={[]}

      />
    </div>
  );
}
