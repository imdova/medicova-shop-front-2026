"use client";

import CustomAlert from "@/components/UI/CustomAlert";
import DynamicCheckbox from "@/components/UI/DynamicCheckbox";
import Image from "next/image";
import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LocalizedTitle } from "@/types/language";

type OrderItem = {
  name: string;
  image: string;
  price: number;
  quantity: number;
  reason: LocalizedTitle | null;
  returnOption: LocalizedTitle | null;
  selected: boolean;
};

type Order = {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: LocalizedTitle;
  selected: boolean;
};

const translations = {
  createTitle: { en: "Create a New Return", ar: "إنشاء طلب إرجاع جديد" },
  selectOrder: { en: "Select Order to Return", ar: "اختر الطلب للإرجاع" },
  order: { en: "Order", ar: "رقم الطلب" },
  placedOn: { en: "Placed on", ar: "تم في" },
  total: { en: "Total", ar: "الإجمالي" },
  itemsInOrder: { en: "Items in this order", ar: "العناصر في هذا الطلب" },
  qty: { en: "Qty", ar: "الكمية" },
  egp: { en: "EGP", ar: "جنيه" },
  reasonLabel: { en: "Reason for return", ar: "سبب الإرجاع" },
  reasonPlaceholder: { en: "Select a reason", ar: "اختر السبب" },
  optionLabel: { en: "Return option", ar: "خيار الإرجاع" },
  optionPlaceholder: { en: "Select an option", ar: "اختر الخيار" },
  requestButton: {
    en: "Request Return for This Order",
    ar: "طلب إرجاع لهذا الطلب",
  },
  instructionsTitle: { en: "Return Instructions", ar: "تعليمات الإرجاع" },
  instructions: [
    {
      en: "You have 14 days from the delivery date to request a return",
      ar: "لديك 14 يومًا من تاريخ التوصيل لطلب الإرجاع",
    },
    {
      en: "Items must be in original condition with all tags attached",
      ar: "يجب أن تكون العناصر في حالتها الأصلية مع وجود جميع البطاقات",
    },
    {
      en: "Refunds will be processed within 5–7 business days after return",
      ar: "سيتم معالجة المبالغ المستردة خلال 5-7 أيام عمل بعد الإرجاع",
    },
    {
      en: "Original shipping fees are non-refundable",
      ar: "رسوم الشحن الأصلية غير قابلة للاسترداد",
    },
    {
      en: "For damaged or incorrect items, contact support",
      ar: "للعناصر التالفة أو الخاطئة، يرجى التواصل مع الدعم",
    },
  ],
};

const returnReasons: LocalizedTitle[] = [
  { en: "Changed my mind", ar: "غيرت رأيي" },
  { en: "Product damaged", ar: "المنتج تالف" },
  { en: "Wrong item received", ar: "تم استلام منتج خاطئ" },
  { en: "Product not as described", ar: "المنتج ليس كما هو موصوف" },
  { en: "Other", ar: "أخرى" },
];

const returnOptions: LocalizedTitle[] = [
  { en: "Refund to original payment", ar: "استرداد على وسيلة الدفع الأصلية" },
  { en: "noon Credit", ar: "رصيد نون" },
  { en: "Replacement", ar: "استبدال" },
];

