"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { RotateCcw, ShieldCheck, Activity } from "lucide-react";

// Types & Data
import { dummyCustomers } from "@/constants/customers";
import { products } from "@/data";
import { DynamicFilterItem } from "@/types/filters";

// Components
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import ReturnFilters from "./components/ReturnFilters";
import ReturnTableContainer from "./components/ReturnTableContainer";

// Dummy data for order returns (simplified for page usage)
const dummyOrderReturns = [
  {
    id: "RET-001",
    orderId: "ORD-2024-001",
    customer: dummyCustomers[0],
    productItems: [...products.slice(0, 2)],
    returnReason: "Product damaged upon arrival",
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "RET-002",
    orderId: "ORD-2024-002",
    customer: dummyCustomers[0],
    productItems: [...products.slice(0, 2)],
    returnReason: "Wrong size received",
    status: "approved",
    createdAt: "2024-01-14T14:20:00Z",
  },
  {
    id: "RET-003",
    orderId: "ORD-2024-003",
    customer: dummyCustomers[2],
    productItems: [...products.slice(0, 3)],
    returnReason: "Not as described",
    status: "rejected",
    createdAt: "2024-01-13T09:15:00Z",
  },
  {
    id: "RET-004",
    orderId: "ORD-2024-004",
    customer: dummyCustomers[1],
    productItems: [...products.slice(1, 3)],
    returnReason: "Changed my mind",
    status: "processed",
    createdAt: "2024-01-12T16:45:00Z",
  },
  {
    id: "RET-005",
    orderId: "ORD-2024-005",
    customer: dummyCustomers[0],
    productItems: [...products.slice(0, 2)],
    returnReason: "Defective product",
    status: "refunded",
    createdAt: "2024-01-11T11:20:00Z",
  },
];

export default function OrderReturnsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReturns = useMemo(() => {
    return dummyOrderReturns.filter((item) => {
      const customerName =
        `${item.customer.firstName} ${item.customer.lastName}`.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        customerName.includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orderId.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery]);

  const statusCounts = useMemo(() => {
    return dummyOrderReturns.reduce(
      (acc: Record<string, number>, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, processed: 0, refunded: 0 },
    );
  }, []);

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
        { id: "approved", name: { en: "Approved", ar: "معتمد" } },
        { id: "rejected", name: { en: "Rejected", ar: "مرفوض" } },
        { id: "processed", name: { en: "Processed", ar: "تم المعالجة" } },
        { id: "refunded", name: { en: "Refunded", ar: "تم الاسترداد" } },
      ],
      visible: true,
    },
    {
      id: "dateRange",
      label: { en: "Date Range", ar: "نطاق التاريخ" },
      type: "date-range",
      visible: true,
    },
  ];

  const handleReset = () => {
    setSearchQuery("");
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <RotateCcw className="text-rose-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("returnsDescription").split(" ")[0]} {t("returns")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("returnsDescription")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-rose-500">
              <ShieldCheck size={10} />
              Refund Protection
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Escrow: <span className="text-gray-900">Active Monitoring</span>
            </span>
          </div>
        </div>
      </div>

      <DynamicFilter
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
        drawerFilters={[]}
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
      />

      <ReturnFilters
        locale={locale}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleFilters={() => setIsOpen(true)}
        onReset={handleReset}
        onCreate={() => router.push(`/${locale}/admin/returns/create`)}
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-gray-100/50 p-1 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-primary shadow-sm">
            <Activity size={14} />
            {t("allStatuses")}
          </div>
        </div>

        <p className="rounded-xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-sm">
          {filteredReturns.length} {t("returns")} {t("found")}
        </p>
      </div>

      <ReturnTableContainer
        locale={locale}
        data={filteredReturns}
        onView={(item) => router.push(`/${locale}/admin/returns/${item.id}`)}
        onDelete={(item) => console.log("delete", item.id)}
      />
    </div>
  );
}
