import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { calculateShippingFee } from "@/util";
import { DestinationKey } from "@/types";
import { LanguageType } from "@/util/translations";

interface ProductFee {
  productId: string;
  shippingMethod: string;
  fee: number;
  quantity: number;
}

interface CartCalculations {
  productFees: ProductFee[];
  totalShippingFee: number;
  subtotal: number;
  paymentFee: number;
  total: number;
  productsCount: number;
  getItemShippingFeeDisplay: (productId: string, locale: LanguageType) => string;
}

export function useCartCalculations(
  destinationCountry: DestinationKey = "EG",
  paymentMethod: string = "standard",
  discountAmount: number = 0,
  city?: string,
): CartCalculations {
  const { products: cartItems } = useAppSelector((state) => state.cart);

  const productFees = useMemo(() => {
    return cartItems.map((item) => {
      const shippingMethod = item.shippingMethod || "standard";
      const itemWeight = item.weightKg && item.weightKg > 0 ? item.weightKg : 1;
      const itemPrice = item.price && item.price > 0 ? item.price : 0;
      const quantity = item.quantity || 1;

      const feeInput = {
        shippingMethod,
        destination: destinationCountry,
        city,
        cartTotal: itemPrice * quantity,
        weightKg: itemWeight * quantity,
        shippingCostInsideCairo: item.shippingCostInsideCairo,
        shippingCostRegion1: item.shippingCostRegion1,
        shippingCostRegion2: item.shippingCostRegion2,
      };

      return {
        productId: item.id,
        shippingMethod: typeof shippingMethod === "string" ? shippingMethod : "standard",
        fee: calculateShippingFee(feeInput),
        quantity,
      };
    });
  }, [cartItems, destinationCountry, city]);

  const totalShippingFee = useMemo(
    () => productFees.reduce((total, item) => total + item.fee, 0),
    [productFees],
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0,
      ),
    [cartItems],
  );

  const paymentFee = paymentMethod === "cod" ? 9.0 : 0;
  const total = subtotal + totalShippingFee + paymentFee - discountAmount;
  const productsCount = cartItems.length;

  const getItemShippingFeeDisplay = (
    productId: string,
    locale: LanguageType,
  ): string => {
    const itemFee =
      productFees.find((item) => item.productId === productId)?.fee || 0;

    if (itemFee === 0) {
      return locale === "ar" ? "توصيل مجاني" : "Free Delivery";
    }

    return locale === "ar"
      ? `${itemFee.toFixed(2)} جنيه`
      : `${itemFee.toFixed(2)} EGP`;
  };

  return {
    productFees,
    totalShippingFee,
    subtotal,
    paymentFee,
    total,
    productsCount,
    getItemShippingFeeDisplay,
  };
}
