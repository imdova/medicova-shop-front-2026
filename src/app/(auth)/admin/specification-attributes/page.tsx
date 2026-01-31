"use client";
import Link from "next/link";
import {
  PencilIcon,
  Plus,
  SquareArrowOutUpRight,
  TrashIcon,
} from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import { useState } from "react";
import { LanguageType } from "@/util/translations";
import DynamicFilter from "@/components/UI/filter/DynamicFilter";
import SearchInput from "@/components/Forms/formFields/SearchInput";
import { DynamicFilterItem } from "@/types/filters";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { productFilters } from "@/constants/drawerFilter";
import { SpecificationAttribute, Status } from "@/types/product";
import { dummySpecificationAttributes } from "@/constants/specificationAttributes";

// Translation dictionary
const translations = {
  en: {
    title: "Specification Attributes",
    description:
      "Manage specification attributes to define product characteristics and technical details",
    id: "ID",
    name: "Name",
    associatedGroup: "Associated Group",
    fieldType: "Field Type",
    createdAt: "Created At",
    status: "Status",
    operations: "Operations",
    searchPlaceholder: "Search specification attributes...",
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
    create: "Create",
    fieldTypes: {
      text: "Text",
      number: "Number",
      boolean: "Boolean",
      select: "Select",
      textarea: "Text Area",
    },
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
    title: "سمات المواصفات",
    description: "إدارة سمات المواصفات لتحديد خصائص المنتج والتفاصيل الفنية",
    id: "المعرف",
    name: "الاسم",
    associatedGroup: "المجموعة المرتبطة",
    fieldType: "نوع الحقل",
    createdAt: "تاريخ الإنشاء",
    status: "الحالة",
    operations: "العمليات",
    searchPlaceholder: "ابحث في سمات المواصفات...",
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
    fieldTypes: {
      text: "نص",
      number: "رقم",
      boolean: "منطقي",
      select: "قائمة",
      textarea: "منطقة نص",
    },
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

export default function SpecificationAttributesListPanel() {
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
      render: (item: SpecificationAttribute) => (
        <span className="font-mono text-sm">#{item.id}</span>
      ),
    },
    {
      key: "name",
      header: translations[locale].name,
      sortable: true,
      render: (item: SpecificationAttribute) => (
        <Link
          className="font-medium text-primary hover:underline"
          href={`/admin/specification-attributes/edit/${item.id}`}
        >
          {item.name[locale]}
        </Link>
      ),
    },
    {
      key: "associatedGroup",
      header: translations[locale].associatedGroup,
      sortable: true,
      render: (item: SpecificationAttribute) => (
        <Link
          href={`/admin/specification-groups/edit/${item.associatedGroup.id}`}
          className="flex items-center gap-1 text-sm text-gray-600 hover:underline"
          target="_blank"
        >
          {item.associatedGroup?.name[locale]}
          <SquareArrowOutUpRight className="w-2.h-2.5 h-2.5" />
        </Link>
      ),
    },
    {
      key: "fieldType",
      header: translations[locale].fieldType,
      sortable: true,
      render: (item: SpecificationAttribute) => {
        const fieldTypeColors = {
          text: "bg-blue-100 text-blue-800",
          number: "bg-green-100 text-green-800",
          boolean: "bg-purple-100 text-purple-800",
          select: "bg-orange-100 text-orange-800",
          textarea: "bg-indigo-100 text-indigo-800",
        };

        const fieldTypeText = t.fieldTypes[item.fieldType];

        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${fieldTypeColors[item.fieldType]}`}
          >
            {fieldTypeText}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: translations[locale].createdAt,
      sortable: true,
      render: (item: SpecificationAttribute) => {
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
      render: (item: SpecificationAttribute) => {
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
    {
      id: "dateRange",
      label: { en: "Date Range", ar: "نطاق التاريخ" },
      type: "date-range",
      visible: true,
    },
  ];

  // Count attributes by status for the summary cards
  const statusCounts = dummySpecificationAttributes.reduce(
    (acc: Record<Status, number>, attribute) => {
      const statusKey = attribute.status.en as Status;
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
        showMoreFilters={true}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
        quickFiltersGridCols="grid-cols-1 md:grid-cols-2"
      />

      {/* Specification Attributes Table */}
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
            href={`/admin/specification-attributes/create`}
            className="flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-auto"
          >
            <Plus size={15} /> {t.create}
          </Link>
        </div>

        <DynamicTable
          data={dummySpecificationAttributes}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "name", direction: "asc" }}
          solidActions={[
            {
              label: "Edit",
              onClick: (item) =>
                router.push(`/admin/specification-attributes/edit/${item.id}`),
              icon: <PencilIcon className="h-3 w-3" />,
              color: "#2563eb",
            },
            {
              label: "Delete",
              onClick: (item) => console.log(`Delete attribute: ${item.id}`),
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
