"use client";

import React from "react";
import { Order } from "@/app/[locale]/(auth)/user/types/account";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useUserOrders } from "../hooks/useUserOrders";
import { OrderHeader } from "../component/OrderHeader";
import { OrderFilters } from "../component/OrderFilters";
import OrderList from "../component/OrderList";
import { OrderPagination } from "../component/OrderPagination";

const mockOrders: Order[] = [
  {
    id: "1",
    status: "cancelled",
    productImage:
      "https://f.nooncdn.com/p/v1640702431/N52265998A_1.jpg?format=avif&width=original",
    date: "Tuesday, 27th May",
    time: "06:50 PM",
    productName: "Jeep Buluo Leather Cross Body Bag Black",
    orderId: "NEBHIB0642330781",
    createdAt: new Date("2023-05-27").getTime(),
  },
  {
    id: "2",
    status: "cancelled",
    productImage:
      "https://f.nooncdn.com/p/v1640702431/N52265998A_1.jpg?format=avif&width=original",
    date: "Tuesday, 27th May",
    time: "06:50 PM",
    productName: "B.S COLLECTION: Ywingo waterproof bag shoulder or backpack",
    productBrand: "B.S",
    productDescription: "Cafe color",
    orderId: "NEBHIB0642330782",
    createdAt: new Date("2023-05-27").getTime(),
  },
  {
    id: "3",
    status: "completed",
    productImage:
      "https://f.nooncdn.com/p/v1640702431/N52265998A_1.jpg?format=avif&width=original",
    date: "Monday, 15th June",
    time: "10:30 AM",
    productName: "Wireless greentooth Headphones",
    productBrand: "SoundMaster",
    orderId: "NEBHIB0642330783",
    createdAt: new Date("2023-06-15").getTime(),
  },
  {
    id: "4",
    status: "completed",
    productImage:
      "https://f.nooncdn.com/p/v1640702431/N52265998A_1.jpg?format=avif&width=original",
    date: "Friday, 1st September",
    time: "03:45 PM",
    productName: "Smart Watch Pro",
    productBrand: "TechGadgets",
    orderId: "NEBHIB0642330784",
    createdAt: new Date("2023-09-01").getTime(),
  },
];

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
  } = useUserOrders(mockOrders, 8);

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
