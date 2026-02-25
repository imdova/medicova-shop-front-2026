"use client";

import React from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { ReturnOrder } from "../types/account";
import { useUserReturns } from "../hooks/useUserReturns";
import { ReturnHeader } from "../component/ReturnHeader";
import { ReturnFilters } from "../component/ReturnFilters";
import { ReturnList } from "../component/ReturnList";

const mockReturns: ReturnOrder[] = [
  {
    id: "RET-54321",
    orderId: "ORD-12345",
    date: "2025-05-18",
    status: {
      en: "Delivered",
      ar: "تم التوصيل",
    },
    totalRefund: 189.98,
    trackingNumber: "TRK789012345",
    carrier: "Aramex",
    items: [
      {
        id: "ITEM-001",
        name: {
          en: "Wireless Bluetooth Earbuds",
          ar: "سماعات بلوتوث لاسلكية",
        },
        image:
          "https://f.nooncdn.com/p/v1640702431/N52265998A_1.jpg?format=avif&width=original",
        price: 59.99,
        quantity: 1,
        reason: {
          en: "Changed my mind",
          ar: "غيرت رأيي",
        },
        returnOption: {
          en: "Refund to original payment",
          ar: "استرداد على وسيلة الدفع الأصلية",
        },
        status: {
          en: "Delivered",
          ar: "تم التوصيل",
        },
        refundAmount: 59.99,
        estimatedRefundDate: "2025-06-05",
      },
    ],
  },
  {
    id: "RET-98765",
    orderId: "ORD-67890",
    date: "2025-05-25",
    status: {
      en: "Requested",
      ar: "تم الطلب",
    },
    totalRefund: 39.98,
    items: [
      {
        id: "ITEM-003",
        name: {
          en: "USB-C Fast Charger",
          ar: "شاحن سريع USB-C",
        },
        image:
          "https://f.nooncdn.com/p/v1640702431/N52265998A_1.jpg?format=avif&width=original",
        price: 19.99,
        quantity: 2,
        reason: {
          en: "Product damaged",
          ar: "المنتج تالف",
        },
        returnOption: {
          en: "Replacement",
          ar: "استبدال",
        },
        status: {
          en: "Requested",
          ar: "تم الطلب",
        },
      },
    ],
  },
];

const ReturnsPage = () => {
  const locale = useAppLocale();
  const { activeTab, setActiveTab, filteredReturns, counts } =
    useUserReturns(mockReturns);

  return (
    <div className="mx-auto max-w-6xl pb-20">
      <ReturnHeader />

      <ReturnFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        locale={locale}
      />

      <ReturnList returns={filteredReturns} locale={locale} />
    </div>
  );
};

export default ReturnsPage;
