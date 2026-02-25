"use client";

import { useTranslations } from "next-intl";

export default function CheckoutHeader() {
  const t = useTranslations("cart");

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {t("checkout")}
      </h1>
      <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
    </div>
  );
}
