"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, FileText } from "lucide-react";
import { useParams } from "next/navigation";
import NotFound from "@/app/not-found";
import { Checkbox } from "@/components/UI/Check-Box";
import { Input } from "@/components/UI/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { exportConfigs } from "@/constants/configs";

/* -------------------------------------------------------------------------- */
/*                              Translation Texts                             */
/* -------------------------------------------------------------------------- */

const translations = {
  en: {
    // General
    pageTitle: "Export {type}",
    backToExport: "Back to Export",
    totalItems: "Total {type}",
    columns: "Columns",
    checkAll: "Check all",
    format: "Format",
    csv: "CSV",
    excel: "Excel",
    numberOfItems: "Number of {type} to Export",
    enterNumberOfItems:
      "Enter number of {type} to export (leave empty for all)",
    allStatuses: "All Statuses",
    startDate: "Start Date",
    endDate: "End Date",
    dateRange: "Date Range",
    dateFormat: "Y-m-d",
    export: "Export",
    processing: "Processing...",
    exportSuccess: "Export completed successfully",
    selectColumns: "Select columns to export",

    // Dynamic types
    orders: "Orders",
    customers: "Customers",
    products: "Products",
    posts: "Posts",
    locations: "Locations",

    // Column names
    id: "ID",
    orderDate: "Order Date",
    customerName: "Customer Name",
    customerEmail: "Customer Email",
    amount: "Amount",
    discountAmount: "Discount Amount",
    shippingFee: "Shipping Fee",
    subTotal: "Sub Total",
    billingAddress: "Billing Address",
    paymentChannel: "Payment Channel",
    paymentAmount: "Payment Amount",
    paymentDate: "Payment Date",
    shippingStatus: "Shipping Status",
    shippingDate: "Shipping Date",
    shippingCompany: "Shipping Company",
    productList: "Products",
    createdAt: "Created At",
    status: "Status",
    phone: "Phone",
    address: "Address",
    city: "City",
    country: "Country",
    productName: "Product Name",
    price: "Price",
    inventory: "Inventory",
    category: "Category",
    sku: "SKU",
    postTitle: "Title",
    content: "Content",
    author: "Author",
    publishedAt: "Published At",
  },

  ar: {
    // General
    pageTitle: "تصدير {type}",
    backToExport: "العودة إلى التصدير",
    totalItems: "إجمالي {type}",
    columns: "الأعمدة",
    checkAll: "اختيار الكل",
    format: "التنسيق",
    csv: "CSV",
    excel: "Excel",
    numberOfItems: "عدد {type} للتصدير",
    enterNumberOfItems: "أدخل عدد {type} للتصدير (اتركه فارغًا للجميع)",
    allStatuses: "جميع الحالات",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    dateRange: "النطاق الزمني",
    dateFormat: "Y-m-d",
    export: "تصدير",
    processing: "جاري المعالجة...",
    exportSuccess: "تم التصدير بنجاح",
    selectColumns: "اختر الأعمدة للتصدير",

    // Dynamic types
    orders: "الطلبات",
    customers: "العملاء",
    products: "المنتجات",
    posts: "المقالات",
    locations: "المواقع",

    // Column names
    id: "المعرف",
    orderDate: "تاريخ الطلب",
    customerName: "اسم العميل",
    customerEmail: "بريد العميل",
    amount: "المبلغ",
    discountAmount: "مبلغ الخصم",
    shippingFee: "رسوم الشحن",
    subTotal: "المجموع الفرعي",
    billingAddress: "عنوان الفاتورة",
    paymentChannel: "قناة الدفع",
    paymentAmount: "مبلغ الدفع",
    paymentDate: "تاريخ الدفع",
    shippingStatus: "حالة الشحن",
    shippingDate: "تاريخ الشحن",
    shippingCompany: "شركة الشحن",
    productList: "المنتجات",
    createdAt: "تاريخ الإنشاء",
    status: "الحالة",
    phone: "الهاتف",
    address: "العنوان",
    city: "المدينة",
    country: "الدولة",
    productName: "اسم المنتج",
    price: "السعر",
    inventory: "المخزون",
    category: "الفئة",
    sku: "رمز المنتج",
    postTitle: "العنوان",
    content: "المحتوى",
    author: "المؤلف",
    publishedAt: "تاريخ النشر",
  },
};

/* -------------------------------------------------------------------------- */
/*                                Main Component                              */
/* -------------------------------------------------------------------------- */

export default function ExportDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { language } = useLanguage();
  const t = translations[language];
  const [selectedFormat, setSelectedFormat] = useState<"csv" | "excel">("csv");
  const [numberOfItems, setNumberOfItems] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const config = exportConfigs.find((item) => item.id === slug);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    config?.columns ?? [],
  );

  if (!config) {
    return <NotFound />;
  }

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column],
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(
      selectedColumns.length === config.columns.length ? [] : config.columns,
    );
  };

  const handleExport = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);

    const blob = new Blob([`Exported data`], {
      type: selectedFormat === "csv" ? "text/csv" : "application/vnd.ms-excel",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `export.${selectedFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(t.exportSuccess);
  };

  const getTranslatedColumnName = (columnKey: string) =>
    t[columnKey as keyof typeof t] || columnKey;

  /* ---------------------------------------------------------------------- */
  /*                                 RENDER                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="min-h-screen">
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-primary">
              {config.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{config.id}</h1>
              <p className="text-gray-600">
                {config.title[language]}: {config.totalCount}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            {/* Columns Selection */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t.columns}
                </h3>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary"
                >
                  {t.checkAll}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {config.columns.map((column) => (
                  <label
                    key={column}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedColumns.includes(column)}
                      onCheckedChange={() => handleColumnToggle(column)}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {getTranslatedColumnName(column)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {t.format}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {(["csv", "excel"] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 ${
                      selectedFormat === format
                        ? "border-primary bg-green-50 text-primary"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">{t[format]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Filters */}
          <div className="space-y-6">
            {/* Number of Items */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {t.numberOfItems.replace("{type}", config.title[language])}
              </h3>
              <Input
                type="number"
                value={numberOfItems}
                onChange={(e) => setNumberOfItems(e.target.value)}
                placeholder={t.enterNumberOfItems.replace(
                  "{type}",
                  config.title[language],
                )}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {t.status}
              </h3>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t.allStatuses} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allStatuses}</SelectItem>
                  {config.statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                {t.dateRange}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.startDate}
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t.endDate}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <button
                onClick={handleExport}
                disabled={isProcessing || selectedColumns.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    {t.export}
                  </>
                )}
              </button>

              {selectedColumns.length === 0 && (
                <p className="mt-2 text-center text-sm text-red-600">
                  {t.selectColumns}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
