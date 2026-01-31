"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import QuantitySelectorRemove from "@/components/Forms/formFields/QuantitySelectorwithRemove";
import { useAppDispatch } from "@/store/hooks";
import { removeItem } from "@/store/slices/cartSlice";
import { LanguageType } from "@/util/translations";

interface CartButtonProps {
  isInCart: boolean;
  quantity: number;
  addToCart: (e: React.MouseEvent) => void;
  handleQuantityChange: (newQuantity: number) => void;
  maxStock?: number;
  productId: string;
  locale?: LanguageType;
}

const CartButton = ({
  isInCart,
  quantity,
  addToCart,
  handleQuantityChange,
  maxStock,
  productId,
  locale,
}: CartButtonProps) => {
  const [isHover, setIsHover] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const handleRemove = () => {
    dispatch(removeItem(productId));
    // Optionally show alert or toast here
  };

  if (!isMounted) {
    return (
      <button
        className={`absolute bottom-2 ${locale === "ar" ? "left-2" : "right-2"} flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-medium text-gray-700`}
      >
        <ShoppingCart size={16} />
      </button>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {isInCart ? (
        isHover ? (
          <div
            className={`absolute bottom-2 ${locale === "ar" ? "left-2" : "right-2"}`}
          >
            <QuantitySelectorRemove
              initialQuantity={quantity}
              onQuantityChange={handleQuantityChange}
              maxStock={maxStock}
              onRemove={handleRemove}
            />
          </div>
        ) : (
          <button
            onClick={addToCart}
            className={`absolute bottom-2 ${locale === "ar" ? "left-2" : "right-2"} flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition duration-150 ${
              isInCart
                ? "bg-light-primary text-white"
                : "bg-white text-gray-700 hover:bg-light-primary hover:text-white"
            }`}
          >
            {quantity > 0 && (
              <span className="absolute right-1 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-white text-[9px] text-light-primary">
                {quantity}
              </span>
            )}
            <ShoppingCart size={16} />
          </button>
        )
      ) : (
        <button
          onClick={addToCart}
          className={`absolute bottom-2 ${locale === "ar" ? "left-2" : "right-2"} flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition duration-150 ${
            isInCart
              ? "bg-light-primary text-white"
              : "bg-white text-gray-700 hover:bg-light-primary hover:text-white"
          }`}
        >
          <ShoppingCart size={16} />
        </button>
      )}
    </div>
  );
};

export default CartButton;
