import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { callRegisterApi } from "@/lib/auth/registerApi";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCart } from "@/store/slices/cartSlice";
import { calculateShippingFee } from "@/util";
import { Address, DestinationKey } from "@/types";
import { useAppLocale } from "@/hooks/useAppLocale";
import { getEncrypted } from "@/util/encryptedCookieStorage";
import { useSyncCart } from "@/hooks/useSyncCart";
import { cities } from "@/constants/cities";
import { getPaymobMethods, initializePaymobPayment, PaymobMethod } from "@/services/paymentService";
import { createOrderWithDetails } from "@/services/orderService";

export type CheckoutFormData = {
  fullName: string;
  phoneNumber: string;
  shippingAddress: string;
  governorate: string;
  paymentMethod: string;
  password?: string;
};

export function useCheckoutPage() {
  const { syncCart } = useSyncCart();
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [paymobMethods, setPaymobMethods] = useState<PaymobMethod[]>([]);
  const searchParams = useSearchParams();
  const session = useSession();
  const dispatch = useAppDispatch();
  
  const { 
    phoneNumber: reduxPhone, 
    isNewUser: reduxIsNew,
    step: currentStep 
  } = useAppSelector((state) => state.checkout);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: "card",
      fullName: "",
      phoneNumber: reduxPhone || "",
      governorate: "",
    }
  });

  useEffect(() => {
    if (session?.data?.user) {
      const user = session.data.user as any;
      if (user.firstName && user.lastName) {
        setValue("fullName", `${user.firstName} ${user.lastName}`);
      } else if (user.name) {
        setValue("fullName", user.name);
      }
      
      if (user.phone) {
        // Remove +2 for the input field display if it exists, or just keep as is
        // The user says "hides the field" so we just need the value for the form state
        setValue("phoneNumber", user.phone.replace("+2", ""));
      } else if (user.phoneNumber) {
        setValue("phoneNumber", user.phoneNumber.replace("+2", ""));
      }
    }
  }, [session, setValue]);

  useEffect(() => {
    if (reduxPhone) {
      setValue("phoneNumber", reduxPhone);
    }
  }, [reduxPhone, setValue]);
  
  const { 
    products: productData, 
    totalPrice, 
    discountAmount: reduxDiscount, 
    appliedCoupon: reduxCoupon 
  } = useAppSelector(
    (state) => state.cart,
  );
  const [isClient, setIsClient] = useState(false);
  const locale = useAppLocale();

  useEffect(() => {
    const fetchMethods = async () => {
      const methods = await getPaymobMethods();
      setPaymobMethods(methods);
    };
    fetchMethods();
  }, []);

  useEffect(() => {
    const loadCart = async () => {
      setIsClient(true);
      try {
        const savedCart = await getEncrypted<{
          products: typeof productData;
          totalPrice: number;
        }>("cart");
        if (savedCart) {
          dispatch(setCart(savedCart));
          await syncCart(savedCart.products);
        }
      } catch (e) {
        console.error("Failed to load cart from cookies", e);
      }
    };
    loadCart();
  }, [dispatch]);

  const handleSelectMethod = (method: string) => {
    setPaymentMethod(method as any);
    setValue("paymentMethod", method);
  };

  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        let nearestCity: any = null;
        let minDistance = Infinity;

        for (const city of cities) {
          const cityLat = parseFloat(city.lat);
          const cityLng = parseFloat(city.lng);
          const distance = Math.sqrt(
            Math.pow(cityLat - latitude, 2) + Math.pow(cityLng - longitude, 2),
          );

          if (distance < minDistance) {
            minDistance = distance;
            nearestCity = city;
          }
        }

        if (nearestCity) {
          return {
            details: nearestCity.city,
            area: nearestCity.admin_name || "",
            city: nearestCity.city,
            country: nearestCity.country,
            country_code: nearestCity.iso2,
          };
        }

        return null;
      } catch (error) {
        console.error("Reverse geocode error:", error);
        return null;
      }
    },
    [],
  );

  const handleLocateMe = useCallback(async () => {
    setIsLocating(true);
    setLocationError("");
    try {
      if (!navigator.geolocation) throw new Error("Geolocation not supported");
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000,
          });
        },
      );
      
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      
      const addressDetails = await reverseGeocode(
        newLocation.lat,
        newLocation.lng,
      );
      
      if (addressDetails) {
        const newAddress: Address = {
          id: `gps-${Date.now()}`,
          type: "other",
          name: locale === "ar" ? "موقعي الحالي" : "Current Location",
          details: locale === "ar" ? "تم التحديد عبر GPS" : "Detected via GPS",
          area: addressDetails.area,
          city: addressDetails.city,
          country: addressDetails.country,
          country_code: addressDetails.country_code,
          isDefault: false,
          location: newLocation,
        };
        setSelectedAddress(newAddress);
        setValue("shippingAddress", newAddress.details);
      }
    } catch (error: any) {
      console.error("Location error:", error);
      
      let message = locale === "ar" ? "تعذر الحصول على الموقع" : "Could not get location";
      
      if (error.code === 1) { // PERMISSION_DENIED
        message = locale === "ar" 
          ? "تم رفض الإذن للوصول للموقع. يرجى تفعيل الإذن من إعدادات المتصفح." 
          : "Permission denied. Please enable location access in browser settings.";
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        message = locale === "ar"
          ? "موقعك غير متاح حالياً. يرجى إدخال العنوان يدوياً."
          : "Location unavailable. Please enter your address manually.";
      } else if (error.code === 3) { // TIMEOUT
        message = locale === "ar"
          ? "انتهت مهلة البحث عن الموقع. يرجى المحاولة مرة أخرى أو إدخال العنوان يدوياً."
          : "Location request timed out. Please try again or enter your address manually.";
      }

      setLocationError(message);
    } finally {
      setIsLocating(false);
    }
  }, [locale, reverseGeocode]);

  const productShippingFees = useMemo(() => {
    const destination = (selectedAddress?.country_code as DestinationKey) || "EG";
    const selectedGov = watch("governorate");

    return productData.map((item) => {
      const shippingMethod = item.shippingMethod || "standard";
      const itemWeight = item.weightKg && item.weightKg > 0 ? item.weightKg : 1;
      const itemPrice = item.price && item.price > 0 ? item.price : 0;

      const feeInput = {
        shippingMethod,
        destination,
        city: selectedGov || selectedAddress?.city,
        cartTotal: itemPrice * item.quantity,
        weightKg: itemWeight * item.quantity,
        shippingCostInsideCairo: (item as any).shippingCostInsideCairo,
        shippingCostRegion1: (item as any).shippingCostRegion1,
        shippingCostRegion2: (item as any).shippingCostRegion2,
      };

      return {
        productId: item.id,
        shippingMethod,
        fee: calculateShippingFee(feeInput),
        quantity: item.quantity,
      };
    });
  }, [productData, selectedAddress, watch("governorate")]);

  const totalShippingFee = useMemo(
    () => productShippingFees.reduce((total, item) => total + item.fee, 0),
    [productShippingFees],
  );

  const subtotal = totalPrice;
  const shippingFee = totalShippingFee;
  const paymentFee = 0; // Removed COD fee as requested
  const discountAmount = reduxDiscount || 0;
  const total = subtotal + shippingFee + paymentFee - discountAmount;

  return {
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
    discountAmount,
    appliedCoupon: reduxCoupon,
    total,
    productShippingFees,
    isSchemaModalOpen,
    setIsSchemaModalOpen,
    setShowCreditCardModal,
    handleSelectMethod,
    handleLocateMe,
    handleSubmit,
    register,
    watch,
    setValue,
    errors,
    isNewUser: reduxIsNew,
    currentStep,
    paymobMethods,
    isLoading: session.status === "loading"
  };
}
