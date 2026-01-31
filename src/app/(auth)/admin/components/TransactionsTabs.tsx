"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import Image from "next/image";
import DynamicTable from "@/components/UI/tables/DTable";
import { LanguageType } from "@/util/translations";
import { formatFullName } from "@/util";
import { Product } from "@/types/product";
import { Customer, VendorType } from "@/types/customers";
import { products } from "@/constants/products";
import { dummyCustomers } from "@/constants/customers";
import { dummyVendors } from "@/constants/vendors";
import { Card } from "@/components/UI/card";

// ---------- Types ----------
type PaymentMethod = "visa" | "paypal" | "mastercard" | "cash";

type LocalizedText = {
  en: string;
  ar: string;
};

type CustomerTransaction = {
  id: string;
  date: string;
  product: Product;
  customer: Customer;
  seller: string;
  unitPrice: LocalizedText;
  quantity: LocalizedText;
  total: LocalizedText;
  payment: { method: PaymentMethod; last4: string };
  status: "Paid" | "Pending" | "Failed" | "Refunded";
};

type SellerTransaction = {
  id: string;
  date: string;
  seller: VendorType;
  productCount: number;
  totalSales: LocalizedText;
  location: LocalizedText;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
};

// ---------- Dummy Data ----------
const customerTransactions: CustomerTransaction[] = [
  {
    id: "142548",
    date: "15/5/2025",
    product: products[0],
    customer: dummyCustomers[1],
    seller: "Brandova",
    unitPrice: { en: "800 EGP", ar: "٨٠٠ جنيه" },
    quantity: { en: "4 units", ar: "٤ وحدات" },
    total: { en: "3200 EGP", ar: "٣٢٠٠ جنيه" },
    payment: { method: "visa", last4: "1452" },
    status: "Paid",
  },
];

const sellerTransactions: SellerTransaction[] = [
  {
    id: "STX-1035",
    date: "15/5/2025",
    seller: dummyVendors[0],
    productCount: 52,
    totalSales: { en: "160,000 EGP", ar: "١٦٠,٠٠٠ جنيه" },
    location: { en: "Alexandria", ar: "الإسكندرية" },
    status: "Paid",
  },
  {
    id: "STX-1036",
    date: "14/5/2025",
    seller: dummyVendors[1],
    productCount: 38,
    totalSales: { en: "112,500 EGP", ar: "١١٢,٥٠٠ جنيه" },
    location: { en: "Giza", ar: "الجيزة" },
    status: "Pending",
  },
];

const translations = {
  invoice: { en: "Invoice", ar: "فاتورة" },
  date: { en: "Date", ar: "التاريخ" },
  product: { en: "Product", ar: "المنتج" },
  customer: { en: "Customer", ar: "العميل" },
  seller: { en: "Seller", ar: "البائع" },
  total: { en: "Total", ar: "الإجمالي" },
  status: { en: "Status", ar: "الحالة" },
  transactionId: { en: "Transaction ID", ar: "معرف المعاملة" },
  productCount: { en: "Products", ar: "المنتجات" },
  totalSales: { en: "Total Sales", ar: "إجمالي المبيعات" },
  location: { en: "Location", ar: "الموقع" },
  paid: { en: "Paid", ar: "مدفوع" },
  pending: { en: "Pending", ar: "قيد الانتظار" },
  failed: { en: "Failed", ar: "فاشل" },
  refunded: { en: "Refunded", ar: "مرتجع" },
};

