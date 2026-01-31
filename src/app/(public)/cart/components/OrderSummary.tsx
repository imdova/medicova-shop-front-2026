import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calculateShippingFee } from "@/util";
import { CartItem } from "@/types/cart";
import { DestinationKey } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { shippingMethod } from "@/types/product";

interface OrderSummaryProps {
  appliedCoupon: string;
  setAppliedCoupon: (value: string) => void;
  applyCoupon: () => void;
  couponError: string;
  productsCount: number;
  totalPrice: number;
  discountAmount: number;
  onCheckout: () => void;
  productCart: CartItem[];
  destinationCountry?: DestinationKey;
  shippingFee?: number;
  paymentFee?: number;
  subtotal?: number;
}

interface ShippingGroup {
  fee: number;
  count: number;
  method: shippingMethod;
}

const OrderSummary = ({
  appliedCoupon,
  setAppliedCoupon,
  applyCoupon,
  couponError,
  productsCount,
  totalPrice,
  discountAmount,
  onCheckout,
  productCart,
  destinationCountry = "EG",
  shippingFee = 0,
  paymentFee = 0,
  subtotal = 0,
}: OrderSummaryProps) => {
  const { isArabic, direction } = useLanguage();

  // Calculate shipping fees if not provided
  const calculatedShipping = productCart.map((item) => {
    const shippingMethod = (item.shippingMethod ||
      "standard") as shippingMethod;
    const itemWeight = item.weightKg && item.weightKg > 0 ? item.weightKg : 1;
    const itemPrice = item.price && item.price > 0 ? item.price : 0;

    return {
      productId: item.id,
      shippingMethod,
      fee: calculateShippingFee({
        shippingMethod,
        destination: destinationCountry,
        cartTotal: itemPrice * item.quantity,
        weightKg: itemWeight * item.quantity,
      }),
      quantity: item.quantity,
    };
  });

  // Use provided shippingFee or calculate it
  const totalShipping =
    shippingFee > 0
      ? shippingFee
      : calculatedShipping.reduce((total, item) => total + item.fee, 0);

  // Group shipping fees by method
  const shippingGroups = calculatedShipping.reduce(
    (groups: Record<string, ShippingGroup>, item) => {
      // Changed key to 'string' for object key access
      // You need a way to get a unique string representation of the shipping method
      // to use as a key in the `groups` object.
      // For example, using the English name:
      const methodKey = item.shippingMethod.en;

      if (!groups[methodKey]) {
        groups[methodKey] = {
          fee: 0,
          count: 0,
          method: item.shippingMethod, // Store the full method object
        };
      }
      groups[methodKey].fee += item.fee;
      groups[methodKey].count += item.quantity;
      return groups;
    },
    {} as Record<string, ShippingGroup>, // Initial accumulator with string keys
  );

  // Shipping method translations
  const shippingMethodTranslations = {
    standard: isArabic ? "التوصيل العادي" : "Standard Shipping",
    express: isArabic ? "التوصيل السريع" : "Express Shipping",
    free: isArabic ? "توصيل مجاني" : "Free Shipping",
  };

  // Calculate final total
  const finalSubtotal = subtotal > 0 ? subtotal : totalPrice;
  const orderTotal =
    finalSubtotal - discountAmount + totalShipping + paymentFee;

  return (
    <div
      className="sticky top-4 col-span-1 h-fit border border-gray-300 p-3 lg:col-span-3"
      dir={direction}
    >
      <h2 className="mb-4 text-xl font-bold">
        {isArabic ? "ملخص الطلب" : "Order Summary"}
      </h2>

      {/* Coupon section */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex w-full">
            <input
              type="text"
              value={appliedCoupon}
              onChange={(e) => setAppliedCoupon(e.target.value)}
              className={`w-full border border-gray-300 px-3 py-2 text-sm outline-none ${
                direction === "rtl" ? "rounded-r" : "rounded-l"
              }`}
              placeholder={isArabic ? "أدخل الكوبون" : "Enter coupon"}
              aria-label={isArabic ? "كود الكوبون" : "Coupon code"}
            />
            <button
              onClick={applyCoupon}
              className={`bg-primary px-3 py-1 text-sm text-white transition hover:bg-green-800 ${
                direction === "rtl" ? "rounded-l" : "rounded-r"
              }`}
              aria-label={isArabic ? "تطبيق الكوبون" : "Apply coupon"}
            >
              {isArabic ? "تطبيق" : "APPLY"}
            </button>
          </div>
        </div>
        {couponError && (
          <p className="mb-2 text-sm text-red-500">{couponError}</p>
        )}

        <Link
          href="#offers"
          className="flex cursor-pointer items-center justify-between rounded-md border bg-white p-2 text-sm text-primary"
          aria-label={isArabic ? "عرض العروض" : "View offers"}
        >
          <span>
            {isArabic ? "عرض العروض المتاحة" : "View Available Offers"}
          </span>
          {isArabic ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </Link>
      </div>

      {/* Order breakdown */}
      <div className="border-t border-gray-200 pt-4">
        <div className="mb-2 flex justify-between">
          <span className="text-sm text-secondary">
            {isArabic ? "المجموع الفرعي" : "Subtotal"} ({productsCount}{" "}
            {isArabic ? "منتج" : "Item"}
            {productsCount !== 1 ? (isArabic ? "" : "s") : ""})
          </span>
          <span className="text-sm text-gray-700">
            {finalSubtotal.toFixed(2)} {isArabic ? "جنيه" : "EGP"}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="mb-2 flex justify-between">
            <span className="text-sm text-secondary">
              {isArabic ? "تخفيض" : "Discount"} ({appliedCoupon.toUpperCase()})
            </span>
            <span className="text-sm text-primary">
              - {discountAmount.toFixed(2)} {isArabic ? "جنيه" : "EGP"}
            </span>
          </div>
        )}

        {/* Shipping fees section */}
        {Object.values(shippingGroups).length > 0 && (
          <div className="mb-2">
            {Object.values(shippingGroups).map((group, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-sm text-secondary">
                  {shippingMethodTranslations[group.method["en"]]}
                  {group.count > 1 &&
                    ` (${group.count} ${isArabic ? "عناصر" : "items"})`}
                </span>
                <span className="text-sm font-bold">
                  {group.fee.toFixed(2)} {isArabic ? "جنيه" : "EGP"}
                </span>
              </div>
            ))}

            <div className="mt-2 flex justify-between">
              <span className="text-sm font-bold text-secondary">
                {isArabic ? "إجمالي الشحن" : "Total Shipping"}
              </span>
              <span className="text-sm font-bold">
                {totalShipping.toFixed(2)} {isArabic ? "جنيه" : "EGP"}
              </span>
            </div>
          </div>
        )}

        {paymentFee > 0 && (
          <div className="mb-2 flex justify-between">
            <span className="text-sm text-secondary">
              {isArabic ? "رسوم الدفع" : "Payment Fee"}
            </span>
            <span className="text-sm text-gray-700">
              {paymentFee.toFixed(2)} {isArabic ? "جنيه" : "EGP"}
            </span>
          </div>
        )}
      </div>

      {/* Order total */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-sm text-gray-700">
            {isArabic ? "الإجمالي" : "Total"}{" "}
            <span className="text-xs text-secondary">
              {isArabic ? "(شامل الضريبة)" : "(inclusive of VAT)"}
            </span>
          </span>
          <span className="text-gray-700">
            {orderTotal.toFixed(2)} {isArabic ? "جنيه" : "EGP"}
          </span>
        </div>
      </div>

      {/* Payment plans */}
      <div className="mt-4 text-xs text-gray-700">
        <div>
          {isArabic
            ? "خطط الدفع الشهرية بدءًا من 500 جنيه."
            : "Monthly payment plans from EGP 500."}{" "}
          <Link
            href="#payment-plans"
            className="text-primary underline"
            aria-label={isArabic ? "تفاصيل الدفع" : "Payment details"}
          >
            {isArabic ? "عرض التفاصيل" : "View more details"}
          </Link>
        </div>
      </div>

      {/* Checkout button */}
      <button
        onClick={onCheckout}
        className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-bold text-white transition hover:bg-green-700"
        aria-label={isArabic ? "الدفع" : "Checkout"}
      >
        {isArabic ? "الدفع" : "CHECKOUT"}
      </button>
    </div>
  );
};

export default OrderSummary;
