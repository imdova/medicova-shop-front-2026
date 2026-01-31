"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { removeItem, setCart } from "@/store/slices/cartSlice";
import Image from "next/image";
import { Trash2, Truck } from "lucide-react";
import QuantitySelector from "@/components/Forms/formFields/QuantitySelector";
import CustomAlert from "@/components/UI/CustomAlert";
import OrderSummary from "./components/OrderSummary";
import { availableCoupons } from "@/constants/coupons";
import LoadingAnimation from "@/components/UI/LoadingAnimation";
import Link from "next/link";
import ProductsSlider from "@/components/UI/sliders/ProductsSlider";
import { products } from "@/constants/products";
import ProductCard from "@/components/UI/cards/ProductCard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "@/components/UI/Modals/DynamicModal";
import AuthLogin from "@/components/UI/Modals/loginAuth";
import { calculateShippingFee, getExecuteDateFormatted } from "@/util";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageType } from "@/util/translations";
import { Address, DestinationKey } from "@/types";

export default function CartPage() {
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const session = useSession();
  const router = useRouter();
  const { language, isArabic } = useLanguage();
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
    setIsClient(true);
    setPaymentMethod("standard");
    // Load cart and address from localStorage
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          dispatch(setCart(JSON.parse(savedCart)));
        }

        const userAddressString = localStorage.getItem("userAddress");
        const savedAddressesString = localStorage.getItem("savedAddresses");

        if (userAddressString) {
          setSelectedAddress(JSON.parse(userAddressString));
        } else if (savedAddressesString) {
          const addresses = JSON.parse(savedAddressesString);
          if (addresses.length > 0) {
            setSelectedAddress(addresses[0]);
          }
        }
      } catch (e) {
        console.error("Failed to parse data from localStorage", e);
      }
    }
  }, [dispatch]);

  const calculateProductShippingFees = () => {
    const destination =
      (selectedAddress?.country_code as DestinationKey) || "EG";

    const productFees = cartItems.map((item) => {
      const shippingMethod = item.shippingMethod || "standard";
      const itemWeight = item.weightKg && item.weightKg > 0 ? item.weightKg : 1;
      const itemPrice = item.price && item.price > 0 ? item.price : 0;
      const quantity = item.quantity || 1;

      const feeInput = {
        shippingMethod,
        destination,
        cartTotal: itemPrice * quantity,
        weightKg: itemWeight * quantity,
      };

      return {
        productId: item.id,
        shippingMethod,
        fee: calculateShippingFee(feeInput),
        quantity,
      };
    });

    const totalShippingFee = productFees.reduce(
      (total, item) => total + item.fee,
      0,
    );

    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );
    const paymentFee = paymentMethod === "cod" ? 9.0 : 0;
    const total = subtotal + totalShippingFee + paymentFee - discountAmount;

    return {
      productFees,
      totalShippingFee,
      subtotal,
      paymentFee,
      total,
    };
  };

  const { productFees, totalShippingFee, subtotal, paymentFee, total } =
    calculateProductShippingFees();

  const getItemShippingFeeDisplay = (
    productId: string,
    language: LanguageType,
  ) => {
    const itemFee =
      productFees.find((item) => item.productId === productId)?.fee || 0;

    if (itemFee === 0) {
      return language === "ar" ? "توصيل مجاني" : "Free Delivery";
    }

    return language === "ar"
      ? `${itemFee.toFixed(2)} جنيه`
      : `${itemFee.toFixed(2)} EGP`;
  };

  const productsCount = cartItems.length;

  const applyCoupon = () => {
    setCouponError(null);

    const coupon = availableCoupons.find(
      (c) => c.code.toUpperCase() === appliedCoupon.toUpperCase(),
    );

    if (!coupon) {
      setCouponError(
        language === "ar" ? "رمز الكوبون غير صالح." : "Invalid coupon code.",
      );
      setDiscountAmount(0);
      return;
    }

    if (subtotal < coupon.minPurchaseAmount) {
      setCouponError(
        language === "ar"
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
      language === "ar"
        ? `تم تطبيق الكوبون ${coupon.code}! لقد وفّرت ${discount.toFixed(2)} جنيه.`
        : `Coupon ${coupon.code} applied! You saved EGP ${discount.toFixed(2)}.`,
      "success",
    );
  };

  const handdleRemove = (id: string) => {
    dispatch(removeItem(id));
    showAlert(
      language === "ar" ? "تم الحذف من السلة" : "Deleted From Cart",
      "error",
    );
  };

  const showAlert = (message: string, type: "success" | "error") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const onCheckout = () => {
    if (session.data?.user) {
      router.push("/checkout");
    } else {
      setIsModalOpen(true);
    }
  };

  if (!isClient) {
    return <LoadingAnimation />;
  }

  if (!cartItems.length) {
    return (
      <div className="container mx-auto p-3 lg:max-w-[1440px]">
        {/* Items you previously viewed */}
        <div className="mt-6 rounded-lg bg-white shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-gray-600">
            {isArabic
              ? "العناصر التي قمت بعرضها مسبقًا"
              : "Items you previously viewed"}
          </h2>
          <ProductsSlider>
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[200px] flex-shrink-0 md:w-[240px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </ProductsSlider>
        </div>

        {/* Bestsellers for you */}
        <div className="mt-6 rounded-lg bg-white shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-gray-600">
            {isArabic ? "الأكثر مبيعا بالنسبة لك" : "Bestsellers for you"}
          </h2>
          <ProductsSlider>
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[200px] flex-shrink-0 md:w-[240px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </ProductsSlider>
        </div>
      </div>
    );
  }

  return (
    <>
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="container mx-auto p-3 lg:max-w-[1440px]">
        <h1 className="mb-6 text-2xl font-bold">
          {isArabic ? "عربة التسوق" : "Cart"}{" "}
          <span className="text-sm text-secondary">
            ({productsCount} {isArabic ? "منتج" : "item"})
          </span>
        </h1>
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-8">
          {/* Cart Items */}
          <div className="col-span-1 lg:col-span-5">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="mb-4 bg-white last:mb-0 last:border-0 last:pb-0"
              >
                <div className="p-2">
                  <div className="flex gap-2 md:gap-4">
                    <Link href={`/product-details/${item.id}`}>
                      <Image
                        className="h-[160px] w-[120px] object-cover"
                        src={item.image ?? "/images/placeholder.jpg"}
                        width={300}
                        height={300}
                        alt={item.title[language] ?? "Product image"}
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
                        <div>
                          <span className="text-xs text-secondary">
                            {item.brand?.name[language]}
                          </span>
                          <h2 className="text-sm font-semibold text-gray-700">
                            {item.title[language]}
                          </h2>
                        </div>
                        <div>
                          <p className="text-md mt-2 flex items-center gap-1 font-bold">
                            {item.price}
                            <span>{language === "ar" ? "جنيه" : "EGP"}</span>
                          </p>

                          <div className="flex items-center gap-2">
                            <span className="ml-2 flex items-center gap-2 text-xs text-gray-500 line-through">
                              <span>{item.del_price?.toLocaleString()}</span>
                              {language === "ar" ? "جنيه" : "EGP"}{" "}
                            </span>
                            <span className="flex items-center gap-2 text-xs font-semibold text-primary">
                              {item.del_price
                                ? `${((item.price / item.del_price) * 100).toFixed(0)}% OFF`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="my-2 flex flex-col justify-between gap-2 md:flex-row md:items-center">
                        {item.deliveryTime && (
                          <p className="whitespace-pre-line text-xs text-gray-600">
                            {language === "ar" ? "احصل عليه" : "Get it"}{" "}
                            <span className="text-xs text-primary">
                              {getExecuteDateFormatted(
                                item.deliveryTime[language] ?? "",
                                "EEE, MMM d",
                                language,
                              )}
                            </span>
                          </p>
                        )}
                        {item.shippingMethod?.[language] && (
                          <div className="flex items-center text-xs font-semibold">
                            <span className="bg-light-primary rounded px-2 py-1 text-white">
                              {item.shippingMethod?.[language]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck size={17} className="text-primary" />
                        <span className="text-xs font-semibold">
                          {getItemShippingFeeDisplay(item.id, language)}
                        </span>
                      </div>

                      <p className="mt-2 text-xs">
                        {language === "ar" ? "تباع من قبل" : "Sold by"}{" "}
                        <span className="text-xs font-semibold">
                          {item.sellers?.name}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <QuantitySelector
                      productId={item?.id ?? ""}
                      initialQuantity={item.quantity}
                      min={1}
                      max={item?.stock || 99}
                      buttonSize="md"
                      showLabel={false}
                    />
                    <button
                      onClick={() => handdleRemove(item.id)}
                      className="flex items-center gap-2 rounded-sm border border-gray-300 px-4 py-2 text-xs text-gray-700"
                    >
                      <Trash2 size={16} />
                      {language === "ar" ? "ازاله" : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
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
          <AuthLogin locale={language} redirect="/checkout" />
        </Modal>
      </div>
    </>
  );
}
