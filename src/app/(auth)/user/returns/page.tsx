"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LocalizedTitle } from "@/types/language";

type ReturnItem = {
  id: string;
  name: LocalizedTitle;
  image: string;
  price: number;
  quantity: number;
  reason: LocalizedTitle;
  status: LocalizedStatus;
  returnOption: LocalizedTitle;
  refundAmount?: number;
  estimatedRefundDate?: string;
};

type ReturnOrder = {
  id: string;
  orderId: string;
  date: string;
  items: ReturnItem[];
  status: LocalizedStatus;
  totalRefund: number;
  trackingNumber?: string;
  carrier?: string;
};

type LocalizedStatus = {
  en: "Requested" | "Approved" | "In Transit" | "Delivered" | "Rejected";
  ar: "تم الطلب" | "تمت الموافقة" | "قيد التوصيل" | "تم التوصيل" | "مرفوض";
};

const translations = {
  title: {
    en: "My Returns",
    ar: "مرتجعاتي",
  },
  createReturn: {
    en: "Create a new return",
    ar: "إنشاء طلب إرجاع جديد",
  },
  tab: {
    All: { en: "All", ar: "الكل" },
    Requested: { en: "Requested", ar: "تم الطلب" },
    Approved: { en: "Approved", ar: "تمت الموافقة" },
    "In Transit": { en: "In Transit", ar: "قيد التوصيل" },
    Delivered: { en: "Delivered", ar: "تم التوصيل" },
    Rejected: { en: "Rejected", ar: "مرفوض" },
  },
  return: {
    en: "Returns",
    ar: "المرتجعات",
  },
  returnId: {
    en: "Return #",
    ar: "المرتجع رقم",
  },
  forOrder: {
    en: "For Order #",
    ar: "للطلب رقم",
  },
  requestedOn: {
    en: "Requested on",
    ar: "تم الطلب في",
  },
  qty: {
    en: "Qty",
    ar: "الكمية",
  },
  reason: {
    en: "Reason",
    ar: "السبب",
  },
  returnOption: {
    en: "Return Option",
    ar: "خيار الإرجاع",
  },
  refundAmount: {
    en: "Refund Amount",
    ar: "مبلغ الاسترداد",
  },
  estimatedRefundDate: {
    en: "Estimated Refund Date",
    ar: "تاريخ الاسترداد المتوقع",
  },
  trackingNumber: {
    en: "Tracking Number",
    ar: "رقم التتبع",
  },
  totalRefund: {
    en: "Total Refund",
    ar: "إجمالي الاسترداد",
  },
  noReturnsTitle: {
    en: "No returns found",
    ar: "لم يتم العثور على مرتجعات",
  },
  noReturnsMessage: {
    en: "You have not requested any",
    ar: "لم تقم بطلب أي",
  },
  createNow: {
    en: "CREATE A NEW RETURN",
    ar: "إنشاء طلب إرجاع",
  },
};

