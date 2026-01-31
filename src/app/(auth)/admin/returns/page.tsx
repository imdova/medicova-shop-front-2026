"use client";
import Link from "next/link";
import { TrashIcon, EyeIcon, Mail, Download } from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import { useState } from "react";
import { LanguageType } from "@/util/translations";
import DynamicFilter from "@/components/UI/filter/DynamicFilter";
import SearchInput from "@/components/Forms/formFields/SearchInput";
import { DynamicFilterItem } from "@/types/filters";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { productFilters } from "@/constants/drawerFilter";
import Image from "next/image";
import Dropdown, { DropdownOption } from "@/components/UI/DropDownMenu";
import { Customer } from "@/types/customers";
import { Product } from "@/types/product";
import { dummyCustomers } from "@/constants/customers";
import { products } from "@/constants/products";
import { formatFullName } from "@/util";

// Types for Order Returns
interface OrderReturnType {
  id: string;
  orderId: string;
  customer: Customer;
  productItems: Product[];
  returnReason: string;
  status: "pending" | "approved" | "rejected" | "processed" | "refunded";
  createdAt: string;
}

// Dummy data for order returns
const dummyOrderReturns: OrderReturnType[] = [
  {
    id: "RET-001",
    orderId: "ORD-2024-001",
    customer: dummyCustomers[0],
    productItems: [...products.slice(0, 2)],
    returnReason: "Product damaged upon arrival",
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "RET-002",
    orderId: "ORD-2024-002",
    customer: dummyCustomers[0],
    productItems: [...products.slice(0, 2)],
    returnReason: "Wrong size received",
    status: "approved",
    createdAt: "2024-01-14T14:20:00Z",
  },
  {
    id: "RET-003",
    orderId: "ORD-2024-003",
    customer: dummyCustomers[2],
    productItems: [...products.slice(0, 3)],
    returnReason: "Not as described",
    status: "rejected",
    createdAt: "2024-01-13T09:15:00Z",
  },
  {
    id: "RET-004",
    orderId: "ORD-2024-004",
    customer: dummyCustomers[1],
    productItems: [...products.slice(1, 3)],
    returnReason: "Changed my mind",
    status: "processed",
    createdAt: "2024-01-12T16:45:00Z",
  },
  {
    id: "RET-005",
    orderId: "ORD-2024-005",
    customer: dummyCustomers[0],
    productItems: [...products.slice(0, 2)],
    returnReason: "Defective product",
    status: "refunded",
    createdAt: "2024-01-11T11:20:00Z",
  },
  {
    id: "RET-006",
    orderId: "ORD-2024-006",
    customer: dummyCustomers[0],
    productItems: [...products.slice(0, 2)],
    returnReason: "Received wrong color",
    status: "pending",
    createdAt: "2024-01-10T13:10:00Z",
  },
];

// Translation dictionary
const translations = {
  en: {
    title: "Order Returns Management",
    description: "Manage and process customer order returns and refunds",
    filters: "Filters",
    create: "Create Return",
    export: "Export",
    exportCSV: "Export CSV",
    reset: "Reset",
    showData: "Show Data",
    exportExcel: "Export Excel",
    exportPDF: "Export PDF",
    id: "Return ID",
    orderId: "Order ID",
    customer: "Customer",
    productItems: "Product item(s)",
    returnReason: "Return Reason",
    status: "Status",
    createdAt: "Created At",
    operations: "Operations",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    processed: "Processed",
    refunded: "Refunded",
  },
  ar: {
    title: "إدارة مرتجعات الطلبات",
    description: "إدارة ومعالجة مرتجعات طلبات العملاء واسترداد المبالغ",
    filters: "فلاتر",
    create: "إنشاء مرتجع",
    export: "تصدير",
    reset: "إعادة تعيين",
    showData: "عرض البيانات",
    exportCSV: "تصدير CSV",
    exportExcel: "تصدير Excel",
    exportPDF: "تصدير PDF",
    id: "معرف المرتجع",
    orderId: "معرف الطلب",
    customer: "العميل",
    productItems: "المنتج/المنتجات",
    returnReason: "سبب الإرجاع",
    status: "الحالة",
    createdAt: "تاريخ الإنشاء",
    operations: "الإجراءات",
    pending: "قيد الانتظار",
    approved: "معتمد",
    rejected: "مرفوض",
    processed: "تم المعالجة",
    refunded: "تم الاسترداد",
  },
};

