import Avatar from "@/components/UI/Avatar";
import React from "react";
import { LanguageType } from "@/util/translations";

interface CustomerItemProps {
  id: string;
  name: string;
  phone: string;
  orders: number;
  avatarUrl?: string;
  locale: LanguageType;
}

const translations = {
  en: {
    orders: "Orders",
  },
  ar: {
    orders: "عدد الطلبات",
  },
};

const CustomerItem: React.FC<CustomerItemProps> = ({
  name,
  phone,
  orders,
  avatarUrl,
  locale,
}) => {
  const isArabic = locale === "ar";

  return (
    <div
      className={`flex items-center justify-between border-b border-gray-100 py-3 ${
        isArabic ? "rtl" : "ltr"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div
        className={`flex items-center ${isArabic ? "space-x-3 space-x-reverse" : "space-x-3"}`}
      >
        <Avatar
          name={name}
          imageUrl={avatarUrl}
          className="h-10 w-10"
          RandomColor
        />
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{phone}</p>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {translations[locale].orders}: {orders}
      </div>
    </div>
  );
};

export default CustomerItem;
