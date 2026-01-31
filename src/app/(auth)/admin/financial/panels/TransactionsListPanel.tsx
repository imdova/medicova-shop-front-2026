"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import Image from "next/image";
import DynamicTable from "@/components/UI/tables/DTable";
import { useLanguage } from "@/contexts/LanguageContext";
import { productFilters } from "@/constants/drawerFilter";
import { dummyCustomers } from "@/constants/customers";
import { dummyVendors } from "@/constants/vendors";
import { products } from "@/constants/products";
import { formatFullName } from "@/util";
import DynamicFilter from "@/components/UI/filter/DynamicFilter";
import { DynamicFilterItem } from "@/types/filters";
import SearchInput from "@/components/Forms/formFields/SearchInput";
import { Product } from "@/types/product";
import { Customer, VendorType } from "@/types/customers";

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

// ---------- Main Component ----------
export default function TransactionsListPanel() {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"customers" | "sellers">(
    "customers",
  );

  const ITEMS_PER_PAGE = 5;

  const t = {
    filters: language === "ar" ? "الفلاتر" : "Filters",
    search: language === "ar" ? "بحث" : "Search",
    create: language === "ar" ? "إضافة معاملة" : "Add Transaction",
    customers: language === "ar" ? "عملاء" : "Customers",
    sellers: language === "ar" ? "بائعين" : "Sellers",
    paid: language === "ar" ? "مدفوع" : "Paid",
    pending: language === "ar" ? "قيد الانتظار" : "Pending",
    reset: language === "ar" ? "إعادة تعيين" : "Reset",
    showData: language === "ar" ? "عرض البيانات" : "Show Data",
  };

  // ---------- Filters ----------
  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "dateRange",
      label: { en: "Date Range", ar: "نطاق التاريخ" },
      type: "date-range",
      visible: true,
    },
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "active", name: { en: "Active", ar: "نشط" } },
        { id: "inactive", name: { en: "Inactive", ar: "غير نشط" } },
      ],
      visible: true,
    },
    {
      id: "revenue",
      label: { en: "Revenue Range", ar: "نطاق الإيرادات" },
      type: "number-range",
      visible: true,
    },
  ];

  // ---------- Columns ----------
  const customerColumns = [
    { key: "id", header: "Invoice" },
    { key: "date", header: "Date" },
    {
      key: "product",
      header: "Product",
      render: (item: CustomerTransaction) => (
        <div className="flex items-center gap-2">
          <Image
            className="h-10 w-10 rounded object-cover"
            src={item.product.images[0]}
            alt={item.product.title[language]}
            width={40}
            height={40}
          />
          <span className="text-sm">{item.product.title[language]}</span>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (item: CustomerTransaction) => (
        <div className="flex items-center gap-2 text-sm">
          <Image
            src={item.customer.avatar ?? "/images/placeholder-avatar.png"}
            width={32}
            height={32}
            alt={item.customer.firstName}
            className="h-8 w-8 rounded object-cover"
          />
          <div>
            <div className="font-medium">
              {formatFullName(item.customer.firstName, item.customer.lastName)}
            </div>
            <div className="text-xs text-gray-500">{item.customer.phone}</div>
          </div>
        </div>
      ),
    },
    { key: "seller", header: "Seller" },
    {
      key: "total",
      header: "Total",
      render: (item: CustomerTransaction) => item.total[language],
    },
    {
      key: "status",
      header: "Status",
      render: (item: CustomerTransaction) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            item.status === "Paid"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {t[item.status.toLowerCase() as "paid" | "pending"]}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <button className="rounded border p-1 hover:bg-gray-100">
          <Download className="h-4 w-4 text-gray-600" />
        </button>
      ),
    },
  ];

  const sellerColumns = [
    { key: "id", header: "Transaction ID" },
    { key: "date", header: "Date" },
    {
      key: "seller",
      header: "Seller",
      render: (item: SellerTransaction) => (
        <div className="flex items-center gap-2">
          <Image
            src={item.seller.avatar ?? "/images/placeholder-avatar.png"}
            width={32}
            height={32}
            alt={item.seller.name}
            className="h-8 w-8 rounded object-cover"
          />
          <div>
            <div className="font-medium">{item.seller.name}</div>
            <div className="text-xs text-gray-500">{item.seller.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "totalSales",
      header: "Total Sales",
      render: (item: SellerTransaction) => item.totalSales[language],
    },
    {
      key: "location",
      header: "Location",
      render: (item: SellerTransaction) => item.location[language],
    },
    {
      key: "status",
      header: "Status",
      render: (item: SellerTransaction) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            item.status === "Paid"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {t[item.status.toLowerCase() as "paid" | "pending"]}
        </span>
      ),
    },
  ];

  return (
    <div className={`relative space-y-6 ${isRTL ? "text-right" : "text-left"}`}>
      {/* Filters Drawer */}
      <DynamicFilter
        t={t}
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
        locale={language}
        isRTL={isRTL}
        drawerFilters={productFilters}
        showViewToggle={false}
        filters={predefinedFilters}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        quickFiltersGridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      />

      {/* Transactions Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        {/* Top Bar */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
          >
            {t.filters}
          </button>
          <SearchInput locale={language} />
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-3 border-b">
          <button
            onClick={() => setActiveTab("customers")}
            className={`pb-2 text-sm font-medium ${
              activeTab === "customers"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-primary"
            }`}
          >
            {t.customers}
          </button>
          <button
            onClick={() => setActiveTab("sellers")}
            className={`pb-2 text-sm font-medium ${
              activeTab === "sellers"
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-primary"
            }`}
          >
            {t.sellers}
          </button>
        </div>

        {/* Dynamic Table */}
        {activeTab === "customers" ? (
          <DynamicTable<CustomerTransaction>
            data={customerTransactions}
            columns={customerColumns}
            pagination
            itemsPerPage={ITEMS_PER_PAGE}
            selectable
            locale={language}
          />
        ) : (
          <DynamicTable<SellerTransaction>
            data={sellerTransactions}
            columns={sellerColumns}
            pagination
            itemsPerPage={ITEMS_PER_PAGE}
            selectable
            locale={language}
          />
        )}
      </div>
    </div>
  );
}
