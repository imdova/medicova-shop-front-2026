import { ProductCollection } from "@/types/product";
import { products } from "./products";

// Dummy data for product collections
export const ProductCollections: ProductCollection[] = [
  {
    id: "COL-001",
    image: "/images/collections/featured.jpg",
    name: {
      en: "Featured Products",
      ar: "المنتجات المميزة",
    },
    slug: "featured-products",
    createdAt: "2024-01-15T10:30:00Z",
    status: "published",
    description: {
      en: "A collection of our most popular and featured products.",
      ar: "مجموعة من منتجاتنا الأكثر شيوعًا وتميزًا.",
    },
    short_description: {
      en: "Popular essentials",
      ar: "الأكثر شيوعاً",
    },
    is_featured: true,
    products: [products[0], products[1]],
  },
  {
    id: "COL-002",
    image: "/images/collections/summer.jpg",
    name: {
      en: "Summer Collection 2024",
      ar: "مجموعة الصيف 2024",
    },
    slug: "summer-collection-2024",
    createdAt: "2024-02-20T14:45:00Z",
    status: "published",
    description: {
      en: "Bright and fresh products for the summer season.",
      ar: "منتجات مشرقة ومنعشة لفصل الصيف.",
    },
    short_description: {
      en: "Summer essentials",
      ar: "مستلزمات الصيف",
    },
    is_featured: false,
    products: [products[2], products[3]],
  },
  {
    id: "COL-003",
    image: "/images/collections/winter.jpg",
    name: {
      en: "Winter Essentials",
      ar: "مستلزمات الشتاء",
    },
    slug: "winter-essentials",
    createdAt: "2023-11-10T09:15:00Z",
    status: "published",
    description: {
      en: "Keep warm and cozy with our winter essentials.",
      ar: "ابقَ دافئًا ومريحًا مع مستلزماتنا الشتوية.",
    },
    short_description: {
      en: "Winter must-haves",
      ar: "أساسيات الشتاء",
    },
    is_featured: false,
    products: [products[4], products[5]],
  },
  {
    id: "COL-004",
    image: "/images/collections/new.jpg",
    name: {
      en: "New Arrivals",
      ar: "وصل حديثاً",
    },
    slug: "new-arrivals",
    createdAt: "2024-03-01T16:20:00Z",
    status: "published",
    description: {
      en: "Discover the latest products just arrived in store.",
      ar: "اكتشف أحدث المنتجات التي وصلت للتو.",
    },
    short_description: {
      en: "Latest arrivals",
      ar: "الأحدث",
    },
    is_featured: true,
    products: [products[6], products[7]],
  },
  {
    id: "COL-005",
    image: "/images/collections/limited.jpg",
    name: {
      en: "Limited Edition",
      ar: "إصدار محدود",
    },
    slug: "limited-edition",
    createdAt: "2024-01-30T11:00:00Z",
    status: "draft",
    description: {
      en: "Exclusive limited edition products.",
      ar: "منتجات حصرية بإصدار محدود.",
    },
    short_description: {
      en: "Exclusive items",
      ar: "منتجات حصرية",
    },
    is_featured: true,
    products: [products[8], products[9]],
  },
  {
    id: "COL-006",
    image: "/images/collections/sale.jpg",
    name: {
      en: "Sale Items",
      ar: "العروض",
    },
    slug: "sale-items",
    createdAt: "2024-02-28T13:30:00Z",
    status: "published",
    description: {
      en: "Get the best deals with our sale collection.",
      ar: "احصل على أفضل العروض مع مجموعة التخفيضات.",
    },
    short_description: {
      en: "Discounted products",
      ar: "منتجات مخفضة",
    },
    is_featured: false,
    products: [products[10], products[11]],
  },
  {
    id: "COL-007",
    image: "/images/collections/premium.jpg",
    name: {
      en: "Premium Collection",
      ar: "المجموعة المميزة",
    },
    slug: "premium-collection",
    createdAt: "2024-01-10T08:45:00Z",
    status: "published",
    description: {
      en: "High-quality premium selection.",
      ar: "مجموعة مختارة عالية الجودة.",
    },
    short_description: {
      en: "Premium products",
      ar: "منتجات مميزة",
    },
    is_featured: true,
    products: [products[12], products[13]],
  },
  {
    id: "COL-008",
    image: "/images/collections/basic.jpg",
    name: {
      en: "Basic Essentials",
      ar: "الأساسيات",
    },
    slug: "basic-essentials",
    createdAt: "2024-02-15T12:10:00Z",
    status: "published",
    description: {
      en: "Everyday essentials for your needs.",
      ar: "الأساسيات اليومية لاحتياجاتك.",
    },
    short_description: {
      en: "Everyday items",
      ar: "منتجات يومية",
    },
    is_featured: false,
    products: [products[14], products[15]],
  },
];
