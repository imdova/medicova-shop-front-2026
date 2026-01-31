"use client";
import Link from "next/link";
import { ExternalLink, PencilIcon, TrashIcon } from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import { useState } from "react";
import { LanguageType } from "@/util/translations";
import DynamicFilter from "@/components/UI/filter/DynamicFilter";
import SearchInput from "@/components/Forms/formFields/SearchInput";
import { DynamicFilterItem } from "@/types/filters";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { productFilters } from "@/constants/drawerFilter";
import { Shipment } from "@/types/product";
import { dummyShipments } from "@/constants/shipments";

// Translation dictionary
const translations = {
  en: {
    title: "Shipments",
    description: "Manage and track all shipments and delivery operations",
    id: "ID",
    orderId: "Order ID",
    customer: "Customer",
    shippingAmount: "Shipping Amount",
    status: "Status",
    codStatus: "COD Status",
    createdAt: "Created At",
    operations: "Operations",
    searchPlaceholder: "Search shipments...",
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
    statuses: {
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
    },
    codStatuses: {
      pending: "Pending",
      paid: "Paid",
      failed: "Failed",
      refunded: "Refunded",
    },
  },
  ar: {
    title: "الشحنات",
    description: "إدارة وتتبع جميع عمليات الشحن والتوصيل",
    id: "المعرف",
    orderId: "رقم الطلب",
    customer: "العميل",
    shippingAmount: "مبلغ الشحن",
    status: "الحالة",
    codStatus: "حالة الدفع عند الاستلام",
    createdAt: "تاريخ الإنشاء",
    operations: "العمليات",
    searchPlaceholder: "ابحث في الشحنات...",
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
    statuses: {
      pending: "قيد الانتظار",
      processing: "قيد المعالجة",
      shipped: "تم الشحن",
      delivered: "تم التوصيل",
      cancelled: "ملغى",
      returned: "تم الإرجاع",
    },
    codStatuses: {
      pending: "قيد الانتظار",
      paid: "تم الدفع",
      failed: "فشل",
      refunded: "تم الاسترداد",
    },
  },
};

export default function ShipmentsListPanel() {
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
      render: (item: Shipment) => (
        <span className="font-mono text-sm">#{item.id}</span>
      ),
    },
    {
      key: "orderId",
      header: translations[locale].orderId,
      sortable: true,
      render: (item: Shipment) => (
        <Link
          className="flex items-center gap-1 font-medium text-primary hover:underline"
          href={`/admin/orders/edit/${item.orderId}`}
        >
          {item.orderId} <ExternalLink className="text-gr h-4 w-3" />
        </Link>
      ),
    },
    {
      key: "customer",
      header: translations[locale].customer,
      sortable: true,
      render: (item: Shipment) => (
        <div>
          <div className="font-medium text-gray-900">{`${item.customer.firstName} ${item.customer.lastName}`}</div>
          <div className="text-xs text-gray-600">{item.customer.email}</div>
          <div className="text-xs text-gray-500">{item.customer.phone}</div>
        </div>
      ),
    },
    {
      key: "shippingAmount",
      header: translations[locale].shippingAmount,
      sortable: true,
      render: (item: Shipment) => (
        <span className="font-medium text-green-600">
          ${item.shippingAmount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: translations[locale].status,
      render: (item: Shipment) => {
        const statusColors = {
          Pending: "bg-yellow-100 text-yellow-800",
          Processing: "bg-blue-100 text-blue-800",
          Shipped: "bg-purple-100 text-purple-800",
          Delivered: "bg-green-100 text-green-800",
          Cancelled: "bg-red-100 text-red-800",
          Returned: "bg-orange-100 text-orange-800",
          Approved: "bg-teal-100 text-teal-800",
        };

        const statusText =
          t.statuses[item.status[language] as keyof typeof t.statuses] ||
          t.unknown;
        const displayStatus =
          statusText.charAt(0).toUpperCase() + statusText.slice(1);

        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              statusColors[item.status["en"]]
            }`}
          >
            {displayStatus}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: "codStatus",
      header: translations[locale].codStatus,
      render: (item: Shipment) => {
        const codStatusColors = {
          Pending: "bg-yellow-100 text-yellow-800",
          Paid: "bg-green-100 text-green-800",
          Failed: "bg-red-100 text-red-800",
          Refunded: "bg-gray-100 text-gray-800",
          Available: "bg-blue-100 text-blue-800",
          "Not available": "bg-slate-200 text-slate-800",
        };

        const codStatusText =
          t.codStatuses[
            item.codStatus[language] as keyof typeof t.codStatuses
          ] || t.unknown;
        const displayCodStatus =
          codStatusText.charAt(0).toUpperCase() + codStatusText.slice(1);

        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              codStatusColors[item.codStatus["en"]]
            }`}
          >
            {displayCodStatus}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: "createdAt",
      header: translations[locale].createdAt,
      sortable: true,
      render: (item: Shipment) => {
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

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "حالة الشحنة" },
      type: "dropdown",
      options: [
        { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
        { id: "processing", name: { en: "Processing", ar: "قيد المعالجة" } },
        { id: "shipped", name: { en: "Shipped", ar: "تم الشحن" } },
        { id: "delivered", name: { en: "Delivered", ar: "تم التوصيل" } },
        { id: "cancelled", name: { en: "Cancelled", ar: "ملغى" } },
        { id: "returned", name: { en: "Returned", ar: "تم الإرجاع" } },
      ],
      visible: true,
    },
    {
      id: "codStatus",
      label: { en: "COD Status", ar: "حالة الدفع عند الاستلام" },
      type: "dropdown",
      options: [
        { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
        { id: "paid", name: { en: "Paid", ar: "تم الدفع" } },
        { id: "failed", name: { en: "Failed", ar: "فشل" } },
        { id: "refunded", name: { en: "Refunded", ar: "تم الاسترداد" } },
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

  // Count shipments by status for the summary cards
  const statusCounts = dummyShipments.reduce(
    (acc: Record<string, number>, shipment) => {
      acc[shipment.status[language]] =
        (acc[shipment.status[language]] || 0) + 1;
      return acc;
    },
    {},
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

      {/* Shipments Table */}
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
        </div>

        <DynamicTable
          data={dummyShipments}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "createdAt", direction: "desc" }}
          solidActions={[
            {
              label: "Edit",
              onClick: (item) =>
                router.push(`/admin/shipments/edit/${item.id}`),
              icon: <PencilIcon className="h-3 w-3" />,
              color: "#2563eb",
            },
            {
              label: "Delete",
              onClick: (item) => console.log(`Delete shipment: ${item.id}`),
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
