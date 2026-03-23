"use client";
import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { Drawer } from "@/components/layouts/Drawer";
import { CartItem } from "@/types/cart";
import { useTranslations } from "next-intl";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalPrice: number;
  onCheckout: () => void;
  locale: "en" | "ar";
}

const CartDrawer = ({
  isOpen,
  onClose,
  cartItems,
  totalPrice,
  onCheckout,
  locale,
}: CartDrawerProps) => {
  const t = useTranslations("product");
  const cartT = useTranslations("cart");

  return (
    <Drawer
      mobile={false}
      hiddenCloseBtn
      position="right"
      isOpen={isOpen}
      onClose={onClose}
    >
      <ul className="max-h-[500px] max-w-[270px] overflow-y-auto">
        {cartItems.map((item) => (
          <li className="mb-4 border-b border-gray-50 pb-4 last:border-0" key={item.id}>
            <Link href={item.categorySlug ? `/${locale}/category/${item.categorySlug}/${item.slug[locale]}` : `/product-details/${item.id}`}>
              <div className="flex h-auto gap-3">
                <div className="relative h-[90px] w-[70px] flex-shrink-0">
                  <Image
                    className="h-full w-full rounded object-cover"
                    src={item.image}
                    fill
                    sizes="70px"
                    alt={item.title?.[locale] || "Product image"}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 line-clamp-2 text-xs font-semibold text-gray-800">
                    {item.title[locale]}
                  </h3>
                  
                  {item.unitSelections && item.unitSelections.length > 0 && (
                    <div className="mb-2 max-h-[100px] overflow-y-auto space-y-1 pr-1">
                      {item.unitSelections.map((selection: any, idx) => (
                        <div key={idx} className="flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] text-gray-400 font-bold uppercase">U{idx+1}:</span>
                          {Object.entries(selection).map(([key, value]) => {
                            if (!value) return null;
                            const isColor = key.toLowerCase().includes("color") || (typeof value === "string" && value.startsWith("#"));
                            return (
                              <div key={key} className="flex items-center gap-1 rounded bg-gray-50 border border-gray-100 px-1 py-0.5 text-[9px] font-bold text-gray-500">
                                {isColor && (
                                  <span
                                    className="h-1.5 w-1.5 rounded-full border border-gray-200"
                                    style={{ backgroundColor: value as string }}
                                  />
                                )}
                                <span>{typeof value === "object" ? (value as any).en : String(value)}</span>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[10px] font-medium text-primary">
                    <Check size={10} strokeWidth={3} />
                    {t("addedToCart")}
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between border-t border-gray-100 pt-3 font-semibold text-gray-700">
        <span className="text-sm">{t("cartTotal")}</span>
        <span className="text-sm">
          {cartT("total")} {totalPrice.toLocaleString()}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={onCheckout}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold uppercase text-white transition-colors hover:bg-green-700"
        >
          {cartT("checkout")}
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold uppercase text-primary transition-colors hover:bg-gray-50"
        >
          {cartT("continueShopping")}
        </button>
      </div>
    </Drawer>
  );
};

export default CartDrawer;
