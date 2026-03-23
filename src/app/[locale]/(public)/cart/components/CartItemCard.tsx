"use client";
import Link from "next/link";
import { Trash2, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import FallbackImage from "@/components/shared/FallbackImage";
import QuantitySelector from "@/components/forms/Forms/formFields/QuantitySelector";
import { getExecuteDateFormatted } from "@/util";
import { useAppLocale } from "@/hooks/useAppLocale";
import { CartItem } from "@/types/cart";

interface CartItemCardProps {
  item: CartItem;
  shippingFeeDisplay: string;
  onRemove: (id: string) => void;
}

export default function CartItemCard({
  item,
  shippingFeeDisplay,
  onRemove,
}: CartItemCardProps) {
  const locale = useAppLocale();
  const t = useTranslations();
  const isAr = locale === "ar";

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="p-4">
        <div className="flex gap-4">
          <Link
            href={item.categorySlug ? `/${locale}/category/${item.categorySlug}/${item.slug[locale]}` : `/product-details/${item.id}`}
            className="relative h-[140px] w-[120px] shrink-0 overflow-hidden rounded-xl bg-gray-50"
          >
            <FallbackImage
              className="h-full w-full object-cover"
              src={item.image ?? "/images/placeholder.jpg"}
              fill
              sizes="120px"
              alt={item.title[locale] ?? "Product image"}
            />
          </Link>
          <div className="flex-1">
            <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <span className="text-xs text-secondary">
                  {item.brand?.name[locale]}
                </span>
                <h2 className="text-sm font-semibold text-gray-700">
                  {item.title[locale]}
                </h2>
              </div>
              <div>
                <p className="text-md mt-2 flex items-center gap-1 font-bold">
                  {item.price}
                  <span>{t("common.currency")}</span>
                </p>

                <div className="flex items-center gap-2">
                  <span className="ml-2 flex items-center gap-2 text-xs text-gray-500 line-through">
                    <span>{item.del_price?.toLocaleString()}</span>
                    {t("common.currency")}{" "}
                  </span>
                  <span className="flex items-center gap-2 text-xs font-semibold text-primary">
                    {item.del_price
                      ? `${((item.price / item.del_price) * 100).toFixed(0)}% OFF`
                      : ""}
                  </span>
                </div>
              </div>
            </div>
            <div className="my-2 flex flex-col justify-between gap-2 md:flex-row md:items-center">
              {item.deliveryTime && (
                <p className="whitespace-pre-line text-xs text-gray-600">
                  {t("cart.getIt")}{" "}
                  <span className="text-xs text-primary">
                    {getExecuteDateFormatted(
                      item.deliveryTime[locale] ?? "",
                      "EEE, MMM d",
                      locale,
                    )}
                  </span>
                </p>
              )}
              {item.shippingMethod?.[locale] && (
                <div className="flex items-center text-xs font-semibold">
                  <span className="bg-light-primary rounded px-2 py-1 text-white">
                    {item.shippingMethod?.[locale]}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Truck size={17} className="text-primary" />
              <span className="text-xs font-semibold">
                {shippingFeeDisplay}
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              {t("cart.soldBy")}{" "}
              <span className="text-xs font-semibold text-gray-700">
                {item.sellers?.name}
              </span>
            </p>

            {item.unitSelections && item.unitSelections.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-gray-50 pt-2">
                {item.unitSelections.map((selection: any, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {isAr ? `الوحدة ${idx + 1}:` : `Unit ${idx + 1}:`}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selection).map(([key, value]) => {
                        if (!value) return null;
                        
                        // Check if it's a color (either key is 'color' or value starts with #)
                        const isColor = key.toLowerCase().includes("color") || (typeof value === "string" && value.startsWith("#"));
                        
                        return (
                          <div 
                            key={key} 
                            className="flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-600 border border-gray-100"
                          >
                            {isColor && (
                              <span
                                className="h-2 w-2 rounded-full border border-gray-200"
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
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 border-t border-gray-100 pt-4">
          <QuantitySelector
            productId={item?.id ?? ""}
            initialQuantity={item.quantity}
            min={1}
            max={item?.stock || 99}
            buttonSize="md"
            showLabel={false}
          />
          <button
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={14} />
            {t("common.remove")}
          </button>
        </div>
      </div>
    </div>
  );
}
