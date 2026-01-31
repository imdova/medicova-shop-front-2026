"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "./DynamicModal";
import { LanguageType, t } from "@/util/translations";

type CreditCardFormData = {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  rememberCard: boolean;
};

type CreditCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreditCardFormData) => void;
  locale: LanguageType;
};

export default function CreditCardModal({
  isOpen,
  onClose,
  onSubmit,
  locale,
}: CreditCardModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreditCardFormData>({
    defaultValues: {
      rememberCard: true,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(" ") : value;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setValue("cardNumber", formattedValue);
  };

  const handleExpiryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "expiryMonth" | "expiryYear",
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setValue(field, value.slice(0, 2));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setValue("cvv", value.slice(0, 3));
  };

  const submitHandler = async (data: CreditCardFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear() % 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {t("paymentMethod", locale)}
          </h3>
        </div>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("cardNumber", locale)}
            </label>
            <div className="mt-1">
              <input
                type="text"
                className={`block w-full rounded-md border outline-none ${
                  errors.cardNumber
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                } p-2 shadow-sm`}
                placeholder={t("cardNumberPlaceholder", locale)}
                {...register("cardNumber", {
                  required: t("cardNumberRequired", locale),
                  validate: (value) => {
                    const digits = value.replace(/\s/g, "");
                    return (
                      digits.length === 16 || t("invalidCardNumber", locale)
                    );
                  },
                })}
                onChange={handleCardNumberChange}
                maxLength={19}
              />
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.cardNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("expiryDate", locale)}
              </label>
              <div className="mt-1 flex space-x-2">
                <input
                  type="text"
                  placeholder="MM"
                  className={`block w-full rounded-md border outline-none ${
                    errors.expiryMonth
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  } p-2 shadow-sm`}
                  {...register("expiryMonth", {
                    required: t("monthRequired", locale),
                    validate: (value) => {
                      const month = parseInt(value, 10);
                      return (
                        (month >= 1 && month <= 12) || t("invalidMonth", locale)
                      );
                    },
                  })}
                  onChange={(e) => handleExpiryChange(e, "expiryMonth")}
                  maxLength={2}
                />
                <span className="flex items-center">/</span>
                <input
                  type="text"
                  placeholder="YY"
                  className={`block w-full rounded-md border outline-none ${
                    errors.expiryYear
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  } p-2 shadow-sm`}
                  {...register("expiryYear", {
                    required: t("yearRequired", locale),
                    validate: (value) => {
                      const year = parseInt(value, 10);
                      return (
                        year >= currentYear ||
                        (locale === "ar"
                          ? `يجب أن تكون السنة ${currentYear} أو أحدث`
                          : `Year must be ${currentYear} or later`)
                      );
                    },
                  })}
                  onChange={(e) => handleExpiryChange(e, "expiryYear")}
                  maxLength={2}
                />
              </div>
              {(errors.expiryMonth || errors.expiryYear) && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.expiryMonth?.message || errors.expiryYear?.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t("cvv", locale)}
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder={t("code", locale)}
                  className={`block w-full rounded-md border outline-none ${
                    errors.cvv
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  } p-2 shadow-sm`}
                  {...register("cvv", {
                    required: t("cvvRequired", locale),
                    validate: (value) => {
                      return value.length === 3 || t("cvvInvalid", locale);
                    },
                  })}
                  onChange={handleCvvChange}
                  maxLength={3}
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.cvv.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberCard"
              className="h-4 w-4 rounded border-gray-300 accent-primary"
              {...register("rememberCard")}
            />
            <label
              htmlFor="rememberCard"
              className="ml-2 block text-sm text-gray-700"
            >
              {t("rememberCard", locale)}
              <span className="block text-xs text-gray-500">
                {t("rememberCardNote", locale)}
              </span>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("processing", locale) : t("addCard", locale)}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
