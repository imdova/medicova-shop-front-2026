"use client";
import { ShoppingCart } from "lucide-react";
import QuantitySelector from "@/components/forms/Forms/formFields/QuantitySelector";
import { useTranslations } from "next-intl";

interface AddToCartButtonProps {
  productId: string;
  quantity: number;
  maxStock: number;
  loading: boolean;
  isInCart: boolean;
  onAddToCart: () => void;
  onQuantityChange: (quantity: number) => void;
  locale: "en" | "ar";
}

const AddToCartButton = ({
  productId,
  quantity,
  maxStock,
  loading,
  isInCart,
  onAddToCart,
  onQuantityChange,
  locale,
}: AddToCartButtonProps) => {
  const t = useTranslations("product");
  const inStock = maxStock > 0;

  return (
    <div className="mt-4 hidden items-center gap-3 md:flex">
      <QuantitySelector
        productId={productId}
        initialQuantity={quantity}
        min={1}
        max={maxStock || 99}
        onQuantityChange={onQuantityChange}
        buttonSize="md"
        showLabel={false}
        className="flex-1"
      />
      <button
        onClick={onAddToCart}
        disabled={loading || !inStock}
        aria-busy={loading}
        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-all duration-200 ${
          !inStock
            ? "cursor-not-allowed bg-gray-400"
            : loading
              ? "cursor-not-allowed bg-emerald-400"
              : "bg-primary shadow-sm hover:bg-green-700 hover:shadow-md active:scale-[0.98]"
        }`}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {t("adding")}
          </>
        ) : inStock ? (
          <>
            <ShoppingCart size={16} />
            {isInCart ? t("updateCart") : t("addToCart")}
          </>
        ) : (
          t("outOfStock")
        )}
      </button>
    </div>
  );
};

export default AddToCartButton;
