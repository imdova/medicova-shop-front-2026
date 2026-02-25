"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Truck, ShieldCheck, Activity, PackageCheck } from "lucide-react";

// Types & Data
import { Shipment } from "@/types/product";
import { dummyShipments } from "@/constants/shipments";
import { DynamicFilterItem } from "@/types/filters";
import { productFilters } from "@/constants/drawerFilter";
import { formatDate } from "@/util/dateUtils";

// Components
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import ShipmentFilters from "./components/ShipmentFilters";
import ShipmentTableContainer from "./components/ShipmentTableContainer";

export default function ShipmentsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (startDate)
      params.set("start_date", formatDate(startDate, "yyyy-MM-dd"));
    else params.delete("start_date");
    if (endDate) params.set("end_date", formatDate(endDate, "yyyy-MM-dd"));
    else params.delete("end_date");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [startDate, endDate]);

  const filteredShipments = useMemo(() => {
    return dummyShipments.filter((shipment) => {
      const matchesSearch =
        !searchQuery ||
        shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.customer.firstName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        shipment.customer.lastName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery, locale]);

  const statusCounts = useMemo(
    () =>
      dummyShipments.reduce((acc: Record<string, number>, shipment) => {
        const status = shipment.status[locale];
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
    [locale],
  );

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
        { id: "processing", name: { en: "Processing", ar: "قيد المعالجة" } },
        { id: "shipped", name: { en: "Shipped", ar: "تم الشحن" } },
        { id: "delivered", name: { en: "Delivered", ar: "تم التوصيل" } },
      ],
      visible: true,
    },
  ];

  const handleDateChange = (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const handleReset = () => {
    setSearchQuery("");
    setStartDate(null);
    setEndDate(null);
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <Truck className="text-primary" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("shipments")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("manageShipments")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-500">
              <PackageCheck size={10} />
              Logistics Hub
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Live Tracker: <span className="text-gray-900">Active</span>
            </span>
          </div>
        </div>
      </div>

      <DynamicFilter
        t={{
          filters: t("filters"),
          reset: t("reset"),
          showData: t("showData"),
        }}
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}

        isRTL={isArabic}
        drawerFilters={productFilters}
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
      />

      <ShipmentFilters

        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleFilters={() => setIsOpen(true)}
        onDateChange={handleDateChange}
        onReset={handleReset}
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-gray-100/50 p-1 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-primary shadow-sm">
            <Activity size={14} />
            {t("allStatuses")}
          </div>
        </div>

        <p className="rounded-xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-sm">
          {filteredShipments.length} {t("shipments")} {t("found")}
        </p>
      </div>

      <ShipmentTableContainer
        data={filteredShipments}

        onEdit={(s) => router.push(`/${locale}/admin/shipments/edit/${s.id}`)}
        onDelete={(s) => console.log("delete", s.id)}
      />
    </div>
  );
}
