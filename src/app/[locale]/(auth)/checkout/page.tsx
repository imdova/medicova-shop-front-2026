"use client";

import { useCheckoutPage } from "./hooks/useCheckoutPage";
import LoadingAnimation from "@/components/layouts/LoadingAnimation";
import DeliverToModal from "@/components/shared/Modals/DeliverToModal";
import CreditCardModal from "@/components/shared/Modals/CreditCardModal";
import CheckoutHeader from "./components/CheckoutHeader";
import AddressSection from "./components/AddressSection";
import CheckoutItems from "./components/CheckoutItems";
import PaymentSection from "./components/PaymentSection";
import CheckoutSummary from "./components/CheckoutSummary";

export default function CheckoutPage() {
  const {
    isClient,
    locale,
    productData,
    selectedAddress,
    paymentMethod,
    showCreditCardModal,
    isLocating,
    locationError,
    subtotal,
    shippingFee,
    paymentFee,
    total,
    discountAmount,
    appliedCoupon,
    productShippingFees,
    setShowCreditCardModal,
    handleSelectMethod,
    handleLocateMe,
    handleSubmit,
    register,
    watch,
    setValue,
    errors,
  } = useCheckoutPage();

  const isAr = locale === "ar";
  
  const fullName = watch("fullName");
  const phoneNumber = watch("phoneNumber");
  const shippingAddress = watch("shippingAddress");
  
  const isFormValid = !!fullName && !!phoneNumber && phoneNumber.length === 13 && !!shippingAddress;

  const onSubmit = (data: any) => {
    console.log("Checkout submitted:", {
      ...data,
      selectedAddress,
      paymentMethod,
      total,
      products: productData,
    });
    // Final order processing logic would go here
  };

  if (!isClient) {
    return <LoadingAnimation />;
  }

  return (
    <div
      className={`min-h-screen bg-gray-50/30 pb-20 pt-8 ${isAr ? "rtl" : "ltr"}`}
    >
      <div className="container mx-auto px-4 lg:max-w-[1240px]">
        <CheckoutHeader />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* Left Column: Details */}
            <div className="flex-1 lg:max-w-[750px]">
              <AddressSection
                selectedAddress={selectedAddress}
                onLocateMe={handleLocateMe}
                isLocating={isLocating}
                locationError={locationError}
                locale={locale}
                register={register}
                watch={watch}
                errors={errors}
              />

              <CheckoutItems
                productData={productData}
                productShippingFees={productShippingFees}
                locale={locale}
              />

              <PaymentSection
                paymentMethod={paymentMethod}
                onSelectMethod={handleSelectMethod}
                locale={locale}
              />
            </div>

            {/* Right Column: Summary */}
            <div className="w-full lg:w-[400px]">
              <CheckoutSummary
                productsCount={productData.length}
                subtotal={subtotal}
                shippingFee={shippingFee}
                paymentFee={paymentFee}
                discountAmount={discountAmount}
                appliedCoupon={appliedCoupon}
                total={total}
                disabled={!isFormValid || productData.length === 0}
                locale={locale}
              />
            </div>
          </div>
        </form>

        {/* Modals */}
        <CreditCardModal
          locale={locale}
          isOpen={showCreditCardModal}
          onClose={() => setShowCreditCardModal(false)}
          onSubmit={(data) => {
            console.log("Credit card submitted:", data);
            setShowCreditCardModal(false);
          }}
        />
      </div>
    </div>
  );
}
