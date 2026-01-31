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
import { FlashSale } from "@/types/product";
import { FlashSalesData } from "@/constants/flashSales";

// Translation dictionary
const translations = {
  en: {
    title: "Flash Sales",
    description:
      "Manage time-limited promotional sales with special discounts and offers",
    id: "ID",
    name: "Name",
    endDate: "End Date",
    createdAt: "Created At",
    status: "Status",
    operations: "Operations",
    searchPlaceholder: "Search flash sales...",
    search: "Search",
    moreFilters: "More Filters",
    download: "Download",
    allStatuses: "All Statuses",
    published: "Published",
    upcoming: "Upcoming",
    expired: "Expired",
    draft: "Draft",
    reset: "Reset",
    showData: "Show Data",
    delete: "Delete",
    edit: "Edit",
    quickFilters: "Quick Filters",
    addFilter: "Add Filter",
    hideFilters: "Hide Filters",
    showFilters: "Show Filters",
    filters: "Filters",
    create: "Create ",
    daysLeft: "days left",
    hoursLeft: "hours left",
    expiredAgo: "expired",
    draftStatus: "Draft",
    statusCounts: "Status Summary",
    totalSales: "Total Flash Sales",
  },
  ar: {
    title: "التخفيضات السريعة",
    description:
      "إدارة التخفيضات الترويجية المحدودة الوقت مع خصومات وعروض خاصة",
    id: "المعرف",
    name: "الاسم",
    endDate: "تاريخ الانتهاء",
    createdAt: "تاريخ الإنشاء",
    status: "الحالة",
    operations: "العمليات",
    searchPlaceholder: "ابحث في التخفيضات السريعة...",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    allStatuses: "كل الحالات",
    published: "نشر",
    upcoming: "قادم",
    expired: "منتهي",
    draft: "مسودة",
    reset: "إعادة تعيين",
    showData: "عرض البيانات",
    delete: "حذف",
    edit: "تعديل",
    quickFilters: "الفلاتر السريعة",
    addFilter: "إضافة فلتر",
    hideFilters: "إخفاء الفلاتر",
    showFilters: "عرض الفلاتر",
    filters: "فلاتر",
    create: "إنشاء",
    daysLeft: "يوم متبقي",
    hoursLeft: "ساعة متبقية",
    expiredAgo: "منتهي منذ",
    draftStatus: "مسودة",
    statusCounts: "ملخص الحالة",
    totalSales: "إجمالي التخفيضات السريعة",
  },
};

const getColumns = (locale: LanguageType) => [
  {
    key: "id",
    header: translations[locale].id,
    sortable: true,
    render: (item: FlashSale) => (
      <span className="font-mono text-sm">#{item.id}</span>
    ),
  },
  {
    key: "name",
    header: translations[locale].name,
    sortable: true,
    render: (item: FlashSale) => (
      <Link
        className="font-medium text-primary hover:underline"
        href={`/admin/flash-sales/edit/${item.id}`}
      >
        {item.name[locale]}
      </Link>
    ),
  },
  {
    key: "endDate",
    header: translations[locale].endDate,
    sortable: true,
    render: (item: FlashSale) => {
      const endDate = new Date(item.endDate);

      return (
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">
            {endDate.toLocaleDateString(locale === "en" ? "en-US" : "ar-EG", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      );
    },
  },
  {
    key: "createdAt",
    header: translations[locale].createdAt,
    sortable: true,
    render: (item: FlashSale) => {
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
    sortable: true,
    render: (item: FlashSale) => {
      const statusConfig = {
        published: {
          color: "bg-green-100 text-green-800",
          text: translations[locale].published,
        },
        expired: {
          color: "bg-red-100 text-red-800",
          text: translations[locale].expired,
        },
        draft: {
          color: "bg-gray-100 text-gray-800",
          text: translations[locale].draft,
        },
      };

      const config = statusConfig[item.status];

      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.color}`}
        >
          {config.text}
        </span>
      );
    },
  },
];

export default function FlashSalesListPanel() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const router = useRouter();
  const t = translations[language];
  const isRTL = language === "ar";
  const ITEMS_PER_PAGE = 6;
  const toggle = () => setIsOpen((prev) => !prev);

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "active", name: { en: "Active", ar: "نشط" } },
        { id: "upcoming", name: { en: "Upcoming", ar: "قادم" } },
        { id: "expired", name: { en: "Expired", ar: "منتهي" } },
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

  // Count flash sales by status for the summary cards
  const statusCounts = FlashSalesData.reduce(
    (acc: { published: number; expired: number; draft: number }, sale) => {
      acc[sale.status] += 1;
      return acc;
    },
    { published: 0, expired: 0, draft: 0 },
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
        drawerFilters={[]} // You can add specific flash sale filters here if needed
        showViewToggle={false}
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
        quickFiltersGridCols="grid-cols-1 md:grid-cols-2"
      />

      {/* Flash Sales Table */}
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
            href={`/admin/flash-sales/create`}
            className="flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-auto"
          >
            <Plus size={15} /> {t.create}
          </Link>
        </div>
        <DynamicTable
          data={FlashSalesData}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "endDate", direction: "asc" }}
          solidActions={[
            {
              label: "Edit",
              onClick: (item) =>
                router.push(`/admin/flash-sales/edit/${item.id}`),
              icon: <PencilIcon className="h-3 w-3" />,
              color: "#2563eb",
            },
            {
              label: "Delete",
              onClick: () => console.log("Deleted"),
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