export default function OrderReturnsListPanel() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const [selectedExport, setSelectedExport] = useState<string | number>("");
  const t = translations[language];
  const isRTL = language === "ar";
  const ITEMS_PER_PAGE = 6;
  const router = useRouter();
  const toggle = () => setIsOpen((prev) => !prev);

  const handleExport = (value: string | number) => {
    setSelectedExport(value);
    console.log("Export order returns as:", value);
    // TODO: implement actual export logic
  };

  const getStatusBadge = (status: OrderReturnType["status"]) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: t.pending },
      approved: { color: "bg-blue-100 text-blue-800", label: t.approved },
      rejected: { color: "bg-red-100 text-red-800", label: t.rejected },
      processed: { color: "bg-purple-100 text-purple-800", label: t.processed },
      refunded: { color: "bg-green-100 text-green-800", label: t.refunded },
    };

    const config = statusConfig[status];
    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getColumns = (locale: LanguageType) => [
    {
      key: "id",
      header: translations[locale].id,
      sortable: true,
      render: (item: OrderReturnType) => (
        <span className="font-mono text-sm text-gray-600">#{item.id}</span>
      ),
    },
    {
      key: "orderId",
      header: translations[locale].orderId,
      sortable: true,
      render: (item: OrderReturnType) => (
        <Link
          href={`/admin/orders/${item.orderId}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {item.orderId}
        </Link>
      ),
    },
    {
      key: "customer",
      header: translations[locale].customer,
      sortable: true,
      render: (item: OrderReturnType) => (
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-full">
            <Image
              src={item.customer.avatar || "/avatars/default-customer.jpg"}
              alt={item.customer.firstName}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/avatars/default-customer.jpg";
              }}
            />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {formatFullName(item.customer.firstName, item.customer.lastName)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Mail className="h-3 w-3" />
              {item.customer.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "productItems",
      header: translations[locale].productItems,
      render: (item: OrderReturnType) => (
        <div className="space-y-2">
          {item.productItems.map((product) => (
            <div key={product.id} className="flex items-center gap-2">
              <div className="relative h-6 w-6 overflow-hidden rounded">
                <Image
                  src={product.images[0] || "/products/default-product.jpg"}
                  alt={product.title[language]}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/products/default-product.jpg";
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-900">
                  {product.title[language]}
                </div>
                <div className="text-xs text-gray-500">
                  Qty: 4 × ${product.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "returnReason",
      header: translations[locale].returnReason,
      render: (item: OrderReturnType) => (
        <div className="max-w-[200px]">
          <span className="line-clamp-2 text-sm text-gray-600">
            {item.returnReason}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: translations[locale].status,
      sortable: true,
      render: (item: OrderReturnType) => getStatusBadge(item.status),
    },
    {
      key: "createdAt",
      header: translations[locale].createdAt,
      sortable: true,
      render: (item: OrderReturnType) => (
        <span className="text-sm text-gray-600">
          {new Date(item.createdAt).toLocaleDateString(locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
  ];

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
        { id: "approved", name: { en: "Approved", ar: "معتمد" } },
        { id: "rejected", name: { en: "Rejected", ar: "مرفوض" } },
        { id: "processed", name: { en: "Processed", ar: "تم المعالجة" } },
        { id: "refunded", name: { en: "Refunded", ar: "تم الاسترداد" } },
      ],
      visible: true,
    },
    {
      id: "dateRange",
      label: { en: "Return Date Range", ar: "نطاق تاريخ الإرجاع" },
      type: "date-range",
      visible: true,
    },
    {
      id: "reason",
      label: { en: "Return Reason", ar: "سبب الإرجاع" },
      type: "dropdown",
      options: [
        { id: "damaged", name: { en: "Damaged Product", ar: "منتج تالف" } },
        { id: "wrong-item", name: { en: "Wrong Item", ar: "منتج خاطئ" } },
        {
          id: "not-as-described",
          name: { en: "Not as Described", ar: "غير مطابق للوصف" },
        },
        {
          id: "changed-mind",
          name: { en: "Changed Mind", ar: "تغيير في الرأي" },
        },
        { id: "defective", name: { en: "Defective", ar: "معيب" } },
      ],
      visible: true,
    },
  ];

  // Define export dropdown items
  const exportOptions: DropdownOption[] = [
    {
      id: "csv",
      name: { en: "Export CSV", ar: "تصدير CSV" },
    },
    {
      id: "excel",
      name: { en: "Export Excel", ar: "تصدير Excel" },
    },
    {
      id: "pdf",
      name: { en: "Export PDF", ar: "تصدير PDF" },
    },
  ];

  // Count returns by status for the summary cards
  const statusCounts = dummyOrderReturns.reduce(
    (acc: Record<string, number>, returnItem) => {
      acc[returnItem.status] = (acc[returnItem.status] || 0) + 1;
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
        showMoreFilters={true}
        showStatusCards
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
        quickFiltersGridCols="grid-cols-1 md:grid-cols-2"
      />

      {/* Order Returns Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggle}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm"
            >
              {t.filters}
            </button>
            <SearchInput locale={language} />
          </div>

          <div className="flex gap-2">
            {/* Export Dropdown */}
            <Dropdown
              label={t.export}
              icon={<Download size={15} />}
              options={exportOptions}
              selected={selectedExport}
              onSelect={handleExport}
              placeholder={t.export}
              locale={language}
              className="max-w-xs"
            />
          </div>
        </div>

        <DynamicTable
          data={dummyOrderReturns}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "createdAt", direction: "desc" }}
          solidActions={[
            {
              label: "View",
              onClick: (item) => router.push(`/admin/returns/${item.id}`),
              icon: <EyeIcon className="h-3 w-3" />,
              color: "#059669",
            },
            {
              label: "Delete",
              onClick: (item) => console.log(`Delete return: ${item.id}`),
              icon: <TrashIcon className="h-3 w-3" />,
              color: "#dc2626",
            },
          ]}
          locale={language}
          minWidth={1400}
        />
      </div>
    </div>
  );
}
