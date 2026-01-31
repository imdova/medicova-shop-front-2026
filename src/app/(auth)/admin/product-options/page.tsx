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
import { ProductOption } from "@/types/product";
import { ProductOptions } from "@/constants/productOptions";
import { useRouter } from "next/navigation";

// Translation dictionary
const translations = {
  en: {
    title: "Product Options",
    description:
      "Define the available choices for this product such as size, color, or material",
    id: "ID",
    name: "Name",
    isRequired: "Is Required?",
    createdAt: "Created At",
    operations: "Operations",
    productName: "Product Name",
    date: "Date",
    sku: "SKU",
    seller: "Seller",
    category: "Category",
    subCategory: "Sub Category",
    brand: "Brand",
    unitPrice: "Unit Price",
    totalPurchase: "Total Purchase",
    searchPlaceholder: "Search",
    search: "Search",
    moreFilters: "More Filters",
    download: "Download",
    allStatuses: "All Statuses",
    active: "Active",
    pending: "Pending",
    draft: "Draft",
    allStock: "All Stock",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    selectCategory: "Select Category",
    medicalWear: "Medical Wear",
    selectSubCategory: "Select Sub Category",
    scrubs: "Scrubs",
    allBrand: "All brand",
    landeu: "Landeu",
    allSellers: "All Sellers",
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
    yes: "Yes",
    no: "No",
    required: "Required",
    optional: "Optional",
  },
  ar: {
    title: "خيارات المنتج",
    description:
      "قم بتحديد الخيارات المتاحة لهذا المنتج مثل الحجم أو اللون أو الخامة.",
    id: "المعرف",
    name: "الاسم",
    isRequired: "مطلوب؟",
    createdAt: "تاريخ الإنشاء",
    operations: "العمليات",
    productName: "اسم المنتج",
    date: "التاريخ",
    sku: "SKU",
    seller: "البائع",
    category: "الفئة",
    subCategory: "الفئة الفرعية",
    brand: "العلامة التجارية",
    unitPrice: "سعر الوحدة",
    totalPurchase: "إجمالي المشتريات",
    searchPlaceholder: "بحث",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    allStatuses: "كل الحالات",
    active: "نشط",
    pending: "نشر",
    draft: "مسودة",
    allStock: "كل المخزون",
    inStock: "متوفر",
    outOfStock: "غير متوفر",
    selectCategory: "اختر الفئة",
    medicalWear: "ملابس طبية",
    selectSubCategory: "اختر الفئة الفرعية",
    scrubs: "سكراب",
    allBrand: "كل العلامات",
    landeu: "لاندو",
    allSellers: "كل البائعين",
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
    create: "انشاء",
    yes: "نعم",
    no: "لا",
    required: "مطلوب",
    optional: "اختياري",
  },
};

const getColumns = (locale: LanguageType) => [
  {
    key: "id",
    header: translations[locale].id,
    sortable: true,
    render: (item: ProductOption) => (
      <span className="font-mono text-sm">#{item.id}</span>
    ),
  },
  {
    key: "name",
    header: translations[locale].name,
    sortable: true,
    render: (item: ProductOption) => (
      <Link
        className="font-medium text-primary hover:underline"
        href={`/admin/product-options/edit/${item.id}`}
      >
        {item.name[locale]}
      </Link>
    ),
  },
  {
    key: "isRequired",
    header: translations[locale].isRequired,
    sortable: true,
    render: (item: ProductOption) => {
      const isRequired = item.isRequired;
      const bgColor = isRequired ? "bg-red-100" : "bg-green-100";
      const textColor = isRequired ? "text-red-800" : "text-green-800";
      const text = isRequired
        ? translations[locale].yes
        : translations[locale].no;
      const badgeText = isRequired
        ? translations[locale].required
        : translations[locale].optional;

      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${bgColor} ${textColor}`}
        >
          {text} ({badgeText})
        </span>
      );
    },
  },
  {
    key: "createdAt",
    header: translations[locale].createdAt,
    sortable: true,
    render: (item: ProductOption) => {
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
];

export default function ProductOptionsListPanel() {
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
      id: "isRequired",
      label: { en: "Required", ar: "مطلوب" },
      type: "dropdown",
      options: [
        { id: "true", name: { en: "Required", ar: "مطلوب" } },
        { id: "false", name: { en: "Optional", ar: "اختياري" } },
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

  // Count options by required status for the summary cards
  const requiredCounts = ProductOptions.reduce(
    (acc: { required: number; optional: number }, option) => {
      if (option.isRequired) {
        acc.required += 1;
      } else {
        acc.optional += 1;
      }
      return acc;
    },
    { required: 0, optional: 0 },
  );

  return (
    <div className="relative space-y-6 p-4" dir={isRTL ? "rtl" : "ltr"}>
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
        statusCounts={requiredCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
        quickFiltersGridCols="grid-cols-1 md:grid-cols-2  "
      />

      {/* Product Options Table */}
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
            href={`/admin/product-options/create`}
            className="flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-auto"
          >
            <Plus size={15} /> {t.create}
          </Link>
        </div>
        <DynamicTable
          data={ProductOptions}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "name", direction: "asc" }}
          solidActions={[
            {
              label: "Edit",
              onClick: (item) =>
                router.push(`/admin/product-options/edit/${item.id}`),
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
