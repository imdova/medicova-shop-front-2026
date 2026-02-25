"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { CircleDollarSign, Users, Store, Wallet, Activity } from "lucide-react";

// Types & Data
import { dummyCustomers } from "@/constants/customers";
import { dummyVendors } from "@/constants/vendors";
import { products } from "@/data";
import { Product } from "@/types/product";
import { Customer, VendorType } from "@/types/customers";

// Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/Tabs";
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import TransactionTableContainer from "../components/TransactionTableContainer";
import SearchInput from "@/components/forms/Forms/formFields/SearchInput";

type PaymentMethod = "visa" | "paypal" | "mastercard" | "cash";

type LocalizedText = { en: string; ar: string };

type CustomerTransaction = {
  id: string;
  date: string;
  product: Product;
  customer: Customer;
  seller: string;
  total: LocalizedText;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
};

type SellerTransaction = {
  id: string;
  date: string;
  seller: VendorType;
  totalSales: LocalizedText;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
};

const customerTransactions: CustomerTransaction[] = [
  {
    id: "142548",
    date: "15/5/2025",
    product: products[0],
    customer: dummyCustomers[1],
    seller: "Brandova",
    total: { en: "3200 EGP", ar: "٣٢٠٠ جنيه" },
    status: "Paid",
  },
];

const sellerTransactions: SellerTransaction[] = [
  {
    id: "STX-1035",
    date: "15/5/2025",
    seller: dummyVendors[0],
    totalSales: { en: "160,000 EGP", ar: "١٦٠,٠٠٠ جنيه" },
    status: "Paid",
  },
];

export default function TransactionsListPanel() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  const [activeTab, setActiveTab] = useState<string>("customers");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
          <TabsList className="rounded-2xl border border-white/60 bg-gray-100/50 p-1.5 backdrop-blur-sm">
            <TabsTrigger
              value="customers"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
            >
              <Users className="size-4" />
              {t("customers")}
            </TabsTrigger>
            <TabsTrigger
              value="sellers"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
            >
              <Store className="size-4" />
              {t("sellers")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <SearchInput />
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-12 items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-6 text-sm font-bold text-gray-600 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:text-primary"
          >
            {t("filters")}
          </button>
        </div>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsContent
          value="customers"
          className="mt-0 focus-visible:outline-none"
        >
          <TransactionTableContainer
            data={customerTransactions}
            type="customers"

          />
        </TabsContent>
        <TabsContent
          value="sellers"
          className="mt-0 focus-visible:outline-none"
        >
          <TransactionTableContainer
            data={sellerTransactions}
            type="sellers"

          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
