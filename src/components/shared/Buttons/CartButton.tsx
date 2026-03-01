"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { LanguageType } from "@/util/translations";
import { useLocale } from "next-intl";

interface CartButtonProps {
  isInCart: boolean;
  quantity: number;
  addToCart: (e: React.MouseEvent) => void;
  handleQuantityChange: (newQuantity: number) => void;
  maxStock?: number;
  productId: string;
}

const CartButton = ({
  isInCart,
  quantity,
  addToCart,
  handleQuantityChange,
  maxStock,
  productId,
}: CartButtonProps) => {
  const locale = useLocale() as LanguageType;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button
        className={`absolute bottom-2 ${locale === "ar" ? "left-2" : "right-2"} flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-medium text-gray-700 opacity-50`}
        disabled
      >
        <ShoppingCart size={16} />
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={addToCart}
        className={`absolute bottom-2 ${locale === "ar" ? "left-2" : "right-2"} flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
          isInCart
            ? "shadow-primary/20 bg-primary text-white shadow-md ring-1 ring-primary"
            : "hover:ring-primary/40 bg-white text-gray-500 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 hover:text-primary hover:shadow-md"
        }`}
      >
        {isInCart && quantity > 0 && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[9px] font-bold text-primary shadow-sm ring-1 ring-gray-100">
            {quantity}
          </span>
        )}
        <ShoppingCart size={16} />
      </button>
    </div>
  );
};

export default CartButton;