const ReturnsPage = () => {
  const { language: locale } = useLanguage();
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info" | "cart" | "wishlist";
  } | null>(null);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-12345",
      date: "2025-05-15",
      items: [
        {
          name: "Wireless Bluetooth Earbuds",
          image:
            "https://f.nooncdn.com/p/pzsku/ZE7B062D6B7327CA2C705Z/45/_/1739718311/6609b50c-0851-41f2-9006-5d43b6e9c964.jpg?width=800",
          price: 59.99,
          quantity: 1,
          reason: null,
          returnOption: null,
          selected: false,
        },
      ],
      total: 59.99,
      status: { en: "Delivered", ar: "تم التوصيل" },
      selected: false,
    },
  ]);

  const handleItemSelect = (orderIndex: number, itemIndex: number) => {
    const updatedOrders = [...orders];
    const item = updatedOrders[orderIndex].items[itemIndex];
    item.selected = !item.selected;
    updatedOrders[orderIndex].selected = updatedOrders[orderIndex].items.every(
      (i) => i.selected,
    );
    setOrders(updatedOrders);
  };

  const handleOrderSelect = (orderIndex: number) => {
    const updatedOrders = [...orders];
    const order = updatedOrders[orderIndex];
    const selectAll = !order.selected;
    order.selected = selectAll;
    order.items.forEach((i) => (i.selected = selectAll));
    setOrders(updatedOrders);
  };

  const handleReasonChange = (
    orderIndex: number,
    itemIndex: number,
    value: string,
  ) => {
    const selected = returnReasons.find((r) => r[locale] === value) || null;
    const updatedOrders = [...orders];
    updatedOrders[orderIndex].items[itemIndex].reason = selected;
    setOrders(updatedOrders);
  };

  const handleOptionChange = (
    orderIndex: number,
    itemIndex: number,
    value: string,
  ) => {
    const selected = returnOptions.find((o) => o[locale] === value) || null;
    const updatedOrders = [...orders];
    updatedOrders[orderIndex].items[itemIndex].returnOption = selected;
    setOrders(updatedOrders);
  };

  const handleSubmitReturn = (orderIndex: number) => {
    const order = orders[orderIndex];
    const selectedItems = order.items.filter((item) => item.selected);
    if (selectedItems.length === 0)
      return showAlert(
        locale === "ar"
          ? "يرجى تحديد عنصر واحد على الأقل"
          : "Please select at least one item",
        "info",
      );
    if (selectedItems.some((item) => !item.reason || !item.returnOption))
      return showAlert(
        locale === "ar"
          ? "يرجى تحديد السبب وخيار الإرجاع لجميع العناصر المحددة"
          : "Please select reason and option for all selected items",
        "info",
      );

    showAlert(
      locale === "ar"
        ? `تم إرسال طلب الإرجاع للطلب ${order.id}`
        : `Return request submitted for order ${order.id}`,
      "success",
    );

    const updatedOrders = [...orders];
    updatedOrders[orderIndex].items.forEach((item) => {
      if (item.selected) {
        item.selected = false;
        item.reason = null;
        item.returnOption = null;
      }
    });
    updatedOrders[orderIndex].selected = false;
    setOrders(updatedOrders);
  };

  const showAlert = (
    message: string,
    type: "success" | "error" | "info" | "cart" | "wishlist",
  ) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div>
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold">
          {translations.createTitle[locale]}
        </h1>
        <h2 className="mb-4 font-semibold">
          {translations.selectOrder[locale]}
        </h2>

        {orders.map((order, orderIndex) => (
          <div key={order.id} className="mb-6 rounded-lg border p-4">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center">
                <DynamicCheckbox
                  checked={order.selected}
                  onChange={() => handleOrderSelect(orderIndex)}
                />
                <div className="mx-3">
                  <h3 className="font-medium">
                    {translations.order[locale]} #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {translations.placedOn[locale]} {order.date}
                  </p>
                </div>
              </div>
              <div className="text-sm sm:text-right">
                <p className="font-medium">
                  {translations.total[locale]}: {order.total.toFixed(2)}{" "}
                  {translations.egp[locale]}
                </p>
                <p className="text-green-600">{order.status[locale]}</p>
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="mb-2 font-medium">
                {translations.itemsInOrder[locale]}
              </h4>
              {order.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`mb-2 flex flex-col items-start gap-3 p-2 sm:flex-row ${item.selected ? "bg-green-50" : "border-b"}`}
                >
                  <DynamicCheckbox
                    checked={item.selected}
                    onChange={() => handleItemSelect(orderIndex, itemIndex)}
                  />
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {translations.qty[locale]}: {item.quantity}
                    </p>
                    <p className="text-sm">
                      {item.price.toFixed(2)} {translations.egp[locale]}
                    </p>

                    {item.selected && (
                      <div className="mt-2 space-y-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            {translations.reasonLabel[locale]}
                          </label>
                          <select
                            className="w-full rounded border p-2 text-sm outline-none"
                            value={item.reason?.[locale] || ""}
                            onChange={(e) =>
                              handleReasonChange(
                                orderIndex,
                                itemIndex,
                                e.target.value,
                              )
                            }
                          >
                            <option value="">
                              {translations.reasonPlaceholder[locale]}
                            </option>
                            {returnReasons.map((reason, i) => (
                              <option key={i} value={reason[locale]}>
                                {reason[locale]}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            {translations.optionLabel[locale]}
                          </label>
                          <select
                            className="w-full rounded border p-2 text-sm outline-none"
                            value={item.returnOption?.[locale] || ""}
                            onChange={(e) =>
                              handleOptionChange(
                                orderIndex,
                                itemIndex,
                                e.target.value,
                              )
                            }
                          >
                            <option value="">
                              {translations.optionPlaceholder[locale]}
                            </option>
                            {returnOptions.map((opt, i) => (
                              <option key={i} value={opt[locale]}>
                                {opt[locale]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => handleSubmitReturn(orderIndex)}
                className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                {translations.requestButton[locale]}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-white p-6 text-sm text-gray-700 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          {translations.instructionsTitle[locale]}
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          {translations.instructions.map((item, i) => (
            <li key={i}>{item[locale]}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReturnsPage;
