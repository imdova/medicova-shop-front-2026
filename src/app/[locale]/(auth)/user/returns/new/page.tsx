"use client";

import CustomAlert from "@/components/shared/CustomAlert";
import DynamicCheckbox from "@/components/shared/DynamicCheckbox";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useSession } from "next-auth/react";
import { getCustomerOrders, requestReturn } from "@/services/orderService";
import { getProductById, mapApiProductToProduct } from "@/services/productService";
import { LocalizedTitle } from "@/types/language";

type OrderItem = {
  name: string;
  image: string;
  price: number;
  quantity: number;
  reason: LocalizedTitle | null;
  returnOption: LocalizedTitle | null;
  selected: boolean;
  variants?: Array<{ label: string; value: string }>;
  productId: string;
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
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info" | "cart" | "wishlist";
  } | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ensureAbsoluteUrl = (url: any) => {
    if (!url || typeof url !== "string") return "/images/placeholder.png";
    if (url.startsWith("http")) return url;
    const apiBaseUrl = "https://shop-api.medicova.net";
    return `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const apiOrdersRaw = await getCustomerOrders(token);

      // Filter orders: Only show paid and delivered orders
      const apiOrders = apiOrdersRaw.filter(
        (o: any) =>
          o.paymentStatus === "paid" && o.status === "delivered",
      );

      const transformed: Order[] = await Promise.all(
        apiOrders.map(async (o: any) => {
          const sourceItems =
            o.items && o.items.length > 0 ? o.items : o.units || [];

          const itemsWithDetails = await Promise.all(
            sourceItems.map(async (u: any) => {
              const productId =
                typeof u.productId === "object" ? u.productId?._id : u.productId;

              let productDetails = null;
              if (productId && typeof productId === "string") {
                try {
                  // Attempt to fetch full product details for better name/image
                  const fullProd = await getProductById(productId, token);
                  if (fullProd) {
                    productDetails = mapApiProductToProduct(fullProd);
                  }
                } catch (pErr) {
                  console.warn(
                    "Failed to fetch product details for item:",
                    productId,
                    pErr,
                  );
                }
              }

              // Mapping variants
              const variantMap = new Map<string, string>();
              const variantKeys = [
                "size",
                "color",
                "Color",
                "Size",
                "Tt",
                "Strength",
              ];
              variantKeys.forEach((key) => {
                const val = u[key];
                if (val && val !== "Default" && typeof val === "string") {
                  let label = key;
                  if (key === "size") label = isAr ? "المقاس" : "Size";
                  if (key === "color") label = isAr ? "اللون" : "Color";
                  variantMap.set(label, val);
                }
              });

              const displayVariants = Array.from(variantMap.entries()).map(
                ([label, value]) => ({ label, value }),
              );

              return {
                name:
                  (isAr
                    ? productDetails?.title?.ar ||
                      u.productNameAr ||
                      u.nameAr ||
                      u.productName ||
                      u.name
                    : productDetails?.title?.en ||
                      u.productName ||
                      u.nameEn ||
                      u.name ||
                      u.displayName) || (isAr ? "منتج" : "Product"),
                image: ensureAbsoluteUrl(
                  productDetails?.images?.[0] ||
                    u.productImage ||
                    u.image ||
                    u.displayImage ||
                    u.product_image,
                ),
                price: u.unitPrice || u.price || u.unit_price || 0,
                quantity: u.quantity || 1,
                reason: null,
                returnOption: null,
                selected: false,
                variants: displayVariants,
                productId: productId,
              };
            }),
          );

          return {
            id: o._id || o.id,
            date: o.createdAt
              ? new Date(o.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString(),
            total: o.total || o.totalPrice || 0,
            status: {
              en:
                o.status === "delivered" ? "Delivered" : o.status || "Delivered",
              ar:
                o.status === "delivered"
                  ? "تم التوصيل"
                  : o.status || "تم التوصيل",
            },
            selected: false,
            items: itemsWithDetails,
          };
        }),
      );

      setOrders(transformed);
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token, isAr]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderSelect = (orderIndex: number) => {
    const updatedOrders = [...orders];
    const order = updatedOrders[orderIndex];
    order.selected = !order.selected;
    // When order is selected, all items are implicitly selected for the return request
    order.items.forEach((i) => (i.selected = order.selected));
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

  const handleSubmitReturn = async (orderIndex: number) => {
    const order = orders[orderIndex];
    if (!order.selected) {
      return showAlert(
        locale === "ar"
          ? "يرجى تحديد الطلب أولاً"
          : "Please select the order first",
        "info",
      );
    }

    const selectedItems = order.items; // All items in the selected order

    try {
      // API requires separate call for each item
      const returnPromises = selectedItems.map((item) => {
        const payload = {
          orderId: order.id,
          productId: item.productId,
          description: isAr ? "طلب إرجاع" : "Return request",
        };
        return requestReturn(payload, token);
      });

      await Promise.all(returnPromises);

      showAlert(
        locale === "ar"
          ? `تم إرسال طلب الإرجاع للطلب ${order.id}`
          : `Return request submitted for order ${order.id}`,
        "success",
      );

      // Reset selection
      const updatedOrders = [...orders];
      updatedOrders[orderIndex].selected = false;
      updatedOrders[orderIndex].items.forEach((item) => {
        item.reason = null;
        item.returnOption = null;
        item.selected = false;
      });
      setOrders(updatedOrders);
    } catch (err: any) {
      showAlert(
        locale === "ar"
          ? `فشل في إرسال طلب الإرجاع: ${err.message}`
          : `Failed to submit return request: ${err.message}`,
        "error",
      );
    }
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

        {loading && (
          <div className="flex justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {locale === "ar"
              ? "لا توجد طلبات متاحة للإرجاع"
              : "No orders available for return"}
          </div>
        )}

        {!loading &&
          orders.map((order, orderIndex) => (
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
                    className={`mb-2 flex flex-col items-start gap-3 p-2 sm:flex-row ${order.selected ? "bg-green-50" : "border-b"}`}
                  >
                    <Image
                      src={item.image}
                      alt={item.name || (isAr ? "منتج" : "Product")}
                      width={80}
                      height={80}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.variants && item.variants.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {item.variants.map((v, i) => (
                            <span
                              key={i}
                              className="inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                            >
                              {v.label}: {v.value}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-600">
                        {translations.qty[locale]}: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-right">
                <button
                  onClick={() => handleSubmitReturn(orderIndex)}
                  className={`rounded px-4 py-2 text-sm text-white ${order.selected ? "bg-green-600 hover:bg-green-700" : "cursor-not-allowed bg-gray-400"}`}
                  disabled={!order.selected}
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
