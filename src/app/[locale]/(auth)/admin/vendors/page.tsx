"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Users, ShieldCheck, Activity, Award } from "lucide-react";

// Types & Data
import { VendorType } from "@/types/customers";
import { dummyVendors } from "@/constants/vendors";
import { DynamicFilterItem } from "@/types/filters";

// Components
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import VendorFilters from "./components/VendorFilters";
import VendorTableContainer from "./components/VendorTableContainer";
import AddVendorModal from "../components/AddVendorModal";

export default function VendorsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredVendors = useMemo(() => {
    return dummyVendors.filter((vendor) => {
      const matchesSearch =
        !searchQuery ||
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery]);

  const vendorStatusCounts = useMemo(() => {
    return dummyVendors.reduce((acc: Record<string, number>, vendor) => {
      acc[vendor.status] = (acc[vendor.status] || 0) + 1;
      return acc;
    }, {});
  }, []);

  const predefinedFilters: DynamicFilterItem[] = [
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
      id: "verified",
      label: { en: "Verified", ar: "موثق" },
      type: "dropdown",
      options: [
        { id: "true", name: { en: "Verified", ar: "موثق" } },
        { id: "false", name: { en: "Not Verified", ar: "غير موثق" } },
      ],
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
            <Users className="text-emerald-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("vendors")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("vendorsDescription")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
              <Award size={10} />
              Verified Network
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Network Status: <span className="text-gray-900">Optimal</span>
            </span>
          </div>
        </div>
      </div>

      <DynamicFilter
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
        drawerFilters={[]}
        statusCounts={vendorStatusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
      />

      <VendorFilters
        locale={locale}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleFilters={() => setIsOpen(true)}
        onReset={handleReset}
        onCreate={() => setIsModalOpen(true)}
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-gray-100/50 p-1 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-primary shadow-sm">
            <Activity size={14} />
            {t("allSellers")}
          </div>
        </div>

        <p className="rounded-xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-sm">
          {filteredVendors.length} {t("vendors")} {t("found")}
        </p>
      </div>

      <VendorTableContainer
        locale={locale}
        data={filteredVendors}
        onView={(v) => router.push(`/${locale}/admin/vendors/${v.id}`)}
        onEdit={(v) => router.push(`/${locale}/admin/vendors/edit/${v.id}`)}
        onDelete={(v) => console.log("delete", v.id)}
      />

      <AddVendorModal
        locale={locale}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
}
