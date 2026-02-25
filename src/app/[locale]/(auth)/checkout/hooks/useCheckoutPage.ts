"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCart } from "@/store/slices/cartSlice";
import { calculateShippingFee } from "@/util";
import { Address, DestinationKey } from "@/types";
import { useAppLocale } from "@/hooks/useAppLocale";
import { getEncrypted } from "@/util/encryptedCookieStorage";

export type CheckoutFormData = {
  shippingAddress: string;
  paymentMethod: "card" | "cod";
};

export function useCheckoutPage() {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCreditCardModal, setShowCreditCardModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");
  const { handleSubmit, setValue } = useForm<CheckoutFormData>();
  const { products: productData, totalPrice } = useAppSelector(
    (state) => state.cart,
  );
  const dispatch = useAppDispatch();
  const [isClient, setIsClient] = useState(false);
  const locale = useAppLocale();

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
        }
      } catch (e) {
        console.error("Failed to load cart from cookies", e);
      }
    };
    loadCart();
  }, [dispatch, productData]);

  useEffect(() => {
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

  const handleSelectMethod = (method: "card" | "cod") => {
    if (method === "card") {
      setPaymentMethod("card");
      setShowCreditCardModal(true);
    } else if (method === "cod") {
      setPaymentMethod("cod");
    }
  };

  const productShippingFees = useMemo(() => {
    const destination = (selectedAddress?.country_code as DestinationKey) || "EG";

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
  }, [productData, selectedAddress]);

  const totalShippingFee = useMemo(
    () => productShippingFees.reduce((total, item) => total + item.fee, 0),
    [productShippingFees],
  );

  const subtotal = totalPrice;
  const shippingFee = totalShippingFee;
  const paymentFee = paymentMethod === "cod" ? 9.0 : 0;
  const total = subtotal + shippingFee + paymentFee;

  return {
    isClient,
    locale,
    productData,
    selectedAddress,
    paymentMethod,
    showAddressModal,
    showCreditCardModal,
    subtotal,
    shippingFee,
    paymentFee,
    total,
    productShippingFees,
    setShowAddressModal,
    setShowCreditCardModal,
    handleAddressSelect,
    handleSelectMethod,
    handleSubmit,
  };
}
