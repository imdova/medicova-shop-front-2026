import { FilterDrawerGroup } from "@/types";

export const filtersData: FilterDrawerGroup[] = [
  {
    id: "sellerStatus",
    label: { en: "Seller Status", ar: "حالة البائع" },
    isSingleSelect: true,
    options: [
      { id: "active", label: { en: "Active", ar: "نشط" }, count: 42 },
      { id: "inactive", label: { en: "Inactive", ar: "غير نشط" }, count: 8 },
    ],
    collapsed: false,
  },
  {
    id: "stock",
    label: { en: "Stock", ar: "المخزون" },
    isSingleSelect: true,
    options: [
      { id: "inStock", label: { en: "In stock", ar: "متوفر" }, count: 35 },
      {
        id: "outOfStock",
        label: { en: "Out of Stock", ar: "غير متوفر" },
        count: 15,
      },
    ],
    collapsed: false,
  },
  {
    id: "qcStatus",
    label: { en: "QC Status", ar: "حالة الفحص" },
    isSingleSelect: true,
    options: [
      { id: "approved", label: { en: "Approved", ar: "معتمد" }, count: 28 },
      {
        id: "pending",
        label: { en: "Pending", ar: "قيد الانتظار" },
        count: 12,
      },
      { id: "rejected", label: { en: "Rejected", ar: "مرفوض" }, count: 10 },
    ],
    collapsed: false,
  },
  {
    id: "brand",
    label: { en: "Brand", ar: "العلامة التجارية" },
    isSingleSelect: false,
    options: [
      { id: "nike", label: { en: "Nike", ar: "نايك" }, count: 18 },
      { id: "adidas", label: { en: "Adidas", ar: "أديداس" }, count: 15 },
      { id: "puma", label: { en: "Puma", ar: "بوما" }, count: 7 },
    ],
    collapsed: false,
  },
];

export const productFilters: FilterDrawerGroup[] = [
  {
    id: "sellerStatus",
    label: { en: "Seller Status", ar: "حالة البائع" },
    isSingleSelect: true,
    options: [
      { id: "active", label: { en: "Active", ar: "نشط" }, count: 42 },
      { id: "inactive", label: { en: "Inactive", ar: "غير نشط" }, count: 8 },
    ],
    collapsed: false,
  },
  {
    id: "stock",
    label: { en: "Stock", ar: "المخزون" },
    isSingleSelect: true,
    options: [
      { id: "inStock", label: { en: "In stock", ar: "متوفر" }, count: 35 },
      {
        id: "outOfStock",
        label: { en: "Out of Stock", ar: "غير متوفر" },
        count: 15,
      },
    ],
    collapsed: false,
  },
  {
    id: "qcStatus",
    label: { en: "QC Status", ar: "حالة الجودة" },
    isSingleSelect: true,
    options: [
      { id: "approved", label: { en: "Approved", ar: "معتمد" }, count: 28 },
      {
        id: "pending",
        label: { en: "Pending", ar: "قيد الانتظار" },
        count: 12,
      },
      { id: "rejected", label: { en: "Rejected", ar: "مرفوض" }, count: 10 },
    ],
    collapsed: false,
  },
  {
    id: "brand",
    label: { en: "Brand", ar: "العلامة التجارية" },
    isSingleSelect: false,
    options: [
      { id: "nike", label: { en: "Nike", ar: "نايك" }, count: 18 },
      { id: "adidas", label: { en: "Adidas", ar: "أديداس" }, count: 15 },
      { id: "puma", label: { en: "Puma", ar: "بوما" }, count: 7 },
      { id: "reebok", label: { en: "Reebok", ar: "ريبوك" }, count: 5 },
    ],
    collapsed: false,
  },
  {
    id: "category",
    label: { en: "Category", ar: "الفئة" },
    isSingleSelect: true,
    options: [
      { id: "shoes", label: { en: "Shoes", ar: "أحذية" }, count: 30 },
      { id: "clothing", label: { en: "Clothing", ar: "ملابس" }, count: 20 },
      {
        id: "accessories",
        label: { en: "Accessories", ar: "إكسسوارات" },
        count: 10,
      },
    ],
    collapsed: false,
  },
  {
    id: "subcategory",
    label: { en: "Subcategory", ar: "الفئة الفرعية" },
    isSingleSelect: false,
    options: [
      { id: "running", label: { en: "Running", ar: "الجري" }, count: 12 },
      {
        id: "basketball",
        label: { en: "Basketball", ar: "كرة السلة" },
        count: 8,
      },
      { id: "casual", label: { en: "Casual", ar: "كاجوال" }, count: 15 },
    ],
    collapsed: false,
  },
  {
    id: "priceRange",
    label: { en: "Price Range", ar: "نطاق السعر" },
    isSingleSelect: true,
    options: [
      { id: "0-50", label: { en: "$0 - $50", ar: "٠ - ٥٠ دولار" }, count: 12 },
      {
        id: "51-100",
        label: { en: "$51 - $100", ar: "٥١ - ١٠٠ دولار" },
        count: 22,
      },
      {
        id: "101-200",
        label: { en: "$101 - $200", ar: "١٠١ - ٢٠٠ دولار" },
        count: 16,
      },
    ],
    collapsed: false,
  },
  {
    id: "ratings",
    label: { en: "Ratings", ar: "التقييمات" },
    isSingleSelect: true,
    options: [
      {
        id: "4plus",
        label: { en: "4 stars & up", ar: "٤ نجوم فأعلى" },
        count: 30,
      },
      {
        id: "3plus",
        label: { en: "3 stars & up", ar: "٣ نجوم فأعلى" },
        count: 40,
      },
      {
        id: "2plus",
        label: { en: "2 stars & up", ar: "٢ نجوم فأعلى" },
        count: 50,
      },
    ],
    collapsed: false,
  },
];
