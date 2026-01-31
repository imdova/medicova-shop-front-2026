import { ExportConfig, ImportConfig } from "@/types";
import { FileText, Database } from "lucide-react";

export const exportConfigs: readonly ExportConfig[] = [
  {
    id: "orders",
    title: { ar: "الطلبات", en: "Orders" },
    description: {
      ar: "تصدير بيانات الطلبات",
      en: "Export orders data",
    },
    totalCount: 49,
    columns: [
      "id",
      "orderDate",
      "customerName",
      "customerEmail",
      "amount",
      "discountAmount",
      "shippingFee",
      "subTotal",
      "billingAddress",
      "paymentChannel",
      "paymentAmount",
      "paymentDate",
      "shippingStatus",
      "shippingDate",
      "shippingCompany",
      "products",
    ],
    statuses: ["pending", "processing", "completed", "cancelled"],
    icon: <FileText className="h-6 w-6" />,
    completed: true,
  },
  {
    id: "customers",
    title: { ar: "العملاء", en: "Customers" },
    description: {
      ar: "تصدير بيانات العملاء",
      en: "Export customers data",
    },
    totalCount: 128,
    columns: [
      "id",
      "customerName",
      "customerEmail",
      "phone",
      "address",
      "city",
      "country",
      "createdAt",
      "status",
    ],
    statuses: ["active", "inactive", "banned"],
    icon: <Database className="h-6 w-6" />,
    completed: true,
  },
  {
    id: "products",
    title: { ar: "المنتجات", en: "Products" },
    description: {
      ar: "تصدير بيانات المنتجات",
      en: "Export products data",
    },
    totalCount: 256,
    columns: [
      "id",
      "productName",
      "sku",
      "price",
      "inventory",
      "category",
      "status",
      "createdAt",
    ],
    statuses: ["active", "inactive", "out_of_stock", "draft"],
    icon: <Database className="h-6 w-6" />,
    completed: true,
  },
  {
    id: "posts",
    title: { ar: "المقالات", en: "Posts" },
    description: {
      ar: "تصدير بيانات المقالات",
      en: "Export posts data",
    },
    totalCount: 89,
    columns: [
      "id",
      "title",
      "content",
      "author",
      "status",
      "publishedAt",
      "createdAt",
    ],
    statuses: ["published", "draft", "archived"],
    icon: <FileText className="h-6 w-6" />,
    completed: true,
  },
  {
    id: "locations",
    title: { ar: "المواقع", en: "Locations" },
    description: {
      ar: "تصدير بيانات المواقع",
      en: "Export locations data",
    },
    totalCount: 32,
    columns: [
      "id",
      "name",
      "address",
      "city",
      "country",
      "phone",
      "status",
      "createdAt",
    ],
    statuses: ["active", "inactive"],
    icon: <Database className="h-6 w-6" />,
    completed: true,
  },
] as const;

// ---------- Combined Import Items ----------
export const importConfigs: ImportConfig[] = [
  {
    id: "locationsImport",
    title: {
      en: "Locations",
      ar: "المواقع",
    },
    description: {
      en: "Import or sync available locations data",
      ar: "استيراد أو مزامنة بيانات المواقع المتاحة",
    },
    type: "import",
    icon: <Database className="h-5 w-5" />,
    completed: true,
  },
  {
    id: "product-category-translations",
    title: {
      en: "Product Category Translations",
      ar: "ترجمات فئة المنتج",
    },
    description: {
      en: "Import product category translations in multiple languages",
      ar: "استيراد ترجمات فئات المنتجات بعدة لغات",
    },
    type: "import",
    icon: <FileText className="h-5 w-5" />,
    completed: true,
    columns: ["id", "nameVi", "nameAr", "nameFr"],
    exampleData: [
      {
        id: 1,
        nameVi: "New Arrivals",
        nameAr: "منتجات جديدة",
        nameFr: "Nouvelles arrivées",
      },
      {
        id: 2,
        nameVi: "Electronics",
        nameAr: "إلكترونيات",
        nameFr: "Électronique",
      },
    ],
    rules: [
      { column: "id", rule: "required, number" },
      { column: "nameVi", rule: "required, string" },
      { column: "nameAr", rule: "required, string" },
    ],
  },
  {
    id: "productInventoryImport",
    title: {
      en: "Product Inventory",
      ar: "مخزون المنتجات",
    },
    description: {
      en: "Update inventory quantities and availability",
      ar: "تحديث كميات المخزون وتوفر المنتجات",
    },
    type: "import",
    icon: <Database className="h-5 w-5" />,
    completed: true,
  },
  {
    id: "themeTranslationsImport",
    title: {
      en: "Theme Translations",
      ar: "ترجمات القالب",
    },
    description: {
      en: "Import UI translation files for theme",
      ar: "استيراد ملفات ترجمة واجهة المستخدم للقالب",
    },
    type: "import",
    icon: <FileText className="h-5 w-5" />,
    completed: true,
  },
  {
    id: "postTranslationsImport",
    title: {
      en: "Post Translations",
      ar: "ترجمات المقالات",
    },
    description: {
      en: "Import post translations for multilingual content",
      ar: "استيراد ترجمات المقالات للمحتوى متعدد اللغات",
    },
    type: "import",
    icon: <FileText className="h-5 w-5" />,
    completed: true,
  },
  {
    id: "productPricesImport",
    title: {
      en: "Product Prices",
      ar: "أسعار المنتجات",
    },
    description: {
      en: "Update product pricing data",
      ar: "تحديث بيانات أسعار المنتجات",
    },
    type: "import",
    icon: <Database className="h-5 w-5" />,
    completed: true,
  },
  {
    id: "customers",
    title: {
      en: "Customers",
      ar: "العملاء",
    },
    description: {
      en: "Import customer records and information",
      ar: "استيراد بيانات وسجلات العملاء",
    },
    type: "import",
    icon: <Database className="h-5 w-5" />,
    completed: true,
    columns: ["id", "name", "email", "status"],
    exampleData: [
      { id: 1, name: "John", email: "john@example.com", status: "active" },
    ],
    rules: [
      { column: "id", rule: "required, number" },
      { column: "name", rule: "required, string" },
      { column: "email", rule: "required, email" },
    ],
  },
  {
    id: "otherTranslationsImport",
    title: {
      en: "Other Translations",
      ar: "ترجمات أخرى",
    },
    description: {
      en: "Import miscellaneous translation strings",
      ar: "استيراد نصوص ترجمة متنوعة",
    },
    type: "import",
    icon: <FileText className="h-5 w-5" />,
    completed: true,
  },
  {
    id: "postsImport",
    title: {
      en: "Posts",
      ar: "المقالات",
    },
    description: {
      en: "Import blog or article data",
      ar: "استيراد بيانات المدونة أو المقالات",
    },
    type: "import",
    icon: <FileText className="h-5 w-5" />,
    completed: true,
  },
];
