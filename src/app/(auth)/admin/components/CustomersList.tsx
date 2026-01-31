import React from "react";
import CustomerItem from "./CustomerItem";
import { LanguageType } from "@/util/translations";

type CustomersListProps = {
  locale: LanguageType;
};

const translations = {
  en: {
    topCustomers: "Top Customers",
    viewAll: "View All >",
  },
  ar: {
    topCustomers: "أفضل العملاء",
    viewAll: "عرض الكل >",
  },
};

const CustomersList: React.FC<CustomersListProps> = ({ locale }) => {
  const customers = [
    { id: "1", name: "Dianne Russell", phone: "017*****58", orders: 30 },
    { id: "2", name: "Wade Warren", phone: "017*****58", orders: 30 },
    { id: "3", name: "Albert Flores", phone: "017*****58", orders: 35 },
    { id: "4", name: "Bessie Cooper", phone: "017*****58", orders: 20 },
    { id: "5", name: "Arlene McCoy", phone: "017*****58", orders: 25 },
    { id: "6", name: "Arlene McCoy", phone: "017*****58", orders: 32 },
  ];

  const isArabic = locale === "ar";

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {translations[locale].topCustomers}
        </h2>
        <button className="text-sm text-green-600 hover:text-green-800">
          {translations[locale].viewAll}
        </button>
      </div>
      <div className="space-y-2">
        {customers.map((customer) => (
          <CustomerItem key={customer.id} locale={locale} {...customer} />
        ))}
      </div>
    </div>
  );
};

export default CustomersList;
