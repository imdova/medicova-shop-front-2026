"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { MessageSquare, ShieldCheck, Activity, Quote } from "lucide-react";

// Types & Data
import { Testimonial } from "@/types";
import { dummyTestimonials } from "@/constants/testimonials";
import { DynamicFilterItem } from "@/types/filters";

// Components
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import TestimonialFilters from "./components/TestimonialFilters";
import TestimonialTableContainer from "./components/TestimonialTableContainer";

export default function TestimonialsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTestimonials = useMemo(() => {
    return dummyTestimonials.filter((item) => {
      const name = item.name[locale] || "";
      const matchesSearch =
        !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery, locale]);

  const statusCounts = useMemo(() => {
    return dummyTestimonials.reduce(
      (acc: Record<string, number>, item) => {
        const status = item.status?.en || "draft";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { published: 0, draft: 0 },
    );
  }, []);

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
      id: "rating",
      label: { en: "Rating", ar: "التقييم" },
      type: "dropdown",
      options: [
        { id: "5", name: { en: "5 Stars", ar: "5 نجوم" } },
        { id: "4", name: { en: "4 Stars+", ar: "4 نجوم فأكثر" } },
        { id: "3", name: { en: "3 Stars+", ar: "3 نجوم فأكثر" } },
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
            <Quote className="text-amber-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("testimonials")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("testimonialsDescription")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-500">
              <ShieldCheck size={10} />
              Moderation Mode
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Status: <span className="text-gray-900">Synchronized</span>
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

      <TestimonialFilters
        locale={locale}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleFilters={() => setIsOpen(true)}
        onReset={handleReset}
        onCreate={() => router.push(`/${locale}/admin/testimonials/create`)}
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-gray-100/50 p-1 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-primary shadow-sm">
            <Activity size={14} />
            {t("allStatuses")}
          </div>
        </div>

        <p className="rounded-xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-sm">
          {filteredTestimonials.length} {t("testimonials")} {t("found")}
        </p>
      </div>

      <TestimonialTableContainer
        locale={locale}
        data={filteredTestimonials}
        onEdit={(t) =>
          router.push(`/${locale}/admin/testimonials/edit/${t.id}`)
        }
        onDelete={(t) => console.log("delete", t.id)}
      />
    </div>
  );
}
