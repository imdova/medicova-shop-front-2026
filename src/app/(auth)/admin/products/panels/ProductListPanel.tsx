"use client";
import Link from "next/link";
import { PencilIcon, Plus, TrashIcon } from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import { useMemo, useState } from "react";
import { products } from "@/constants/products";
import { Product } from "@/types/product";
import { productFilters } from "@/constants/drawerFilter";
import Image from "next/image";
import { LanguageType } from "@/util/translations";
import DynamicFilter from "@/components/UI/filter/DynamicFilter";
import SearchInput from "@/components/Forms/formFields/SearchInput";
import { DynamicFilterItem } from "@/types/filters";

type Status = "active" | "pending" | "draft";

// Translation dictionary
const translations = {
  en: {
    productName: "Product Name",
    date: "Date",
    sku: "SKU",
    seller: "Seller",
    category: "Category",
    subCategory: "Sub Category",
    brand: "Brand",
    unitPrice: "Unit Price",
    totalPurchase: "Total Purchase",
    status: "Status",
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
  },
  ar: {
    productName: "اسم المنتج",
    date: "التاريخ",
    sku: "SKU",
    seller: "البائع",
    category: "الفئة",
    subCategory: "الفئة الفرعية",
    brand: "العلامة التجارية",
    unitPrice: "سعر الوحدة",
    totalPurchase: "إجمالي المشتريات",
    status: "الحالة",
    searchPlaceholder: "بحث",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    allStatuses: "كل الحالات",
    active: "نشط",
    pending: "قيد الانتظار",
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
  },
};

const getColumns = (locale: LanguageType) => [
  {
    key: "title",
    header: translations[locale].productName,
    sortable: true,
    render: (item: Product) => (
      <div className="flex gap-2">
        <Image
          className="w-10 rounded-md object-cover"
          src={item.images?.[0] || "/images/placeholder.jpg"}
          width={300}
          height={300}
          alt={item.title[locale]}
        />
        <Link
          className="line-clamp-2 hover:underline"
          href={`products/${item.id}`}
        >
          {item.title[locale]}
        </Link>
      </div>
    ),
  },
  {
    key: "date",
    header: translations[locale].date,
    sortable: true,
    render: () => "15/5/2023",
  },
  {
    key: "id",
    header: translations[locale].sku,
    sortable: true,
  },
  {
    key: "seller",
    header: translations[locale].seller,
    sortable: true,
    render: () => "Brandona",
  },
  {
    key: "category",
    header: translations[locale].category,
    sortable: true,
    render: (item: Product) => (
      <span>
        {item.category?.title[locale] || translations[locale].medicalWear}
      </span>
    ),
  },
  {
    key: "subcategory",
    header: translations[locale].subCategory,
    sortable: true,
    render: () => translations[locale].scrubs,
  },
  {
    key: "brand",
    header: translations[locale].brand,
    sortable: true,
    render: () => translations[locale].landeu,
  },
  {
    key: "price",
    header: translations[locale].unitPrice,
    render: (item: Product) => `${item.price} EGP`,
    sortable: true,
  },
  {
    key: "totalPurchase",
    header: translations[locale].totalPurchase,
    render: () => "160000 EGP",
    sortable: true,
  },
  {
    key: "status",
    header: translations[locale].status,
    render: (item: Product) => {
      const statusColor =
        item.status?.en === "active"
          ? "bg-green-100 text-green-800"
          : item.status?.en === "pending"
            ? "bg-yellow-100 text-yellow-800"
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

export default function ProductListPanel({
  locale = "en",
}: {
  locale: LanguageType;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[locale];
  const isRTL = locale === "ar";
  const currentPage = 1;
  const ITEMS_PER_PAGE = 6;
  const toggle = () => setIsOpen((prev) => !prev);

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "category",
      label: { en: "Category", ar: "الفئة" },
      type: "dropdown",
      options: [
        { id: "electronics", name: { en: "Electronics", ar: "إلكترونيات" } },
        { id: "books", name: { en: "Books", ar: "كتب" } },
        { id: "clothing", name: { en: "Clothing", ar: "ملابس" } },
      ],
      visible: true,
    },
    {
      id: "priceRange",
      label: { en: "Price Range", ar: "نطاق السعر" },
      type: "number-range",
      visible: true,
    },
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "active", name: { en: "Active", ar: "نشط" } },
        { id: "inactive", name: { en: "Inactive", ar: "غير نشط" } },
        { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
      ],
      visible: true,
    },
  ];

  // Count products by status for the summary cards
  const statusCounts = products.reduce(
    (acc: Record<Status, number>, product) => {
      if (
        product.status?.en === "active" ||
        product.status?.en === "pending" ||
        product.status?.en === "draft"
      ) {
        const statusKey = product.status.en as Status;
        acc[statusKey] += 1;
      }
      return acc;
    },
    { active: 0, pending: 0, draft: 0 },
  );

  // handle pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  return (
    <div className="relative space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <DynamicFilter
        t={t}
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
        locale={locale} // Set the current locale
        isRTL={false} // Set based on locale
        drawerFilters={productFilters} // Pass your main filter data
        showViewToggle={false}
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
        quickFiltersGridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 "
      />

      {/* Products Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={toggle}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm"
          >
            {t.filters}
          </button>
          <SearchInput locale={locale} />
          <Link
            href={"/admin/create-product"}
            className="flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-auto"
          >
            <Plus size={15} /> {t.create}
          </Link>
        </div>
        <DynamicTable
          data={paginatedProducts}
          columns={getColumns(locale)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "title", direction: "asc" }}
          actions={[
            {
              label: t.edit,
              onClick: () => console.log("edited"),
              className:
                "bg-white text-gray-700 hover:text-blue-700 hover:bg-blue-50 ",
              icon: <PencilIcon className="h-4 w-4" />,
            },
            {
              label: t.delete,
              onClick: () => console.log("Deleted"),
              className:
                "bg-white text-gray-700 hover:text-red-700 hover:bg-red-50 ",
              icon: <TrashIcon className="h-4 w-4" />,
            },
          ]}
          solidActions={[
            {
              onClick: () => console.log("edited"),
              icon: <PencilIcon className="h-4 w-4" />,
              color: "#2563eb",
            },
            {
              onClick: () => console.log("Deleted"),
              color: "#dc2626",
              icon: <TrashIcon className="h-4 w-4" />,
            },
          ]}
          locale={locale}
          minWidth={1300}
        />
      </div>
    </div>
  );
}
