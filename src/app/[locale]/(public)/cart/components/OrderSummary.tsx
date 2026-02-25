import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calculateShippingFee } from "@/util";
import { CartItem } from "@/types/cart";
import { DestinationKey } from "@/types";
import { useAppLocale } from "@/hooks/useAppLocale";
import { shippingMethod } from "@/types/product";
import { useTranslations } from "next-intl";

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
  const locale = useAppLocale();
  const t = useTranslations();
  const isArabic = locale === "ar";
  const direction = locale === "ar" ? "rtl" : "ltr";

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
      className="sticky top-4 col-span-1 h-fit overflow-hidden rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-gray-100 lg:col-span-3"
      dir={direction}
    >
      <h2 className="mb-5 text-xl font-bold text-gray-800">
        {t("cart.orderSummary")}
      </h2>

      {/* Coupon section */}
      <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex w-full">
            <input
              type="text"
              value={appliedCoupon}
              onChange={(e) => setAppliedCoupon(e.target.value)}
              className={`focus:border-primary/30 w-full border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm outline-none transition-colors focus:bg-white ${
                direction === "rtl" ? "rounded-r-xl" : "rounded-l-xl"
              }`}
              placeholder={t("cart.enterCoupon")}
              aria-label={t("cart.couponCode")}
            />
            <button
              onClick={applyCoupon}
              className={`bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-700 ${
                direction === "rtl" ? "rounded-l-xl" : "rounded-r-xl"
              }`}
              aria-label={t("cart.applyCoupon")}
            >
              {t("cart.apply")}
            </button>
          </div>
        </div>
        {couponError && (
          <p className="mb-2 text-sm text-red-500">{couponError}</p>
        )}

        <Link
          href="#offers"
          className="hover:bg-primary/5 flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-sm font-medium text-primary transition-colors"
          aria-label={t("cart.viewOffers")}
        >
          <span>{t("cart.viewAvailableOffers")}</span>
          {isArabic ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </Link>
      </div>

      {/* Order breakdown */}
      <div className="border-t border-gray-100 pt-4">
        <div className="mb-2 flex justify-between">
          <span className="text-sm text-gray-500">
            {t("cart.subtotal")} ({productsCount} {t("cart.items")})
          </span>
          <span className="text-sm font-medium text-gray-700">
            {finalSubtotal.toFixed(2)} {t("common.currency")}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="mb-2 flex justify-between">
            <span className="text-sm text-gray-500">
              {t("cart.discount")} ({appliedCoupon.toUpperCase()})
            </span>
            <span className="text-sm font-semibold text-primary">
              - {discountAmount.toFixed(2)} {t("common.currency")}
            </span>
          </div>
        )}

        {/* Shipping fees section */}
        {Object.values(shippingGroups).length > 0 && (
          <div className="mb-2">
            {Object.values(shippingGroups).map((group, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-sm text-gray-500">
                  {shippingMethodTranslations[group.method["en"]]}
                  {group.count > 1 && ` (${group.count} ${t("cart.items")})`}
                </span>
                <span className="text-sm font-medium">
                  {group.fee.toFixed(2)} {t("common.currency")}
                </span>
              </div>
            ))}

            <div className="mt-2 flex justify-between">
              <span className="text-sm font-bold text-gray-600">
                {t("cart.totalShipping")}
              </span>
              <span className="text-sm font-bold">
                {totalShipping.toFixed(2)} {t("common.currency")}
              </span>
            </div>
          </div>
        )}

        {paymentFee > 0 && (
          <div className="mb-2 flex justify-between">
            <span className="text-sm text-gray-500">
              {t("cart.paymentFee")}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {paymentFee.toFixed(2)} {t("common.currency")}
            </span>
          </div>
        )}
      </div>

      {/* Order total */}
      <div className="mt-5 border-t border-gray-100 pt-4">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-sm text-gray-700">
            {t("cart.total")}{" "}
            <span className="text-xs text-gray-400">
              {t("cart.inclusiveVAT")}
            </span>
          </span>
          <span className="text-gray-800">
            {orderTotal.toFixed(2)} {t("common.currency")}
          </span>
        </div>
      </div>

      {/* Payment plans */}
      <div className="mt-4 rounded-xl bg-gray-50/50 p-3 text-xs text-gray-500">
        <div>
          {t("cart.monthlyPlans")}{" "}
          <Link
            href="#payment-plans"
            className="font-medium text-primary underline"
            aria-label={t("cart.paymentDetails")}
          >
            {t("cart.viewDetails")}
          </Link>
        </div>
      </div>

      {/* Checkout button */}
      <button
        onClick={onCheckout}
        className="mt-6 w-full rounded-full bg-primary px-4 py-3.5 font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
        aria-label={t("cart.checkout")}
      >
        {t("cart.checkout")}
      </button>
    </div>
  );
};

export default OrderSummary;
