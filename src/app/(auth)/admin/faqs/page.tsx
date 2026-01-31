"use client";
import Link from "next/link";
import { PencilIcon, Plus, TrashIcon } from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import { useState } from "react";
import { productFilters } from "@/constants/drawerFilter";
import { LanguageType } from "@/util/translations";
import DynamicFilter from "@/components/UI/filter/DynamicFilter";
import SearchInput from "@/components/Forms/formFields/SearchInput";
import { DynamicFilterItem } from "@/types/filters";
import { useLanguage } from "@/contexts/LanguageContext";
import { FAQ } from "@/types";
import { dummyFAQs } from "@/constants/faqs";

type Status = "published" | "draft";

// Translation dictionary
const translations = {
  en: {
    title: "FAQs",
    description: "Manage frequently asked questions for your website.",
    id: "ID",
    question: "Question",
    category: "Category",
    createdAt: "Created At",
    status: "Status",
    operations: "Operations",
    searchPlaceholder: "Search FAQs...",
    search: "Search",
    moreFilters: "More Filters",
    download: "Download",
    allStatuses: "All Statuses",
    active: "Active",
    pending: "Pending",
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
    create: "Create New FAQ",
    allCategories: "All Categories",
    account: "Account",
    payments: "Payments",
    shipping: "Shipping",
    orders: "Orders",
    returns: "Returns",
    pricing: "Pricing",
  },
  ar: {
    title: "الأسئلة الشائعة",
    description: "إدارة الأسئلة الشائعة لموقعك الإلكتروني.",
    id: "المعرف",
    question: "السؤال",
    category: "الفئة",
    createdAt: "تاريخ الإنشاء",
    status: "الحالة",
    operations: "العمليات",
    searchPlaceholder: "بحث في الأسئلة الشائعة...",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    allStatuses: "كل الحالات",
    active: "نشط",
    pending: "معلق",
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
    create: "إنشاء سؤال جديد",
    allCategories: "كل الفئات",
    account: "الحساب",
    payments: "المدفوعات",
    shipping: "الشحن",
    orders: "الطلبات",
    returns: "الإرجاع",
    pricing: "التسعير",
  },
};

const getColumns = (locale: LanguageType) => [
  {
    key: "id",
    header: translations[locale].id,
    sortable: true,
    render: (item: FAQ) => (
      <span className="font-mono text-sm">#{item.id}</span>
    ),
  },
  {
    key: "question",
    header: translations[locale].question,
    sortable: true,
    render: (item: FAQ) => (
      <Link
        className="font-medium text-primary hover:underline"
        href={`/admin/faqs/edit/${item.id}`}
      >
        {item.question[locale]}
      </Link>
    ),
  },
  {
    key: "category",
    header: translations[locale].category,
    sortable: true,
    render: (item: FAQ) => (
      <span className="text-sm text-gray-600">{item.category[locale]}</span>
    ),
  },
  {
    key: "createdAt",
    header: translations[locale].createdAt,
    sortable: true,
    render: (item: FAQ) => {
      const date = new Date(item.createdAt);
      return (
        <span className="text-sm text-gray-600">
          {date.toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}
        </span>
      );
    },
  },
  {
    key: "status",
    header: translations[locale].status,
    render: (item: FAQ) => {
      const statusColor =
        item.status?.en === "published"
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600";
      const statusText = item.status?.[locale] || translations[locale].unknown;
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

export default function FAQsListPanel() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
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
        { id: "pricing", name: { en: "Pricing", ar: "التسعير" } },
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

  // Count FAQs by status for the summary cards
  const statusCounts = dummyFAQs.reduce(
    (acc: Record<Status, number>, faq) => {
      if (faq.status?.en === "published" || faq.status?.en === "draft") {
        const statusKey = faq.status.en as Status;
        acc[statusKey] += 1;
      }
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

      {/* FAQs Table */}
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
            href={`/admin/faqs/create`}
            className="flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-auto"
          >
            <Plus size={15} /> {t.create}
          </Link>
        </div>
        <DynamicTable
          data={dummyFAQs}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "question", direction: "asc" }}
          solidActions={[
            {
              label: "Edit",
              onClick: () => console.log("edited"),
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
