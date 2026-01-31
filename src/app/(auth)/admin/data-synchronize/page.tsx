"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, Upload, Check, X } from "lucide-react";
import { exportConfigs, importConfigs } from "@/constants/configs";
import Link from "next/link";

// Translation dictionary
const translations = {
  en: {
    title: "Data Synchronization",
    description: "Export and import your data in various formats",
    export: "Export",
    import: "Import",
    tools: "Tools",
    exportDescription: "Export your data to CSV/Excel files",
    importDescription: "Import data from CSV/Excel files",
    exportToFile: "Export to file",
    importFromFile: "Import from file",
    postTranslations: "Post Translations",
    locations: "Locations",
    customers: "Customers",
    orders: "Orders",
    productCategoryTranslations: "Product Category Translations",
    productInventory: "Product Inventory",
    themeTranslations: "Theme Translations",
    products: "Products",
    posts: "Posts",
    productTranslations: "Product Translations",
    productCategories: "Product Categories",
    otherTranslations: "Other Translations",
    productPrices: "Product Prices",
    exportTranslations: "Export translations for {item} to a CSV/Excel file",
    importTranslations: "Import translations for {item} from a CSV/Excel file",
    exportData: "Export your {item} data to CSV or Excel files",
    importData: "Import {item} from Excel/CSV file",
    updateData: "Update {item} in bulk by uploading a CSV/Excel file",
    availableData:
      "Import {item} data easily from available data or by uploading a CSV/Excel file",
    startExport: "Start Export",
    startImport: "Start Import",
    selectFormat: "Select Format",
    chooseFile: "Choose File",
    noFileChosen: "No file chosen",
    csvFormat: "CSV Format",
    excelFormat: "Excel Format",
    jsonFormat: "JSON Format",
    exporting: "Exporting...",
    importing: "Importing...",
    success: "Success!",
    error: "Error!",
    exportSuccess: "Data exported successfully",
    importSuccess: "Data imported successfully",
    close: "Close",
    cancel: "Cancel",
    proceed: "Proceed",
    dashboard: "Dashboard",
    ecommerce: "Ecommerce",
    productSpecification: "Product Specification",
    marketplace: "Marketplace",
    pages: "Pages",
    blog: "Blog",
    payments: "Payments",
    galleries: "Galleries",
    exportImportData: "Export/Import Data",
    settings: "Settings",
    platformAdministration: "Platform Administration",
    copyright: "Copyright 2025 © Battle Technologies. Version 1.3.9.1",
    pageLoaded: "Page loaded in 0.25 seconds",
  },
  ar: {
    title: "مزامنة البيانات",
    description: "تصدير واستيراد بياناتك بتنسيقات مختلفة",
    export: "تصدير",
    import: "استيراد",
    tools: "الأدوات",
    exportDescription: "قم بتصدير بياناتك إلى ملفات CSV/Excel",
    importDescription: "استيراد البيانات من ملفات CSV/Excel",
    exportToFile: "تصدير إلى ملف",
    importFromFile: "استيراد من ملف",
    postTranslations: "ترجمات المنشورات",
    locations: "المواقع",
    customers: "العملاء",
    orders: "الطلبات",
    productCategoryTranslations: "ترجمات فئات المنتجات",
    productInventory: "مخزون المنتجات",
    themeTranslations: "ترجمات السمة",
    products: "المنتجات",
    posts: "المنشورات",
    productTranslations: "ترجمات المنتجات",
    productCategories: "فئات المنتجات",
    otherTranslations: "ترجمات أخرى",
    productPrices: "أسعار المنتجات",
    exportTranslations: "تصدير الترجمات لـ {item} إلى ملف CSV/Excel",
    importTranslations: "استيراد الترجمات لـ {item} من ملف CSV/Excel",
    exportData: "تصدير بيانات {item} إلى ملفات CSV أو Excel",
    importData: "استيراد {item} من ملف Excel/CSV",
    updateData: "تحديث {item} بشكل جماعي عن طريق تحميل ملف CSV/Excel",
    availableData:
      "استيراد بيانات {item} بسهولة من البيانات المتاحة أو عن طريق تحميل ملف CSV/Excel",
    startExport: "بدء التصدير",
    startImport: "بدء الاستيراد",
    selectFormat: "اختر التنسيق",
    chooseFile: "اختر ملف",
    noFileChosen: "لم يتم اختيار ملف",
    csvFormat: "تنسيق CSV",
    excelFormat: "تنسيق Excel",
    jsonFormat: "تنسيق JSON",
    exporting: "جاري التصدير...",
    importing: "جاري الاستيراد...",
    success: "نجح!",
    error: "خطأ!",
    exportSuccess: "تم تصدير البيانات بنجاح",
    importSuccess: "تم استيراد البيانات بنجاح",
    close: "إغلاق",
    cancel: "إلغاء",
    proceed: "متابعة",
    dashboard: "لوحة التحكم",
    ecommerce: "التجارة الإلكترونية",
    productSpecification: "مواصفات المنتج",
    marketplace: "السوق",
    pages: "الصفحات",
    blog: "المدونة",
    payments: "المدفوعات",
    galleries: "المعارض",
    exportImportData: "تصدير/استيراد البيانات",
    settings: "الإعدادات",
    platformAdministration: "إدارة المنصة",
    copyright: "حقوق النشر 2025 © Battle Technologies. الإصدار 1.3.9.1",
    pageLoaded: "تم تحميل الصفحة في 0.25 ثانية",
  },
};

export default function DataSynchronizePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar";

  const StatusIcon = ({ completed }: { completed: boolean }) => (
    <div
      className={`flex h-5 w-5 items-center justify-center rounded-full ${
        completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
      }`}
    >
      {completed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
            <p className="text-gray-600">{t.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Export Section */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 bg-green-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Download className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {t.export}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {t.exportDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  {exportConfigs.map((item) => (
                    <Link
                      key={item.id}
                      href={`/admin/data-synchronize/export/${item.id}`}
                      className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:border-green-200 hover:bg-green-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-primary">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {item.title[language]}
                          </h3>
                          <StatusIcon completed={item.completed} />
                        </div>
                        <p className="mt-1 text-xs text-gray-600">
                          {item.description[language]}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Import Section */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 bg-green-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Upload className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {t.import}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {t.importDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  {importConfigs.map((item) => (
                    <Link
                      key={item.id}
                      href={`/admin/data-synchronize/import/${item.id}`}
                      className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 hover:border-green-200 hover:bg-green-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-primary">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {item.title[language]}
                          </h3>
                          <StatusIcon completed={item.completed ?? false} />
                        </div>
                        <p className="mt-1 text-xs text-gray-600">
                          {item.description?.[language]}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
