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
import { SpecificationTable, Status } from "@/types/product";
import { dummySpecificationTables } from "@/constants/specificationTables";

// Translation dictionary
const translations = {
  en: {
    title: "Specification Tables",
    desc: "Manage specification tables to organize and display product specifications in structured formats",
    id: "ID",
    name: "Name",
    description: "Description",
    assignedGroups: "Assigned Groups",
    createdAt: "Created At",
    status: "Status",
    operations: "Operations",
    searchPlaceholder: "Search specification tables...",
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
    viewGroups: "View Groups",
    groupsCount: "groups",
    noGroups: "No groups assigned",
  },
  ar: {
    title: "جداول المواصفات",
    desc: "إدارة جداول المواصفات لتنظيم وعرض مواصفات المنتج في أشكال منظمة",
    id: "المعرف",
    name: "الاسم",
    description: "الوصف",
    assignedGroups: "المجموعات المعينة",
    createdAt: "تاريخ الإنشاء",
    status: "الحالة",
    operations: "العمليات",
    searchPlaceholder: "ابحث في جداول المواصفات...",
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
    viewGroups: "عرض المجموعات",
    groupsCount: "مجموعات",
    noGroups: "لا توجد مجموعات معينة",
  },
};

export default function SpecificationTablesListPanel() {
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
      render: (item: SpecificationTable) => (
        <span className="font-mono text-sm">#{item.id}</span>
      ),
    },
    {
      key: "name",
      header: translations[locale].name,
      sortable: true,
      render: (item: SpecificationTable) => (
        <Link
          className="font-medium text-primary hover:underline"
          href={`/admin/specification-tables/edit/${item.id}`}
        >
          {item.name[locale]}
        </Link>
      ),
    },
    {
      key: "description",
      header: translations[locale].description,
      sortable: true,
      render: (item: SpecificationTable) => (
        <span className="max-w-xs truncate text-sm text-gray-600">
          {item.description[locale]}
        </span>
      ),
    },
    {
      key: "assignedGroups",
      header: translations[locale].assignedGroups,
      sortable: false,
      render: (item: SpecificationTable) => (
        <div className="flex flex-wrap gap-1">
          {item.assignedGroups.length > 0 ? (
            <>
              {item.assignedGroups.slice(0, 2).map((group) => (
                <span
                  key={group.id}
                  className="inline-flex items-center gap-y-2 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-800"
                >
                  {group.name[locale]}
                </span>
              ))}
              {item.assignedGroups.length > 2 && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600">
                  +{item.assignedGroups.length - 2} {t.groupsCount}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-400">{t.noGroups}</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: translations[locale].createdAt,
      sortable: true,
      render: (item: SpecificationTable) => {
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
      render: (item: SpecificationTable) => {
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

  // Count tables by status for the summary cards
  const statusCounts = dummySpecificationTables.reduce(
    (acc: Record<Status, number>, table) => {
      const statusKey = table.status.en as Status;
      acc[statusKey] += 1;
      return acc;
    },
    { published: 0, draft: 0 },
  );

  return (
    <div className="relative space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h2 className="mb-1 text-2xl font-bold">{t.title}</h2>
        <p className="max-w-lg text-sm text-gray-600">{t.desc}</p>
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

      {/* Specification Tables Table */}
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
            href={`/admin/specification-tables/create`}
            className="flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-auto"
          >
            <Plus size={15} /> {t.create}
          </Link>
        </div>

        <DynamicTable
          data={dummySpecificationTables}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "name", direction: "asc" }}
          solidActions={[
            {
              label: "Edit",
              onClick: (item) =>
                router.push(`/admin/specification-tables/edit/${item.id}`),
              icon: <PencilIcon className="h-3 w-3" />,
              color: "#2563eb",
            },
            {
              label: "Delete",
              onClick: (item) => console.log(`Delete table: ${item.id}`),
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
