"use client";
import Link from "next/link";
import { PencilIcon, Plus, TrashIcon } from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import { useState } from "react";
import { LanguageType } from "@/util/translations";
import DynamicFilter from "@/components/UI/filter/DynamicFilter";
import SearchInput from "@/components/Forms/formFields/SearchInput";
import { DynamicFilterItem } from "@/types/filters";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { productFilters } from "@/constants/drawerFilter";
import { SpecificationGroup } from "@/types/product";
import { dummySpecificationGroups } from "@/constants/specificationGroups";

type Status = "published" | "draft";

// Translation dictionary
const translations = {
  en: {
    title: "Specification Groups",
    description:
      "Manage specification groups to organize product specifications and technical details",
    id: "ID",
    name: "Name",
    createdAt: "Created At",
    status: "Status",
    operations: "Operations",
    searchPlaceholder: "Search specification groups...",
    search: "Search",
    moreFilters: "More Filters",
    download: "Download",
    allStatuses: "All Statuses",
    active: "Active",
    draft: "Draft",
    reset: "Reset",
    showData: "Show Data",
    unknown: "Unknown",
    delete: "Delete",
    edit: "Edit",
    quickFilters: "Quick Filters",
    addFilter: "Add Filter",
    hideFilters: "Hide Filters",
    showFilters: "Show Filters",
    filters: "Filters",
    create: "Create ",
    technicalSpecifications: "Technical Specifications",
    physicalAttributes: "Physical Attributes",
    performanceMetrics: "Performance Metrics",
    compatibilityInfo: "Compatibility Info",
    safetyStandards: "Safety Standards",
    warrantyDetails: "Warranty Details",
    installationGuide: "Installation Guide",
    environmentalSpecs: "Environmental Specs",
  },
  ar: {
    title: "مجموعات المواصفات",
    description:
      "إدارة مجموعات المواصفات لتنظيم مواصفات المنتجات والتفاصيل الفنية",
    id: "المعرف",
    name: "الاسم",
    createdAt: "تاريخ الإنشاء",
    status: "الحالة",
    operations: "العمليات",
    searchPlaceholder: "ابحث في مجموعات المواصفات...",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    allStatuses: "كل الحالات",
    active: "نشط",
    draft: "مسودة",
    reset: "إعادة تعيين",
    showData: "عرض البيانات",
    unknown: "غير معروف",
    delete: "حذف",
    edit: "تعديل",
    quickFilters: "الفلاتر السريعة",
    addFilter: "إضافة فلتر",
    hideFilters: "إخفاء الفلاتر",
    showFilters: "عرض الفلاتر",
    filters: "فلاتر",
    create: "إنشاء",
    technicalSpecifications: "المواصفات الفنية",
    physicalAttributes: "الخصائص الفيزيائية",
    performanceMetrics: "مقاييس الأداء",
    compatibilityInfo: "معلومات التوافق",
    safetyStandards: "معايير السلامة",
    warrantyDetails: "تفاصيل الضمان",
    installationGuide: "دليل التثبيت",
    environmentalSpecs: "المواصفات البيئية",
  },
};

export default function SpecificationGroupsListPanel() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar";
  const ITEMS_PER_PAGE = 6;
  const router = useRouter();
  const toggle = () => setIsOpen((prev) => !prev);

  const getColumns = (locale: LanguageType) => [
    {
      key: "id",
      header: translations[locale].id,
      sortable: true,
      render: (item: SpecificationGroup) => (
        <span className="font-mono text-sm">#{item.id}</span>
      ),
    },
    {
      key: "name",
      header: translations[locale].name,
      sortable: true,
      render: (item: SpecificationGroup) => (
        <Link
          className="font-medium text-primary hover:underline"
          href={`/admin/specification-groups/edit/${item.id}`}
        >
          {item.name[locale]}
        </Link>
      ),
    },
    {
      key: "description",
      header: translations[locale].description,
      sortable: true,
      render: (item: SpecificationGroup) => (
        <span className="max-w-xs truncate text-sm text-gray-600">
          {item.description[locale]}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: translations[locale].createdAt,
      sortable: true,
      render: (item: SpecificationGroup) => {
        const date = new Date(item.createdAt);
        return (
          <span className="text-sm text-gray-600">
            {date.toLocaleDateString(locale === "en" ? "en-US" : "ar-EG", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        );
      },
    },
    {
      key: "status",
      header: translations[locale].status,
      render: (item: SpecificationGroup) => {
        const statusColor =
          item.status.en === "published"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-600";

        const statusText = item.status[locale] || translations[locale].unknown;
        const displayStatus =
          statusText.charAt(0).toUpperCase() + statusText.slice(1);

        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}
          >
            {displayStatus}
          </span>
        );
      },
      sortable: true,
    },
  ];

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "published", name: { en: "published", ar: "نشط" } },
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

  // Count groups by status for the summary cards
  const statusCounts = dummySpecificationGroups.reduce(
    (acc: Record<Status, number>, group) => {
      const statusKey = group.status.en as Status;
      acc[statusKey] += 1;
      return acc;
    },
    { published: 0, draft: 0 },
  );

  return (
    <div className="relative space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h2 className="mb-1 text-2xl font-bold">{t.title}</h2>
        <p className="max-w-lg text-sm text-gray-600">{t.description}</p>
      </div>

      <DynamicFilter
        t={t}
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
        locale={language}
        isRTL={isRTL}
        drawerFilters={productFilters}
        showViewToggle={false}
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
        quickFiltersGridCols="grid-cols-1 md:grid-cols-2"
      />

      {/* Specification Groups Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={toggle}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm"
          >
            {t.filters}
          </button>
          <SearchInput locale={language} />
          <Link
            href={`/admin/specification-groups/create`}
            className="flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-auto"
          >
            <Plus size={15} /> {t.create}
          </Link>
        </div>

        <DynamicTable
          data={dummySpecificationGroups}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "name", direction: "asc" }}
          solidActions={[
            {
              label: "Edit",
              onClick: (item) =>
                router.push(`/admin/specification-groups/edit/${item.id}`),
              icon: <PencilIcon className="h-3 w-3" />,
              color: "#2563eb",
            },
            {
              label: "Delete",
              onClick: (item) => console.log(`Delete group: ${item.id}`),
              color: "#dc2626",
              icon: <TrashIcon className="h-3 w-3" />,
            },
          ]}
          locale={language}
        />
      </div>
    </div>
  );
}
