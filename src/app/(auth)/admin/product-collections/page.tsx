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
import { useRouter } from "next/navigation";
import { ProductCollection } from "@/types/product";
import { ProductCollections } from "@/constants/productCollection";
import Image from "next/image";

// Translation dictionary
const translations = {
  en: {
    title: "Product Collections",
    description:
      "Manage your product collections and organize related products",
    id: "ID",
    image: "Image",
    name: "Name",
    slug: "Slug",
    createdAt: "Created At",
    status: "Status",
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
    searchPlaceholder: "Search collections...",
    search: "Search",
    moreFilters: "More Filters",
    download: "Download",
    allStatuses: "All Statuses",
    published: "Published",
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
    create: "Create Collection",
    view: "View",
    collections: "Collections",
    featured: "Featured",
    seasonal: "Seasonal",
    newArrivals: "New Arrivals",
  },
  ar: {
    title: "مجموعات المنتجات",
    description: "إدارة مجموعات المنتجات الخاصة بك وتنظيم المنتجات ذات الصلة",
    id: "المعرف",
    image: "الصورة",
    name: "الاسم",
    slug: "الرابط",
    createdAt: "تاريخ الإنشاء",
    status: "الحالة",
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
    searchPlaceholder: "بحث في المجموعات...",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    allStatuses: "كل الحالات",
    published: "نشر",
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
    create: "إنشاء مجموعة",
    view: "عرض",
    collections: "المجموعات",
    featured: "مميز",
    seasonal: "موسمي",
    newArrivals: "وصل حديثاً",
  },
};

const getColumns = (locale: LanguageType) => [
  {
    key: "id",
    header: translations[locale].id,
    sortable: true,
    render: (item: ProductCollection) => (
      <span className="font-mono text-sm">#{item.id}</span>
    ),
  },
  {
    key: "image",
    header: translations[locale].image,
    sortable: false,
    render: (item: ProductCollection) => (
      <div className="h-12 w-12 overflow-hidden rounded-md border border-gray-200">
        <Image
          width={100}
          height={100}
          src={item.image}
          alt={item.name[locale]}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
          }}
        />
      </div>
    ),
  },
  {
    key: "name",
    header: translations[locale].name,
    sortable: true,
    render: (item: ProductCollection) => (
      <Link
        className="font-medium text-primary hover:underline"
        href={`/admin/product-collections/edit/${item.id}`}
      >
        {item.name[locale]}
      </Link>
    ),
  },
  {
    key: "slug",
    header: translations[locale].slug,
    sortable: true,
    render: (item: ProductCollection) => (
      <span className="text-sm text-gray-600">{item.slug}</span>
    ),
  },
  {
    key: "createdAt",
    header: translations[locale].createdAt,
    sortable: true,
    render: (item: ProductCollection) => {
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
    render: (item: ProductCollection) => {
      const statusConfig = {
        published: {
          bg: "bg-green-100",
          text: "text-green-800",
          label: translations[locale].published,
        },

        draft: {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          label: translations[locale].draft,
        },
      };

      const config = statusConfig[item.status];

      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.bg} ${config.text}`}
        >
          {config.label}
        </span>
      );
    },
  },
];

export default function ProductCollectionsListPanel() {
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
        { id: "inactive", name: { en: "Inactive", ar: "غير نشط" } },
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

  // Count collections by status for the summary cards
  const statusCounts = ProductCollections.reduce(
    (acc: { published: number; draft: number }, collection) => {
      acc[collection.status] += 1;
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
        quickFiltersGridCols="grid-cols-1 md:grid-cols-3"
      />

      {/* Product Collections Table */}
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
            href={`/admin/product-collections/create`}
            className="flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-auto"
          >
            <Plus size={15} /> {t.create}
          </Link>
        </div>
        <DynamicTable
          data={ProductCollections}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "name", direction: "asc" }}
          solidActions={[
            {
              label: "Edit",
              onClick: (item) =>
                router.push(`/admin/product-collections/edit/${item.id}`),
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
