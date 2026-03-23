"use client";

import { ShoppingCart } from "lucide-react";
import QuantitySelector from "@/components/forms/Forms/formFields/QuantitySelector";
import { Product } from "@/types/product";
import { useAppSelector } from "@/store/hooks";
import { LanguageType } from "@/util/translations";

type MobileCartNavbarProps = {
  product: Product;
  quantity: number;
  setQuantity: (quantity: number) => void;
  handleAddToCart: () => void;
  loading: boolean;
  locale?: LanguageType;
};

// Translations

import { useTranslations } from "next-intl";

const MobileCartNavbar: React.FC<MobileCartNavbarProps> = ({
  product,
  quantity,
  setQuantity,
  handleAddToCart,
  loading,
}) => {
  const t = useTranslations("product");
  const { products: productData } = useAppSelector((state) => state.cart);
  const isInCart = productData.some((item) => item.id === product?.id);

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 block border-t bg-white shadow-lg md:hidden">
      <div className="flex items-center justify-between gap-3 p-4">
        <QuantitySelector
          productId={product?.id ?? ""}
          initialQuantity={quantity}
          min={1}
          max={product?.stock || 99}
          onQuantityChange={setQuantity}
          buttonSize="md"
          showLabel={false}
          className="flex-1"
        />

        <button
          onClick={handleAddToCart}
          disabled={loading || !product?.stock}
          className={`ml-4 flex flex-1 items-center justify-center gap-2 rounded-sm px-4 py-3 text-xs font-medium text-white transition-colors ${
            loading
              ? "cursor-not-allowed bg-green-400"
              : "bg-primary hover:bg-green-800"
          } ${!product?.stock ? "cursor-not-allowed bg-gray-400" : ""}`}
        >
          {loading ? (
            t("adding")
          ) : product?.stock ? (
            <>
              <ShoppingCart size={15} />
              {isInCart ? t("updateCart") : t("addToCart")}
            </>
          ) : (
            t("outOfStock")
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileCartNavbar;
