"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  HelpCircle,
  ShieldCheck,
  Activity,
  MessageSquarePlus,
} from "lucide-react";

// Types & Data
import { FAQ } from "@/types";
import { dummyFAQs } from "@/constants/faqs";
import { DynamicFilterItem } from "@/types/filters";
import { productFilters } from "@/constants/drawerFilter";

// Components
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import FAQFilters from "./components/FAQFilters";
import FAQTableContainer from "./components/FAQTableContainer";

export default function FAQsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = useMemo(() => {
    return dummyFAQs.filter((faq) => {
      const matchesSearch =
        !searchQuery ||
        faq.question[locale]
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        faq.category[locale].toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery, locale]);

  const statusCounts = useMemo(
    () =>
      dummyFAQs.reduce(
        (acc: Record<string, number>, faq) => {
          const status = faq.status.en;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        { published: 0, draft: 0 },
      ),
    [locale],
  );

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "published", name: { en: "Published", ar: "منشور" } },
        { id: "draft", name: { en: "Draft", ar: "مسودة" } },
      ],
      visible: true,
    },
    {
      id: "category",
      label: { en: "Category", ar: "الفئة" },
      type: "dropdown",
      options: [
        { id: "account", name: { en: "Account", ar: "الحساب" } },
        { id: "payments", name: { en: "Payments", ar: "المدفوعات" } },
        { id: "shipping", name: { en: "Shipping", ar: "الشحن" } },
        { id: "orders", name: { en: "Orders", ar: "الطلبات" } },
        { id: "returns", name: { en: "Returns", ar: "الإرجاع" } },
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
            <HelpCircle className="text-indigo-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("faqs")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("faqsDescription")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-indigo-500">
              <ShieldCheck size={10} />
              Support Hub
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Knowledge Base: <span className="text-gray-900">Active</span>
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

      <FAQFilters

        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleFilters={() => setIsOpen(true)}
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
          {filteredFAQs.length} {t("faqs")} {t("found")}
        </p>
      </div>

      <FAQTableContainer
        data={filteredFAQs}

        onEdit={(f) => router.push(`/${locale}/admin/faqs/edit/${f.id}`)}
        onDelete={(f) => console.log("delete", f.id)}
      />
    </div>
  );
}
