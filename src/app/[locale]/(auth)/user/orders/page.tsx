"use client";

import React from "react";
import { Order } from "@/app/[locale]/(auth)/user/types/account";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useUserOrders } from "../hooks/useUserOrders";
import { OrderHeader } from "../component/OrderHeader";
import { OrderFilters } from "../component/OrderFilters";
import OrderList from "../component/OrderList";
import { OrderPagination } from "../component/OrderPagination";
import { ShoppingBag } from "lucide-react";

const OrdersPage: React.FC = () => {
  const locale = useAppLocale();
  const {
    searchTerm,
    timeFilter,
    currentPage,
    totalPages,
    paginatedOrders,
    filteredCount,
    updateSearchParam,
    loading,
    error
  } = useUserOrders([], 8); // Pass empty array instead of mock

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-500">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {locale === "ar" ? "فشل في تحميل الطلبات" : "Failed to load orders"}
        </h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl pb-20">
      <OrderHeader />

      <OrderFilters
        searchTerm={searchTerm}
        timeFilter={timeFilter}
        filteredCount={filteredCount}
        updateSearchParam={updateSearchParam}
      />

      <OrderList orders={paginatedOrders} locale={locale} />

      {totalPages > 1 && (
        <OrderPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => updateSearchParam("page", page)}
          locale={locale}
        />
      )}
    </div>
  );
};

export default OrdersPage;
