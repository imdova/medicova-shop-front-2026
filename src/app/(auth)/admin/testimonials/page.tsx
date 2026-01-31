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
import Image from "next/image";
import { Testimonial } from "@/types";
import { dummyTestimonials } from "@/constants/testimonials";

type Status = "published" | "draft";

// Translation dictionary
const translations = {
  en: {
    title: "Testimonials",
    description: "Manage customer testimonials and reviews for your website.",
    id: "ID",
    image: "Image",
    name: "Name",
    createdAt: "Created At",
    status: "Status",
    operations: "Operations",
    searchPlaceholder: "Search testimonials...",
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
    create: "Create New Testimonial",
    customerName: "Customer Name",
    testimonial: "Testimonial",
    rating: "Rating",
  },
  ar: {
    title: "آراء العملاء",
    description: "إدارة آراء وتقييمات العملاء لموقعك الإلكتروني.",
    id: "المعرف",
    image: "الصورة",
    name: "الاسم",
    createdAt: "تاريخ الإنشاء",
    status: "الحالة",
    operations: "العمليات",
    searchPlaceholder: "بحث في آراء العملاء...",
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
    create: "إنشاء رأي جديد",
    customerName: "اسم العميل",
    testimonial: "الرأي",
    rating: "التقييم",
  },
};

const getColumns = (locale: LanguageType) => [
  {
    key: "id",
    header: translations[locale].id,
    sortable: true,
    render: (item: Testimonial) => (
      <span className="font-mono text-sm">#{item.id}</span>
    ),
  },
  {
    key: "name",
    header: translations[locale].name,
    sortable: true,
    render: (item: Testimonial) => (
      <Link
        className="flex items-center gap-2 font-medium text-primary hover:underline"
        href={`/admin/testimonials/edit/${item.id}`}
      >
        <Image
          width={100}
          height={100}
          src={item.image}
          alt={item.name[locale]}
          className="h-10 w-10 rounded-full object-cover"
        />
        {item.name[locale]}
      </Link>
    ),
  },
  {
    key: "createdAt",
    header: translations[locale].createdAt,
    sortable: true,
    render: (item: Testimonial) => {
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
    render: (item: Testimonial) => {
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

export default function TestimonialsListPanel() {
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
      id: "dateRange",
      label: { en: "Date Range", ar: "نطاق التاريخ" },
      type: "date-range",
      visible: true,
    },
  ];

  // Count testimonials by status for the summary cards
  const statusCounts = dummyTestimonials.reduce(
    (acc: Record<Status, number>, testimonial) => {
      if (
        testimonial.status?.en === "published" ||
        testimonial.status?.en === "draft"
      ) {
        const statusKey = testimonial.status.en as Status;
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

      {/* Testimonials Table */}
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
            href={`/admin/testimonials/create`}
            className="flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-auto"
          >
            <Plus size={15} /> {t.create}
          </Link>
        </div>
        <DynamicTable
          data={dummyTestimonials}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "name", direction: "asc" }}
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
