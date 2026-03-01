"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { removeItem, setCart } from "@/store/slices/cartSlice";
import CustomAlert from "@/components/shared/CustomAlert";
import OrderSummary from "./components/OrderSummary";
import EmptyCart from "./components/EmptyCart";
import CartItemCard from "./components/CartItemCard";
import { availableCoupons } from "@/constants/coupons";
import LoadingAnimation from "@/components/layouts/LoadingAnimation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "@/components/shared/Modals/DynamicModal";
import AuthLogin from "@/components/shared/Modals/loginAuth";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useTranslations } from "next-intl";
import { Address, DestinationKey } from "@/types";
import { useCartCalculations } from "./hooks/useCartCalculations";
import { getEncrypted } from "@/util/encryptedCookieStorage";

export default function CartPage() {
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const session = useSession();
  const router = useRouter();
  const locale = useAppLocale();
  const t = useTranslations();
  const { products: cartItems } = useAppSelector((state) => state.cart);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("standard");

  useEffect(() => {
    const loadData = async () => {
      setIsClient(true);
      setPaymentMethod("standard");
      try {
        const savedCart = await getEncrypted<{
          products: typeof cartItems;
          totalPrice: number;
        }>("cart");
        if (savedCart) {
          dispatch(setCart(savedCart));
        }
        const userAddress = await getEncrypted<Address>("userAddress");
        const savedAddresses = await getEncrypted<Address[]>("savedAddresses");
        if (userAddress) {
          setSelectedAddress(userAddress);
        } else if (savedAddresses && savedAddresses.length > 0) {
          setSelectedAddress(savedAddresses[0]);
        }
      } catch (e) {
        console.error("Failed to load data from cookies", e);
      }
    };
    loadData();
  }, [dispatch]);

  const destination = (selectedAddress?.country_code as DestinationKey) || "EG";

  const {
    totalShippingFee,
    subtotal,
    paymentFee,
    total,
    productsCount,
    getItemShippingFeeDisplay,
  } = useCartCalculations(destination, paymentMethod, discountAmount);

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const applyCoupon = () => {
    setCouponError(null);
    const coupon = availableCoupons.find(
      (c) => c.code.toUpperCase() === appliedCoupon.toUpperCase(),
    );
    if (!coupon) {
      setCouponError(
        locale === "ar" ? "رمز الكوبون غير صالح." : "Invalid coupon code.",
      );
      setDiscountAmount(0);
      return;
    }
    if (subtotal < coupon.minPurchaseAmount) {
      setCouponError(
        locale === "ar"
          ? `الحد الأدنى للشراء لاستخدام هذا الكوبون هو ${coupon.minPurchaseAmount} جنيه.`
          : `Minimum purchase of EGP ${coupon.minPurchaseAmount} required to use this coupon.`,
      );
      setDiscountAmount(0);
      return;
    }
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else if (coupon.discountType === "fixed") {
      discount = coupon.discountValue;
    }
    setDiscountAmount(discount);
    showAlert(
      locale === "ar"
        ? `تم تطبيق الكوبون ${coupon.code}! لقد وفّرت ${discount.toFixed(2)} جنيه.`
        : `Coupon ${coupon.code} applied! You saved EGP ${discount.toFixed(2)}.`,
      "success",
    );
  };

  const handleRemove = (id: string) => {
    dispatch(removeItem(id));
    showAlert(
      locale === "ar" ? "تم الحذف من السلة" : "Deleted From Cart",
      "error",
    );
  };

  const onCheckout = () => {
    if (session.data?.user) {
      router.push("/checkout");
    } else {
      setIsModalOpen(true);
    }
  };

  if (!isClient) return <LoadingAnimation />;
  if (!cartItems.length) return <EmptyCart />;

  return (
    <>
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="container mx-auto p-4 lg:max-w-[98%]">
        <h1 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-800">
          {t("cart.title")}
          <span className="bg-primary/10 rounded-full px-3 py-1 text-xs font-bold text-primary">
            {productsCount} {t("cart.items")}
          </span>
        </h1>
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-8">
          {/* Cart Items */}
          <div className="col-span-1 flex flex-col gap-4 lg:col-span-5">
            {cartItems.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                shippingFeeDisplay={getItemShippingFeeDisplay(item.id, locale)}
                onRemove={handleRemove}
              />
            ))}
          </div>
          {/* Order Summary */}
          <OrderSummary
            appliedCoupon={appliedCoupon}
            setAppliedCoupon={setAppliedCoupon}
            applyCoupon={applyCoupon}
            couponError={couponError ?? ""}
            productsCount={productsCount}
            totalPrice={total}
            discountAmount={discountAmount}
            onCheckout={onCheckout}
            productCart={cartItems}
            destinationCountry={
              selectedAddress?.country_code as DestinationKey | undefined
            }
            shippingFee={totalShippingFee}
            paymentFee={paymentFee}
            subtotal={subtotal}
          />
        </div>
      </div>

      <div className="relative z-[1000]">
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <AuthLogin redirect="/checkout" />
        </Modal>
      </div>
    </>
  );
}
