"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Settings2, ShieldCheck, Activity } from "lucide-react";

// Types & Data
import { dummySpecificationAttributes } from "@/constants/specificationAttributes";
import { DynamicFilterItem } from "@/types/filters";

// Components
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import AttributeFilters from "./components/AttributeFilters";
import AttributeTableContainer from "./components/AttributeTableContainer";

export default function SpecificationAttributesPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAttributes = useMemo(() => {
    return dummySpecificationAttributes.filter((item) => {
      const name = item.name[locale] || "";
      const matchesSearch =
        !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery, locale]);

  const statusCounts = useMemo(() => {
    return dummySpecificationAttributes.reduce(
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
      id: "fieldType",
      label: { en: "Field Type", ar: "نوع الحقل" },
      type: "dropdown",
      options: [
        { id: "text", name: { en: "Text", ar: "نص" } },
        { id: "number", name: { en: "Number", ar: "رقم" } },
        { id: "boolean", name: { en: "Boolean", ar: "منطقي" } },
        { id: "select", name: { en: "Select", ar: "قائمة" } },
        { id: "textarea", name: { en: "Text Area", ar: "منطقة نص" } },
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
            <Settings2 className="text-emerald-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("title")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">{t("description")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
              <ShieldCheck size={10} />
              Attributes Defined
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Validation: <span className="text-gray-900">Active</span>
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
        drawerFilters={[]}
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
      />

      <AttributeFilters

        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleFilters={() => setIsOpen(true)}
        onReset={handleReset}
        onCreate={() =>
          router.push(`/${locale}/admin/specification-attributes/create`)
        }
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-white/60 bg-gray-100/50 p-1 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-primary shadow-sm">
            <Activity size={14} />
            {t("allStatuses")}
          </div>
        </div>

        <p className="rounded-xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-sm">
          {filteredAttributes.length} {t("title")} {t("found")}
        </p>
      </div>

      <AttributeTableContainer
        data={filteredAttributes}

        onEdit={(item) =>
          router.push(
            `/${locale}/admin/specification-attributes/edit/${item.id}`,
          )
        }
        onDelete={(item) => console.log("delete", item.id)}
      />
    </div>
  );
}
