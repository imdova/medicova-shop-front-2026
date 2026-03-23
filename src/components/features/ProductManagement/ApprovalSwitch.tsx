"use client";

import { ApiProduct } from "@/services/productService";

interface ApprovalSwitchProps {
  product: ApiProduct;
  isDisabled: boolean;
  onToggle: (product: ApiProduct) => void;
}

export function ApprovalSwitch({
  product,
  isDisabled,
  onToggle,
}: ApprovalSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={product.approved}
      onClick={() => onToggle(product)}
      disabled={isDisabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 disabled:opacity-50 ${
        product.approved
          ? "border-emerald-500 bg-emerald-500"
          : "border-slate-200 bg-slate-100"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
          product.approved ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
