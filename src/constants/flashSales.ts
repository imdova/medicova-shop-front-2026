import { FlashSale } from "@/types/product";
import { products } from "./products";

// Dummy data for flash sales
export const FlashSalesData: FlashSale[] = [
  {
    id: "1",
    name: { en: "Summer Sale 2024", ar: "تخفيضات الصيف 2024" },
    endDate: "2024-08-31T23:59:59Z",
    createdAt: "2024-07-15T10:30:00Z",
    status: "published",
    products: products.slice(0, 2).map((p) => ({
      ...p,
      quantity: 11, // 👈 add default quantity
    })),
  },
  {
    id: "2",
    name: {
      en: "Back to School Flash Sale",
      ar: "تخفيضات العودة إلى المدرسة",
    },
    endDate: "2024-09-15T23:59:59Z",
    createdAt: "2024-08-01T14:20:00Z",
    status: "published",
    products: products.slice(0, 2).map((p) => ({
      ...p,
      quantity: 10, // 👈 add default quantity
    })),
  },
  {
    id: "3",
    name: { en: "Weekend Special", ar: "عطلة نهاية الأسبوع الخاصة" },
    endDate: "2024-07-28T23:59:59Z",
    createdAt: "2024-07-20T09:15:00Z",
    status: "published",
    products: products.slice(0, 2).map((p) => ({
      ...p,
      quantity: 8, // 👈 add default quantity
    })),
  },
  {
    id: "4",
    name: { en: "Clearance Event", ar: "حدث التصفية" },
    endDate: "2024-07-10T23:59:59Z",
    createdAt: "2024-06-25T11:45:00Z",
    status: "expired",
    products: products.slice(0, 2).map((p) => ({
      ...p,
      quantity: 2, // 👈 add default quantity
    })),
  },
  {
    id: "5",
    name: { en: "New Year Launch", ar: "إطلاق العام الجديد" },
    endDate: "2025-01-15T23:59:59Z",
    createdAt: "2024-12-20T16:30:00Z",
    status: "draft",
    products: products.slice(0, 2).map((p) => ({
      ...p,
      quantity: 3, // 👈 add default quantity
    })),
  },
  {
    id: "6",
    name: { en: "Black Friday Preview", ar: "معاينة الجمعة السوداء" },
    endDate: "2024-11-29T23:59:59Z",
    createdAt: "2024-10-15T13:10:00Z",
    status: "published",
    products: products.slice(0, 2).map((p) => ({
      ...p,
      quantity: 6, // 👈 add default quantity
    })),
  },
  {
    id: "7",
    name: { en: "Midnight Madness", ar: "جنون منتصف الليل" },
    endDate: "2024-08-15T23:59:59Z",
    createdAt: "2024-07-30T08:45:00Z",
    status: "published",
    products: products.slice(0, 2).map((p) => ({
      ...p,
      quantity: 5, // 👈 add default quantity
    })),
  },
  {
    id: "8",
    name: { en: "End of Season Sale", ar: "تخفيضات نهاية الموسم" },
    endDate: "2024-09-30T23:59:59Z",
    createdAt: "2024-09-01T10:00:00Z",
    status: "draft",
    products: products.slice(0, 2).map((p) => ({
      ...p,
      quantity: 4, // 👈 add default quantity
    })),
  },
];
