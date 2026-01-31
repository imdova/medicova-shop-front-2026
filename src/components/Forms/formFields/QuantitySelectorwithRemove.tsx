"use client";
import { useState, useEffect } from "react";
import { Trash2, Plus, Minus } from "lucide-react";

type QuantitySelectorProps = {
  initialQuantity?: number;
  maxStock?: number;
  onQuantityChange?: (quantity: number) => void;
  onRemove?: () => void;
};

const QuantitySelectorRemove = ({
  initialQuantity = 1,
  maxStock = 99,
  onQuantityChange,
  onRemove,
}: QuantitySelectorProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  // Sync with external quantity changes
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleIncrement = () => {
    const newQuantity = Math.min(quantity + 1, maxStock);
    if (newQuantity !== quantity) {
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  const handleDecrementOrDelete = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    } else {
      onRemove?.();
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg bg-light-primary px-3 py-1 text-white">
      <button
        onClick={handleDecrementOrDelete}
        aria-label={quantity === 1 ? "Remove item" : "Decrease quantity"}
      >
        {quantity === 1 ? <Trash2 size={18} /> : <Minus size={18} />}
      </button>
      <span className="min-w-[20px] text-center text-sm">{quantity}</span>
      <button
        onClick={handleIncrement}
        disabled={quantity >= maxStock}
        aria-label="Increase quantity"
        className={quantity >= maxStock ? "opacity-50" : ""}
      >
        <Plus size={18} />
      </button>
    </div>
  );
};

export default QuantitySelectorRemove;
