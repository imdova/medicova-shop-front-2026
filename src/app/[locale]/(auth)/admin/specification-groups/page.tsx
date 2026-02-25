"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Layers, ShieldCheck, Activity } from "lucide-react";

// Types & Data
import { dummySpecificationGroups } from "@/constants/specificationGroups";
import { DynamicFilterItem } from "@/types/filters";

// Components
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import GroupFilters from "./components/GroupFilters";
import GroupTableContainer from "./components/GroupTableContainer";

export default function SpecificationGroupsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(() => {
    return dummySpecificationGroups.filter((item) => {
      const name = item.name[locale] || "";
      const matchesSearch =
        !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery, locale]);

  const statusCounts = useMemo(() => {
    return dummySpecificationGroups.reduce(
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
            <Layers className="text-blue-500" size={32} />
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
            <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-500">
              <ShieldCheck size={10} />
              Groups Verified
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Architecture: <span className="text-gray-900">Optimal</span>
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

      <GroupFilters

        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleFilters={() => setIsOpen(true)}
        onReset={handleReset}
        onCreate={() =>
          router.push(`/${locale}/admin/specification-groups/create`)
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
          {filteredGroups.length} {t("title")} {t("found")}
        </p>
      </div>

      <GroupTableContainer
        data={filteredGroups}

        onEdit={(item) =>
          router.push(`/${locale}/admin/specification-groups/edit/${item.id}`)
        }
        onDelete={(item) => console.log("delete", item.id)}
      />
    </div>
  );
}
