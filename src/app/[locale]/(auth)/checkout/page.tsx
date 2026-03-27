"use client";

import { useCheckoutPage } from "./hooks/useCheckoutPage";
import LoadingAnimation from "@/components/layouts/LoadingAnimation";
import DeliverToModal from "@/components/shared/Modals/DeliverToModal";
import CheckoutHeader from "./components/CheckoutHeader";
import AddressSection from "./components/AddressSection";
import CheckoutItems from "./components/CheckoutItems";
import PaymentSection from "./components/PaymentSection";
import CheckoutSummary from "./components/CheckoutSummary";
import { signIn, useSession, getSession } from "next-auth/react";
import { callRegisterApi } from "@/lib/auth/registerApi";
import { createOrderWithDetails } from "@/services/orderService";
import { initializePaymobPayment } from "@/services/paymentService";
import SchemaModal from "./components/SchemaModal";

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
    isSchemaModalOpen,
    setIsSchemaModalOpen,
    handleSelectMethod,
    handleLocateMe,
    handleSubmit,
    register,
    watch,
    errors,
    isNewUser,
    currentStep,
    paymobMethods,
  } = useCheckoutPage();

  const { data: session } = useSession();
  const isAr = locale === "ar";
  
  const fullName = watch("fullName");
  const phoneNumber = watch("phoneNumber");
  const shippingAddress = watch("shippingAddress");
  const governorate = watch("governorate");
  
  // Decide which step to show
  const showStep2 = !isNewUser && !session;
  const showStep3 = isNewUser || !!session;

  const isFormValid = !!session 
    ? (!!shippingAddress && !!governorate)
    : (!!fullName && !!phoneNumber && phoneNumber.length === 11 && !!shippingAddress && !!governorate);

  const constructOrderPayload = (data: any, userId: string, formattedPhone: string) => {
    // Construct units array from product unitSelections
    const units: any[] = [];
    productData.forEach(p => {
      if (p.unitSelections && p.unitSelections.length > 0) {
        p.unitSelections.forEach(selection => {
          const unit: any = {
            productId: p.id,
            quantity: 1,
            ...selection // Spread all selection keys (color, size, strength, etc.)
          };
          
          // Remove default values if any
          Object.keys(unit).forEach(key => {
            if (unit[key] === "Default") delete unit[key];
          });

          units.push(unit);
        });
      } else {
        units.push({
          productId: p.id,
          quantity: p.quantity,
          variant_1: (p as any).color || "Default",
          variant_2: (p as any).size || "Default"
        });
      }
    });

    // Cleanup default values in units for the product-level fallback
    units.forEach(u => {
      if (u.variant_1 === "Default") delete u.variant_1;
      if (u.variant_2 === "Default") delete u.variant_2;
    });

    return {
      userId: userId || "PENDING_USER_ID",
      name: data.fullName || (session?.user as any)?.name || `${(session?.user as any)?.firstName} ${(session?.user as any)?.lastName}` || "Guest",
      phoneNumber: formattedPhone || (session?.user as any)?.phone || (session?.user as any)?.phoneNumber || data.phoneNumber,
      email: session?.user?.email || `${data.phoneNumber}@medicova.net`, 
      address: {
        addressName: "Default Address",
        addressDetails: data.shippingAddress || "Pending Address",
        area: data.governorate || "Pending Area",
        city: data.governorate || "Pending City",
        addressType: "home" as const,
        isDefault: false,
      },
      productId: productData.map(p => p.id),
      quantity: productData.reduce((acc, p) => acc + p.quantity, 0),
      units: units,
      couponCode: appliedCoupon,
      paymentMethod: data.paymentMethod === "ewallet" ? "wallet" : (data.paymentMethod === "card" ? "credit_card" : "cash_on_delivery"),
      totalPrice: total,
    };
  };

  const onSubmit = async (data: any) => {
    const formattedPhone = data.phoneNumber.startsWith("+2") ? data.phoneNumber : "+2" + data.phoneNumber;
    let currentToken = (session as any)?.accessToken;

    const waitForSession = async (retries = 3) => {
      for (let i = 0; i < retries; i++) {
        const s = await getSession();
        if ((s as any)?.accessToken) return s;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      return null;
    };

    if (isNewUser) {
      try {
        const nameParts = (data.fullName || "").trim().split(" ");
        const firstName = nameParts[0] || "User";
        const lastName = nameParts.slice(1).join(" ") || "Medicova";

        const registerRes = await callRegisterApi({
          firstName,
          lastName,
          password: data.password,
          role: "user",
          language: locale as string,
          phone: formattedPhone,
        });

        if (registerRes.status === "success") {
          const result = await signIn("credentials", {
            redirect: false,
            identifier: formattedPhone,
            password: data.password,
          });
          
          if (!result?.error) {
            const newSession = await waitForSession();
            currentToken = (newSession as any)?.accessToken;
          }
        }
      } catch (err: any) {
        if (err.message?.includes("exists")) {
          const result = await signIn("credentials", {
            redirect: false,
            identifier: formattedPhone,
            password: data.password,
          });
          if (!result?.error) {
            const newSession = await waitForSession();
            currentToken = (newSession as any)?.accessToken;
          }
        } else {
          console.error("Auto-registration during checkout failed:", err);
        }
      }
    } else if (showStep2) {
       try {
         const result = await signIn("credentials", {
           redirect: false,
           identifier: formattedPhone,
           password: data.password,
         });
         
         if (result?.error) {
           console.error("Login failed:", result.error);
           return;
         }
         
         const newSession = await waitForSession();
         currentToken = (newSession as any)?.accessToken;
       } catch (err) {
         console.error("Login during checkout failed:", err);
         return;
       }
    }

    if (showStep3) {
      if (!currentToken) {
        const activeSession = await waitForSession(2);
        currentToken = (activeSession as any)?.accessToken;
        
        if (!currentToken) {
           console.error("No access token available for order creation after retries");
           return;
        }
      }

      try {
        const activeSession = await getSession();
        const userId = (activeSession?.user as any)?.id || "";

        if (!userId) {
          console.error("No user ID available for order creation");
          return;
        }

        const orderPayload = constructOrderPayload(data, userId, formattedPhone);

        const orderRes = await createOrderWithDetails(orderPayload as any, currentToken);
        
        if (orderRes.status === "success") {
          const orderId = orderRes.data?._id || orderRes.data?.id || orderRes.data?.orderId || orderRes.data?.orderNumber;
          
          if (!orderId) {
            console.error("Order creation succeeded but orderId is missing in response:", orderRes.data);
            return;
          }
          
          if (data.paymentMethod === "cash_on_delivery") {
            window.location.href = `/${locale}/checkout/success/${orderId}`;
          } else {
            const nameParts = (data.fullName || "").trim().split(" ");
            const firstName = nameParts[0] || "User";
            const lastName = nameParts.slice(1).join(" ") || "Medicova";

            const paymentPayload = {
              orderId: orderId,
              paymobIntegrationType: "card",
              billingData: {
                first_name: firstName,
                last_name: lastName,
                email: session?.user?.email || activeSession?.user?.email || `${data.phoneNumber}@medicova.net`,
                phone_number: formattedPhone,
                city: data.governorate,
                country: "EG",
                street: data.shippingAddress,
                postal_code: "12345",
              }
            };

            try {
              const paymentRes = await initializePaymobPayment(paymentPayload as any, currentToken);
              if (paymentRes.status === "success" && paymentRes.data?.unifiedCheckoutUrl) {
                window.location.href = paymentRes.data.unifiedCheckoutUrl;
              } else {
                 console.error("Paymob initialization failed:", paymentRes);
              }
            } catch (paymobErr) {
              console.error("Failed to initialize Paymob payment:", paymobErr);
            }
          }
        }
      } catch (err) {
        console.error("Order or Payment failed:", err);
      }
    }
  };

  const handleShowSchema = () => {
    const currentData = watch();
    const formattedPhone = currentData.phoneNumber.startsWith("+2") ? currentData.phoneNumber : "+2" + currentData.phoneNumber;
    const userId = (session?.user as any)?.id || "";
    const payload = constructOrderPayload(currentData, userId, formattedPhone);
    setIsSchemaModalOpen(true);
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
              {showStep2 && (
                <div className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white/70 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
                   <div className="p-5">
                      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                        <span className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full text-xs text-primary">
                          2
                        </span>
                        {isAr ? "تسجيل الدخول" : "Login"}
                      </h2>
                      <p className="mb-4 text-sm text-gray-600">
                        {isAr ? "برجاء إدخال كلمة المرور للمتابعة" : "Please enter your password to continue"}
                      </p>
                      <div className="space-y-1.5 max-w-sm">
                        <label className="text-xs font-semibold text-gray-700">
                          {isAr ? "كلمة المرور" : "Password"} <span className="text-red-500">*</span>
                        </label>
                        <input
                           {...register("password", { required: true })}
                           type="password"
                           placeholder="••••••••"
                           className={`w-full rounded-lg border ${errors.password ? "border-red-300" : "border-gray-100"} bg-gray-50/50 py-2.5 px-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all`}
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="btn-primary mt-6 rounded-lg px-8 py-2.5 text-sm font-bold"
                      >
                        {isAr ? "تسجيل الدخول" : "Login"}
                      </button>
                   </div>
                </div>
              )}

                <AddressSection
                  selectedAddress={selectedAddress}
                  onLocateMe={handleLocateMe}
                  isLocating={isLocating}
                  locationError={locationError}
                  locale={locale}
                  register={register}
                  watch={watch}
                  errors={errors}
                  isNewUser={isNewUser}
                  isLoggedIn={!!session}
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
                paymobMethods={paymobMethods}
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
                onShowSchema={handleShowSchema}
                locale={locale}
              />
            </div>
          </div>
        </form>

        <SchemaModal
          isOpen={isSchemaModalOpen}
          onClose={() => setIsSchemaModalOpen(false)}
          schema={constructOrderPayload(watch(), (session?.user as any)?.id || "", watch("phoneNumber").startsWith("+2") ? watch("phoneNumber") : "+2" + watch("phoneNumber"))}
        />
      </div>
    </div>
  );
}
