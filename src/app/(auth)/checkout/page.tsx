"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import DeliverToModal from "@/components/UI/Modals/DeliverToModal";
import { setCart } from "@/store/slices/cartSlice";
import LoadingAnimation from "@/components/UI/LoadingAnimation";
import Image from "next/image";
import CreditCardModal from "@/components/UI/Modals/CreditCardModal";
import { calculateShippingFee, getExecuteDateFormatted } from "@/util";
import { Address, DestinationKey } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

type FormData = {
  shippingAddress: string;
  paymentMethod: "card" | "cod";
};

export default function CheckoutPage() {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const { handleSubmit, setValue } = useForm<FormData>();
  const { products: productData, totalPrice } = useAppSelector(
    (state) => state.cart,
  );
  const dispatch = useAppDispatch();

  const [isClient, setIsClient] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    setIsClient(true);

    // Load cart from localStorage only on the client
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          // Dispatch the setCart action to update the Redux store
          dispatch(setCart(JSON.parse(savedCart)));
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    // Show address modal immediately when page loads if no address selected
    if (!selectedAddress) {
      setShowAddressModal(true);
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (selectedAddress) {
      setValue("shippingAddress", selectedAddress.details);
    }
  }, [selectedAddress, setValue]);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };
  const handdleSelectMethod = (method: "card" | "cod") => {
    if (method === "card") {
      setPaymentMethod("card");
      setShowCreditCardModal(true);
    } else if (method === "cod") {
      setPaymentMethod("cod");
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Checkout submitted:", data);
    // Process checkout logic here
  };

  // Calculate shipping fees for each product
  const calculateProductShippingFees = () => {
    const destination =
      (selectedAddress?.country_code as DestinationKey) || "EG"; // Default to EG if no address selected

    return productData.map((item) => {
      const shippingMethod = item.shippingMethod || "standard";
      const itemWeight = item.weightKg && item.weightKg > 0 ? item.weightKg : 1;
      const itemPrice = item.price && item.price > 0 ? item.price : 0;

      const feeInput = {
        shippingMethod,
        destination,
        cartTotal: itemPrice * item.quantity,
        weightKg: itemWeight * item.quantity,
      };

      return {
        productId: item.id,
        shippingMethod,
        fee: calculateShippingFee(feeInput),
        quantity: item.quantity,
      };
    });
  };

  const productShippingFees = calculateProductShippingFees();
  const totalShippingFee = productShippingFees.reduce(
    (total, item) => total + item.fee,
    0,
  );

  // Calculate order summary
  const subtotal = totalPrice;
  const shippingFee = totalShippingFee;
  const paymentFee = paymentMethod === "cod" ? 9.0 : 0; // Only charge payment fee for COD
  const total = subtotal + shippingFee + paymentFee;

  if (!isClient) {
    return <LoadingAnimation />;
  }

  return (
    <div className="container mx-auto px-6 py-3 lg:max-w-[1200px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
          <div className="col-span-1 md:col-span-4">
            {/* Shipping Address Section */}
            <h2 className="mb-4 text-xl font-semibold">
              {language === "ar" ? "عنوان الشحن" : "Shipping Address"}
            </h2>
            <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-medium">
                  {language === "ar" ? "العنوان" : "Address"}{" "}
                  <span className="text-xs text-secondary">
                    ({language === "ar" ? "المنزل" : "Home"})
                  </span>
                </h3>

                <div
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                  onClick={() => setShowAddressModal(true)}
                >
                  <div>
                    {selectedAddress ? (
                      <div className="flex items-center gap-4">
                        <div>
                          <Image
                            className="w-10"
                            src="/icons/pin.gif"
                            alt={language === "ar" ? "خريطة" : "map-pin"}
                            width={100}
                            height={100}
                          />
                        </div>
                        <div>
                          <p className="font-medium">
                            {language === "ar" ? "التوصيل إلى" : "Deliver to"}
                          </p>
                          <p className="text-xs text-gray-700 md:text-sm">
                            {selectedAddress.details}
                          </p>
                          <p className="text-xs text-gray-500 md:text-sm">
                            {selectedAddress.area}, {selectedAddress.city}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        {language === "ar"
                          ? "اختر عنوان التسليم"
                          : "Select delivery address"}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="text-gray-400" />
                </div>
              </div>

              <p className="cursor-pointer text-sm text-green-600 hover:underline">
                {language === "ar"
                  ? "الحصول على عدد أقل من عمليات التسليم"
                  : "Get fewer deliveries"}
              </p>
            </div>

            {/* Your Order Section */}
            <h2 className="mb-4 text-xl font-semibold">
              {language === "ar" ? "طلبك" : "Your Order"}
            </h2>
            <div className="">
              {productData.length > 0 ? (
                <>
                  {productData.map((item, index) => {
                    const shippingInfo = productShippingFees.find(
                      (fee) => fee.productId === item.id,
                    );

                    return (
                      <div
                        key={item.id}
                        className="mb-3 rounded-lg border bg-white p-6 shadow-sm"
                      >
                        <div className="mb-2 text-sm font-semibold md:text-lg">
                          {language === "ar"
                            ? `الشحنة ${index + 1} من ${productData.length}`
                            : `Shipment ${index + 1} of ${productData.length}`}{" "}
                          <span className="ml-2 text-sm text-secondary">
                            ({item.quantity}{" "}
                            {language === "ar" ? "عنصر" : "item"})
                          </span>
                        </div>

                        <div className="flex gap-3">
                          <div className="relative min-w-20">
                            <Image
                              className="h-20 w-20 rounded-md object-cover"
                              src={item.image}
                              alt={item.title[language] ?? "product image"}
                              width={200}
                              height={200}
                            />
                            <div className="absolute right-1 top-1 rounded-md bg-gray-400 px-2.5 py-0.5 text-[9px] text-white">
                              X{item.quantity}
                            </div>
                          </div>

                          <div className="space-y-1 text-xs font-semibold md:text-sm">
                            <p className="text-gray-500">
                              {item.brand?.name[language] ||
                                (language === "ar"
                                  ? "ماركة عامة"
                                  : "Generic Brand")}
                            </p>
                            <p className="text-xs text-gray-700 md:text-sm">
                              {item.title[language]}
                            </p>
                            <p className="text-gray-700">
                              {language === "ar" ? "جنيه" : "EGP"}{" "}
                              {item.price.toFixed(2)}
                            </p>
                            {shippingInfo && (
                              <p className="text-xs text-gray-500">
                                {language === "ar" ? "الشحن:" : "Shipping:"}{" "}
                                {language === "ar" ? "جنيه" : "EGP"}{" "}
                                {shippingInfo.fee.toFixed(2)} (
                                {shippingInfo.shippingMethod[language]})
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="mt-2 text-xs text-gray-500 md:text-sm">
                          {language === "ar" ? "توصيل بحلول" : "Get it by"}{" "}
                          <span className="text-xs text-primary md:text-sm">
                            {getExecuteDateFormatted(
                              item.deliveryTime?.[language] ?? "",
                              "EEE, MMM d",
                              language,
                            )}
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </>
              ) : (
                <p className="text-gray-500">
                  {language === "ar"
                    ? "سلة التسوق فارغة"
                    : "Your cart is empty"}
                </p>
              )}
            </div>

            {/* Payment Section */}
            <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">
                {language === "ar" ? "طريقة الدفع" : "Payment"}
              </h2>

              <div className="space-y-4">
                {/* Card Option */}
                <div
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 ${
                    paymentMethod === "card"
                      ? "border-green-500 bg-green-50"
                      : ""
                  }`}
                  onClick={() => handdleSelectMethod("card")}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {language === "ar"
                        ? "بطاقة ائتمان / خصم"
                        : "Debit/Credit Card"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {language === "ar"
                        ? "خطط التقسيط الشهرية متوفرة"
                        : "Monthly installments plans available"}
                    </p>
                  </div>
                  {paymentMethod === "card" && (
                    <span className="text-green-500">✓</span>
                  )}
                </div>

                {/* COD Option */}
                <div
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 ${
                    paymentMethod === "cod"
                      ? "border-green-500 bg-green-50"
                      : ""
                  }`}
                  onClick={() => handdleSelectMethod("cod")}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {language === "ar"
                        ? "الدفع عند الاستلام"
                        : "Cash On Delivery"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {language === "ar"
                        ? "قد يتم فرض رسوم إضافية"
                        : "Extra charges may be applied"}
                    </p>
                  </div>
                  {paymentMethod === "cod" && (
                    <span className="text-green-500">✓</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-3">
            {/* Order Summary */}
            <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">
                {language === "ar" ? "ملخص الطلب" : "Order Summary"}
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600 md:text-sm">
                    {language === "ar"
                      ? `المجموع الفرعي (${productData.length} عنصر${
                          productData.length !== 1 ? "ات" : ""
                        })`
                      : `Subtotal (${productData.length} item${
                          productData.length !== 1 ? "s" : ""
                        })`}
                  </span>
                  <span className="text-xs text-gray-600 md:text-sm">
                    {subtotal.toFixed(2)} {language === "ar" ? "جنيه" : "EGP"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-xs text-gray-600 md:text-sm">
                    {language === "ar" ? "رسوم الشحن" : "Shipping Fee"}
                  </span>
                  {shippingFee === 0 ? (
                    <span className="text-xs text-primary md:text-sm">
                      {language === "ar" ? "مجاني" : "Free"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600 md:text-sm">
                      {shippingFee.toFixed(2)}{" "}
                      {language === "ar" ? "جنيه" : "EGP"}
                    </span>
                  )}
                </div>

                {paymentFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600 md:text-sm">
                      {language === "ar"
                        ? "رسوم الدفع (الدفع عند الاستلام)"
                        : "Payment Fee (COD)"}
                    </span>
                    <span className="text-xs text-gray-600 md:text-sm">
                      {paymentFee.toFixed(2)}{" "}
                      {language === "ar" ? "جنيه" : "EGP"}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t pt-3 font-medium">
                  <span className="text-sm text-gray-600">
                    {language === "ar"
                      ? "الإجمالي شامل الضريبة"
                      : "Total Inc.: VAT"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {total.toFixed(2)} {language === "ar" ? "جنيه" : "EGP"}
                  </span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <div>
              <button
                type="submit"
                className="w-full rounded-lg bg-green-600 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-300"
                disabled={!selectedAddress || productData.length === 0}
              >
                {language === "ar" ? "تأكيد الطلب" : "PLACE ORDER"}
              </button>

              <p className="mt-2 text-xs text-gray-500">
                {language === "ar"
                  ? "الدفع آمن. يتم تشفير معلوماتك الشخصية ومعلومات الدفع عبر 128 بت. لا نقوم بتخزين بيانات بطاقتك."
                  : "Our checkout is safe and secure. Your personal and payment information is securely transmitted via 128-bit encryption. We do not store any payment card information on our systems."}
              </p>

              <p className="mt-4 text-xs text-gray-500">
                © 2025 Medicova Store.{" "}
                {language === "ar"
                  ? "جميع الحقوق محفوظة"
                  : "All Rights Reserved"}
                <br />
                {language === "ar"
                  ? "شروط الاستخدام | شروط البيع | سياسة الخصوصية"
                  : "Terms of Use | Terms of Sale | Privacy Policy"}
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Deliver To Modal */}
      <DeliverToModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onAddressSelect={handleAddressSelect}
        currentAddress={selectedAddress || undefined}
        locale={language}
      />
      {/* Credit Card Modal */}
      <CreditCardModal
        locale={language}
        isOpen={showCreditCardModal}
        onClose={() => setShowCreditCardModal(false)}
        onSubmit={(data) => {
          console.log("Credit card submitted:", data);
          // Handle credit card submission
        }}
      />
    </div>
  );
}