// ---------- Main Component ----------
export default function TransactionsTabs({
  locale = "en",
}: {
  locale: LanguageType;
}) {
  const [activeTab, setActiveTab] = useState<"customers" | "sellers">(
    "customers",
  );
  const isRTL = locale === "ar";

  const ITEMS_PER_PAGE = 5;

  // ---------- Columns ----------
  const customerColumns = [
    {
      key: "id",
      header: translations.invoice[locale],
    },
    {
      key: "date",
      header: translations.date[locale],
    },
    {
      key: "product",
      header: translations.product[locale],
      render: (item: CustomerTransaction) => (
        <div className="flex items-center gap-2">
          <Image
            className="h-8 w-8 rounded object-cover"
            src={item.product.images[0]}
            alt={item.product.title[locale]}
            width={32}
            height={32}
          />
          <span className="text-sm">{item.product.title[locale]}</span>
        </div>
      ),
    },
    {
      key: "customer",
      header: translations.customer[locale],
      render: (item: CustomerTransaction) => (
        <div className="flex items-center gap-2">
          <Image
            src={item.customer.avatar ?? "/images/placeholder-avatar.png"}
            width={28}
            height={28}
            alt={item.customer.firstName}
            className="h-7 w-7 rounded object-cover"
          />
          <div>
            <div className="text-xs font-medium">
              {formatFullName(item.customer.firstName, item.customer.lastName)}
            </div>
            <div className="text-xs text-gray-500">{item.customer.phone}</div>
          </div>
        </div>
      ),
    },
    {
      key: "seller",
      header: translations.seller[locale],
    },
    {
      key: "total",
      header: translations.total[locale],
      render: (item: CustomerTransaction) => (
        <span className="text-xs font-medium">{item.total[locale]}</span>
      ),
    },
    {
      key: "status",
      header: translations.status[locale],
      render: (item: CustomerTransaction) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            item.status === "Paid"
              ? "bg-green-100 text-green-700"
              : item.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : item.status === "Failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
          }`}
        >
          {
            translations[
              item.status.toLowerCase() as keyof typeof translations
            ][locale]
          }
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <button className="rounded border p-1 hover:bg-gray-100">
          <Download className="h-3 w-3 text-gray-600" />
        </button>
      ),
    },
  ];

  const sellerColumns = [
    {
      key: "id",
      header: translations.transactionId[locale],
    },
    {
      key: "date",
      header: translations.date[locale],
    },
    {
      key: "seller",
      header: translations.seller[locale],
      render: (item: SellerTransaction) => (
        <div className="flex items-center gap-2">
          <Image
            src={item.seller.avatar ?? "/images/placeholder-avatar.png"}
            width={28}
            height={28}
            alt={item.seller.name}
            className="h-7 w-7 rounded object-cover"
          />
          <div>
            <div className="text-xs font-medium">{item.seller.name}</div>
            <div className="text-xs text-gray-500">{item.seller.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "productCount",
      header: translations.productCount[locale],
      render: (item: SellerTransaction) => (
        <span className="text-xs">{item.productCount}</span>
      ),
    },
    {
      key: "totalSales",
      header: translations.totalSales[locale],
      render: (item: SellerTransaction) => (
        <span className="text-xs font-medium">{item.totalSales[locale]}</span>
      ),
    },
    {
      key: "location",
      header: translations.location[locale],
      render: (item: SellerTransaction) => (
        <span className="text-xs">{item.location[locale]}</span>
      ),
    },
    {
      key: "status",
      header: translations.status[locale],
      render: (item: SellerTransaction) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            item.status === "Paid"
              ? "bg-green-100 text-green-700"
              : item.status === "Pending"
                ? "bg-yellow-100 text-yellow-700"
                : item.status === "Failed"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
          }`}
        >
          {
            translations[
              item.status.toLowerCase() as keyof typeof translations
            ][locale]
          }
        </span>
      ),
    },
  ];

  return (
    <Card dir={isRTL ? "rtl" : "ltr"} className="space-y-4 p-4">
      {/* Tabs Header */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("customers")}
          className={`pb-2 text-sm font-medium transition ${
            activeTab === "customers"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-500 hover:text-green-600"
          }`}
        >
          {locale === "ar" ? "عملاء" : "Customers"}
        </button>
        <button
          onClick={() => setActiveTab("sellers")}
          className={`pb-2 text-sm font-medium transition ${
            activeTab === "sellers"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-500 hover:text-green-600"
          }`}
        >
          {locale === "ar" ? "بائعين" : "Sellers"}
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {activeTab === "customers" ? (
          <DynamicTable<CustomerTransaction>
            data={customerTransactions}
            columns={customerColumns}
            pagination
            itemsPerPage={ITEMS_PER_PAGE}
            selectable
            locale={locale}
            minWidth={800}
          />
        ) : (
          <DynamicTable<SellerTransaction>
            data={sellerTransactions}
            columns={sellerColumns}
            pagination
            itemsPerPage={ITEMS_PER_PAGE}
            selectable
            locale={locale}
            minWidth={800}
          />
        )}
      </div>
    </Card>
  );
}