const ReturnsPage = () => {
  const [activeTab, setActiveTab] = useState<ReturnOrder["status"] | "All">(
    "All",
  );
  const { language: locale } = useLanguage();
  const returns: ReturnOrder[] = [
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
          image: "https://f.nooncdn.com/...",
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
        {
          id: "ITEM-002",
          name: {
            en: "Smart Watch Series 5",
            ar: "ساعة ذكية الإصدار 5",
          },
          image: "https://f.nooncdn.com/...",
          price: 129.99,
          quantity: 1,
          reason: {
            en: "Product not as described",
            ar: "المنتج ليس كما هو موصوف",
          },
          returnOption: {
            en: "noon Credit",
            ar: "رصيد نون",
          },
          status: {
            en: "Delivered",
            ar: "تم التوصيل",
          },
          refundAmount: 129.99,
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
          image: "https://f.nooncdn.com/...",
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
    {
      id: "RET-13579",
      orderId: "ORD-24680",
      date: "2025-05-30",
      status: {
        en: "In Transit",
        ar: "قيد التوصيل",
      },
      totalRefund: 75.0,
      trackingNumber: "TRK246813579",
      carrier: "DHL",
      items: [
        {
          id: "ITEM-004",
          name: {
            en: "Portable Bluetooth Speaker",
            ar: "مكبر صوت بلوتوث محمول",
          },
          image: "https://f.nooncdn.com/...",
          price: 75.0,
          quantity: 1,
          reason: {
            en: "Wrong item received",
            ar: "تم استلام منتج خاطئ",
          },
          returnOption: {
            en: "Refund to original payment",
            ar: "استرداد على وسيلة الدفع الأصلية",
          },
          status: {
            en: "In Transit",
            ar: "قيد التوصيل",
          },
        },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Requested":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-blue-100 text-blue-800";
      case "In Transit":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredReturns =
    activeTab === "All"
      ? returns
      : returns.filter((r) => r.status === activeTab);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-700">
          {translations.title[locale]}
        </h1>
        <Link
          href="returns/new"
          className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 md:px-6 md:text-sm"
        >
          <Plus className="h-4 w-4" />
          {translations.createReturn[locale]}
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {Object.keys(translations.tab).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as ReturnOrder["status"] | "All")}
            className={`rounded-md px-4 py-2 text-sm transition ${
              activeTab === tab
                ? "bg-green-600 text-white hover:bg-green-700"
                : "border bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {translations.tab[tab as keyof typeof translations.tab][locale]}{" "}
            {translations.return[locale]}
          </button>
        ))}
      </div>

      {filteredReturns.length > 0 ? (
        <div className="space-y-6">
          {filteredReturns.map((returnOrder) => (
            <div
              key={returnOrder.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="border-b p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-medium">
                      {translations.returnId[locale]} {returnOrder.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {translations.forOrder[locale]} {returnOrder.orderId}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <span
                      className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        returnOrder.status.en,
                      )}`}
                    >
                      {returnOrder.status[locale]}
                    </span>
                    <p className="mt-1 text-sm text-gray-500">
                      {translations.requestedOn[locale]} {returnOrder.date}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {returnOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-start border-b py-3 last:border-b-0 md:flex-row"
                  >
                    <Image
                      width={300}
                      height={300}
                      src={item.image}
                      alt={item.name[locale] ?? "product image"}
                      className="mr-4 h-20 w-20 rounded object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <p className="font-medium">{item.name[locale]}</p>
                          <p className="text-sm text-gray-600">
                            {translations.qty[locale]}: {item.quantity}
                          </p>
                          <p className="text-sm">
                            {item.price.toFixed(2)}{" "}
                            {locale === "ar" ? "جنيه" : "EGP"}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:text-right">
                          <span
                            className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                              item.status.en,
                            )}`}
                          >
                            {item.status[locale]}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {translations.reason[locale]}
                          </p>
                          <p className="text-sm">{item.reason[locale]}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {translations.returnOption[locale]}
                          </p>
                          <p className="text-sm">{item.returnOption[locale]}</p>
                        </div>
                        {item.refundAmount && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {translations.refundAmount[locale]}
                            </p>
                            <p className="text-sm">
                              {item.refundAmount.toFixed(2)}{" "}
                              {locale === "ar" ? "جنيه" : "EGP"}
                            </p>
                          </div>
                        )}
                        {item.estimatedRefundDate && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {translations.estimatedRefundDate[locale]}
                            </p>
                            <p className="text-sm">
                              {item.estimatedRefundDate}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t bg-gray-50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {returnOrder.trackingNumber && (
                      <div className="mb-2 sm:mb-0">
                        <p className="text-sm font-medium text-gray-700">
                          {translations.trackingNumber[locale]}
                        </p>
                        <p className="text-sm">
                          {returnOrder.trackingNumber} ({returnOrder.carrier})
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 sm:mt-0">
                    <p className="text-sm font-medium text-gray-700">
                      {translations.totalRefund[locale]}
                    </p>
                    <p className="text-lg font-bold">
                      {returnOrder.totalRefund.toFixed(2)}{" "}
                      {locale === "ar" ? "جنيه" : "EGP"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-semibold">
            {translations.noReturnsTitle[locale]}
          </h2>
          <p className="mb-4 text-gray-600">
            {translations.noReturnsMessage[locale]}{" "}
            {translations.tab[activeTab as keyof typeof translations.tab][
              locale
            ].toLowerCase()}{" "}
            {translations.return[locale].toLowerCase()}
          </p>
          <Link
            href="returns/new"
            className="rounded-md bg-green-600 px-6 py-2 text-white transition hover:bg-green-700"
          >
            {translations.createNow[locale]}
          </Link>
        </div>
      )}
    </div>
  );
};

export default ReturnsPage;
