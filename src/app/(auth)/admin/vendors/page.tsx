"use client";
import Link from "next/link";
import {
  TrashIcon,
  EyeIcon,
  Plus,
  Mail,
  Phone,
  Store,
  CheckCircle,
  XCircle,
  Edit,
  Download,
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
import Image from "next/image";
import Dropdown, { DropdownOption } from "@/components/UI/DropDownMenu";
import { VendorType } from "@/types/customers";
import { dummyVendors } from "@/constants/vendors";
import AddVendorModal from "../components/AddVendorModal";

// Translation dictionary
const translations = {
  en: {
    title: "Vendors Management",
    description: "Manage and monitor vendor accounts and performance",
    filters: "Filters",
    create: "Create Vendor",
    export: "Export",
    exportCSV: "Export CSV",
    reset: "Reset",
    showData: "Show Data",
    exportExcel: "Export Excel",
    exportPDF: "Export PDF",
    id: "ID",
    avatar: "Avatar",
    name: "Name",
    email: "Email",
    storeName: "Store Name",
    storePhone: "Store Phone",
    products: "Products",
    totalRevenue: "Total Revenue",
    balance: "Balance",
    verified: "Verified",
  },
  ar: {
    title: "إدارة البائعين",
    description: "إدارة ومراقبة حسابات البائعين وأدائهم",
    filters: "فلاتر",
    create: "إنشاء بائع",
    export: "تصدير",
    reset: "إعادة تعيين",
    showData: "عرض البيانات",
    exportCSV: "تصدير CSV",
    exportExcel: "تصدير Excel",
    exportPDF: "تصدير PDF",
    id: "المعرف",
    avatar: "الصورة",
    name: "الاسم",
    email: "البريد الإلكتروني",
    storeName: "اسم المتجر",
    storePhone: "هاتف المتجر",
    products: "المنتجات",
    totalRevenue: "إجمالي الإيرادات",
    balance: "الرصيد",
    verified: "موثق",
  },
};

export default function VendorsListPanel() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const [selectedExport, setSelectedExport] = useState<string | number>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = translations[language];
  const isRTL = language === "ar";
  const ITEMS_PER_PAGE = 6;
  const router = useRouter();
  const toggle = () => setIsOpen((prev) => !prev);
  // inside VendorsListPanel

  const handleExport = (value: string | number) => {
    setSelectedExport(value);
    console.log("Export vendors as:", value);
    // TODO: implement actual export logic
  };

  const getColumns = (locale: LanguageType) => [
    {
      key: "id",
      header: translations[locale].id,
      sortable: true,
      render: (item: VendorType) => (
        <span className="font-mono text-sm text-gray-600">#{item.id}</span>
      ),
    },
    {
      key: "avatar",
      header: translations[locale].avatar,
      render: (item: VendorType) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src={item.avatar || "/avatars/default-vendor.jpg"}
              alt={item.name}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/avatars/default-vendor.jpg";
              }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "name",
      header: translations[locale].name,
      sortable: true,
      render: (item: VendorType) => (
        <Link
          href={`/admin/vendors/${item.id}`}
          className="font-medium text-gray-600 hover:underline"
        >
          {item.name}
        </Link>
      ),
    },
    {
      key: "email",
      header: translations[locale].email,
      sortable: true,
      render: (item: VendorType) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{item.email}</span>
        </div>
      ),
    },
    {
      key: "storeName",
      header: translations[locale].storeName,
      sortable: true,
      render: (item: VendorType) => (
        <Link href={"#"} className="flex items-center gap-2 hover:underline">
          <Store className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-600">{item.storeName}</span>
        </Link>
      ),
    },
    {
      key: "storePhone",
      header: translations[locale].storePhone,
      render: (item: VendorType) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{item.storePhone}</span>
        </div>
      ),
    },
    {
      key: "products",
      header: translations[locale].products,
      sortable: true,
      render: (item: VendorType) => (
        <div className="text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-gray-600">
            {item.products}
          </span>
        </div>
      ),
    },
    {
      key: "totalRevenue",
      header: translations[locale].totalRevenue,
      sortable: true,
      render: (item: VendorType) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">
            ${item.totalRevenue.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: "balance",
      header: translations[locale].balance,
      sortable: true,
      render: (item: VendorType) => (
        <div
          className={`font-medium ${
            item.balance > 0 ? "text-green-600" : "text-gray-600"
          }`}
        >
          ${item.balance.toLocaleString()}
        </div>
      ),
    },
    {
      key: "verified",
      header: translations[locale].verified,
      sortable: true,
      render: (item: VendorType) => (
        <div className="flex items-center justify-center">
          {item.verified ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400" />
          )}
        </div>
      ),
    },
  ];

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "active", name: { en: "Active", ar: "نشط" } },
        { id: "inactive", name: { en: "Inactive", ar: "غير نشط" } },
      ],
      visible: true,
    },
    {
      id: "verified",
      label: { en: "Verified", ar: "الحالة التوثيق" },
      type: "dropdown",
      options: [
        { id: "true", name: { en: "Verified", ar: "موثق" } },
        { id: "false", name: { en: "Not Verified", ar: "غير موثق" } },
      ],
      visible: true,
    },
    {
      id: "products",
      label: { en: "Products Count", ar: "عدد المنتجات" },
      type: "dropdown",
      options: [
        { id: "0-20", name: { en: "0-20 Products", ar: "0-20 منتج" } },
        { id: "21-50", name: { en: "21-50 Products", ar: "21-50 منتج" } },
        { id: "51-100", name: { en: "51-100 Products", ar: "51-100 منتج" } },
        { id: "100+", name: { en: "100+ Products", ar: "100+ منتج" } },
      ],
      visible: true,
    },
    {
      id: "revenue",
      label: { en: "Revenue Range", ar: "نطاق الإيرادات" },
      type: "dropdown",
      options: [
        { id: "0-50000", name: { en: "$0-50K", ar: "0-50 ألف" } },
        { id: "50001-100000", name: { en: "$50K-100K", ar: "50-100 ألف" } },
        { id: "100001-200000", name: { en: "$100K-200K", ar: "100-200 ألف" } },
        { id: "200001+", name: { en: "$200K+", ar: "200+ ألف" } },
      ],
      visible: true,
    },
    {
      id: "dateRange",
      label: { en: "Join Date Range", ar: "نطاق تاريخ الانضمام" },
      type: "date-range",
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

  // Count vendors by status for the summary cards
  const statusCounts = dummyVendors.reduce(
    (acc: Record<string, number>, vendor) => {
      acc[vendor.status] = (acc[vendor.status] || 0) + 1;
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

      {/* Vendors Table */}
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
            <button
              className="flex flex-shrink-0 items-center justify-center gap-1 rounded-md border border-gray-200 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={15} /> {t.create}
            </button>
          </div>
        </div>

        <DynamicTable
          data={dummyVendors}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "id", direction: "asc" }}
          solidActions={[
            {
              label: "View",
              onClick: (item) => router.push(`/admin/vendors/${item.id}`),
              icon: <EyeIcon className="h-3 w-3" />,
              color: "#059669",
            },
            {
              label: "Edit",
              onClick: (item) => router.push(`/admin/vendors/edit/${item.id}`),
              icon: <Edit className="h-3 w-3" />,
              color: "#059669",
            },
            {
              label: "Delete",
              onClick: (item) => console.log(`Delete vendor: ${item.id}`),
              icon: <TrashIcon className="h-3 w-3" />,
              color: "#dc2626",
            },
          ]}
          locale={language}
          minWidth={1200}
        />
      </div>
      <AddVendorModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        locale={language}
      />
    </div>
  );
}
