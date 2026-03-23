import { Brand, LiquidSizeType, NumericSizeType, SizeType } from ".";
import { LocalizedTitle } from "./language";
import { MultilingualColor, Seller, shippingMethod } from "./product";

export type CartFormValues = {
  payment: string;
  name: string;
  cardNumber: string;
  expirationDate: string;
  cvc: string;
  saveInfo: boolean;
};

export interface UnitSelection {
  size?: SizeType | NumericSizeType | LiquidSizeType;
  color?: string;
}

export interface CartItem {
  id: string;
  image: string;
  title: LocalizedTitle;
  slug: LocalizedTitle;
  categorySlug?: string;
  price: number;
  del_price?: number;
  description: string;
  deliveryTime?: LocalizedTitle;
  sellers?: Seller;
  shipping_fee: number;
  size?: SizeType | NumericSizeType | LiquidSizeType;
  color?: string;
  quantity: number;
  brand?: Brand;
  stock?: number;
  shippingMethod: shippingMethod;
  weightKg: number;
  totalPrice: number;
  unitSelections?: UnitSelection[];
  shippingCostInsideCairo?: number;
  shippingCostRegion1?: number;
  shippingCostRegion2?: number;
}
export interface WishlistItem {
  id: string;
  image: string;
  title: LocalizedTitle;
  slug: LocalizedTitle;
  categorySlug?: string;
  price: number;
  del_price?: number;
  description: string;
  deliveryTime?: string;
  sellers?: Seller;
  shipping_fee: number;
  size?: SizeType | NumericSizeType | LiquidSizeType;
  color?: MultilingualColor;
  brand?: Brand;
  stock?: number;
  shippingMethod: shippingMethod;
  weightKg: number;
  addedBy?: string;
}

export type Coupon = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number; // Optional
};
