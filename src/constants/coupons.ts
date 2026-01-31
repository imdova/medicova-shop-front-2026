import { Coupon } from "@/types/cart";

export const availableCoupons: Coupon[] = [
  {
    code: "SAVE20",
    discountType: "percentage",
    discountValue: 20,
    minPurchaseAmount: 0,
    maxDiscountAmount: 50,
  },
  {
    code: "FLAT10",
    discountType: "fixed",
    discountValue: 10,
    minPurchaseAmount: 50,
  },
  {
    code: "WELCOME50",
    discountType: "fixed",
    discountValue: 50,
    minPurchaseAmount: 100,
  },
];
