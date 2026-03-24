"use client";

import Image from "next/image";
import { Package, Truck } from "lucide-react";
import { getExecuteDateFormatted } from "@/util";
import { LanguageType } from "@/util/translations";

interface CheckoutItemsProps {
  productData: any[];
  productShippingFees: any[];
  locale: LanguageType;
}

export default function CheckoutItems({
  productData,
  productShippingFees,
  locale,
}: CheckoutItemsProps) {
  const isAr = locale === "ar";

  if (productData.length === 0) {
    return (
      <div className="mb-8 rounded-2xl border border-dashed border-gray-200 bg-white/50 p-12 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <p className="font-medium text-gray-500">
          {isAr ? "سلة التسوق فارغة" : "Your cart is empty"}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="mb-6 flex items-center gap-2 px-1 text-xl font-bold text-gray-800">
        <span className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full text-sm text-primary">
          2
        </span>
        {isAr ? "مراجعة الطلب" : "Review Order"}
      </h2>

      <div className="space-y-4">
        {productData.map((item, index) => {
          const shippingInfo = productShippingFees.find(
            (fee) => fee.productId === item.id,
          );

          return (
            <div
              key={`${item.id}-${item.size}-${item.color}-${index}`}
              className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/70 p-5 shadow-sm backdrop-blur-md transition-all hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="text-sm font-bold text-gray-900">
                  {isAr
                    ? `الشحنة ${index + 1} من ${productData.length}`
                    : `Shipment ${index + 1} of ${productData.length}`}
                </div>
                <div className="bg-secondary/5 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-tight text-secondary">
                  <Package className="h-3 w-3" />
                  {item.quantity} {isAr ? "عنصر" : "item"}
                </div>
              </div>

              <div className="flex gap-5">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                  <Image
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    src={item.image}
                    alt={item.title[locale] ?? "product image"}
                    width={150}
                    height={150}
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-primary/70 text-[10px] font-bold uppercase tracking-widest">
                    {item.brand?.name[locale] ||
                      (isAr ? "ماركة عامة" : "Generic Brand")}
                  </p>
                  <h3 className="truncate pr-4 text-sm font-bold text-gray-800 md:text-base">
                    {item.title[locale]}
                  </h3>
                  
                  {item.unitSelections && item.unitSelections.length > 0 && (
                    <div className="mt-2 space-y-1.5 border-t border-gray-50 pt-2">
                      {item.unitSelections.map((selection: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">
                            {isAr ? `الوحدة ${idx + 1}:` : `Unit ${idx + 1}:`}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(selection).map(([key, value]) => {
                              if (!value) return null;
                              const isColor = key.toLowerCase().includes("color") || (typeof value === "string" && value.startsWith("#"));
                              return (
                                <div key={key} className="flex items-center gap-1 rounded-md bg-gray-50 border border-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-600">
                                  {isColor && (
                                    <span
                                      className="h-1.5 w-1.5 rounded-full border border-gray-200"
                                      style={{ backgroundColor: value as string }}
                                    />
                                  )}
                                  <span className="opacity-60">{key}:</span>
                                  <span>{typeof value === "object" ? (value as any).en : String(value)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                    <p className="text-sm font-black text-primary">
                      {isAr ? "جنيه" : "EGP"} {item.price.toFixed(2)}
                    </p>

                    {shippingInfo && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                        <Truck className="h-3 w-3" />
                        {isAr ? "الشحن:" : "Shipping:"}{" "}
                        {shippingInfo.fee === 0
                          ? (
                            <span className="text-[9px] italic text-gray-400">
                              {isAr ? "يحدد بعد العنوان" : "Calculated after address"}
                            </span>
                          )
                          : `${shippingInfo.fee.toFixed(2)} ${isAr ? "جنيه" : "EGP"}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Truck className="h-4 w-4 text-primary" />
                </div>
                <p className="text-[11px] font-bold text-gray-600 md:text-xs">
                  {isAr ? "موعد التوصيل المتوقع:" : "Estimated Delivery:"}{" "}
                  <span className="text-primary">
                    {getExecuteDateFormatted(
                      item.deliveryTime?.[locale] ?? "",
                      "EEE, MMM d",
                      locale,
                    )}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
