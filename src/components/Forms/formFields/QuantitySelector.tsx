"use client";

import { decreaseQuantity, increaseQuantity } from "@/store/slices/cartSlice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

type QuantitySelectorProps = {
  productId: string;
  initialQuantity?: number;
  min?: number;
  max?: number;
  className?: string;
  buttonSize?: "sm" | "md" | "lg";
  showLabel?: boolean;
};

const QuantitySelector = ({
  productId,
  initialQuantity = 1,
  min = 1,
  max = 99,
  className = "",
  buttonSize = "md",
  showLabel = false,
}: QuantitySelectorProps) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(initialQuantity);

  // Handle external quantity changes
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleQuantityChange = (newQuantity: number) => {
    // Ensure newQuantity is an integer
    const validatedQuantity = Math.max(
      min,
      Math.min(Math.floor(newQuantity), max),
    );

    if (validatedQuantity > quantity) {
      // Quantity increased
      const increaseAmount = validatedQuantity - quantity;
      dispatch(increaseQuantity({ id: productId, amount: increaseAmount }));
    } else if (validatedQuantity < quantity) {
      // Quantity decreased
      const decreaseAmount = quantity - validatedQuantity;
      dispatch(decreaseQuantity({ id: productId, amount: decreaseAmount }));
    }

    // Update local state only if the value changed
    if (validatedQuantity !== quantity) {
      setQuantity(validatedQuantity);
    }
  };

  const incrementQuantity = () => {
    handleQuantityChange(quantity + 1);
  };

  const decrementQuantity = () => {
    handleQuantityChange(quantity - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      handleQuantityChange(value);
    }
  };

  const handleBlur = () => {
    if (isNaN(quantity) || quantity < min) {
      handleQuantityChange(min);
    }
  };

  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-2",
    lg: "text-lg px-4 py-3",
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {showLabel && (
        <label
          htmlFor="quantity"
          className="mb-1 text-sm font-medium text-gray-700"
        >
          Quantity
        </label>
      )}
      <div className="flex items-center justify-between rounded-sm border border-gray-300">
        <button
          onClick={decrementQuantity}
          disabled={quantity <= min}
          className={`${sizeClasses[buttonSize]} font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50`}
          aria-label="Decrease quantity"
        >
          -
        </button>

        <input
          type="number"
          min={min}
          max={max}
          value={quantity}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`${sizeClasses[buttonSize]} w-12 text-center font-medium [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
          aria-label="Product quantity"
        />

        <button
          onClick={incrementQuantity}
          disabled={quantity >= max}
          className={`${sizeClasses[buttonSize]} font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50`}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default QuantitySelector;
