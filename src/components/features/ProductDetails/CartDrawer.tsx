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
          <li className="mb-2" key={item.id}>
            <Link href={item.categorySlug ? `/${locale}/category/${item.categorySlug}/${item.slug[locale]}` : `/product-details/${item.id}`}>
              <div className="flex h-[100px] gap-2">
                <Image
                  className="h-full w-[80px] rounded object-cover"
                  src={item.image}
                  width={80}
                  height={100}
                  alt={item.title?.[locale] || "Product image"}
                />
                <div className="flex-1">
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold">
                    {item.title[locale]}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {t("addedToCart")}
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-white">
                      <Check size={10} />
                    </span>
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
