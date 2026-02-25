import { LocalizedTitle } from "@/types/language";

export type Category = {
  id: string;
  image: string;
  name: LocalizedTitle;
  date: string;
  products: number;
  orders: number;
  totalSales: LocalizedTitle;
  status: "active" | "inactive";
  isActive: boolean;
};

export type SubCategory = {
  id: string;
  name: LocalizedTitle;
  parentCategory: LocalizedTitle;
  date: string;
  products: number;
  orders: number;
  totalSales: LocalizedTitle;
  status: "active" | "inactive";
  isActive: boolean;
};

export type Brand = {
  id: string;
  logo: string;
  name: LocalizedTitle;
  date: string;
  products: number;
  orders: number;
  totalSales: LocalizedTitle;
  status: "active" | "inactive";
  isActive: boolean;
};

export const sampleCategories: Category[] = [
  {
    id: "1",
    image: "/images/landau.jpg",
    name: { en: "Electronics", ar: "إلكترونيات" },
    date: "15/5/2025",
    products: 450,
    orders: 500,
    totalSales: { en: "150K EGP", ar: "١٥٠ ألف جنيه" },
    status: "active",
    isActive: true,
  },
  {
    id: "2",
    image: "/images/landau.jpg",
    name: { en: "Clothing", ar: "ملابس" },
    date: "15/5/2025",
    products: 450,
    orders: 500,
    totalSales: { en: "150K EGP", ar: "١٥٠ ألف جنيه" },
    status: "active",
    isActive: true,
  },
  {
    id: "3",
    image: "/images/landau.jpg",
    name: { en: "Home & Garden", ar: "المنزل والحديقة" },
    date: "15/5/2025",
    products: 450,
    orders: 500,
    totalSales: { en: "150K EGP", ar: "١٥٠ ألف جنيه" },
    status: "active",
    isActive: true,
  },
];

export const sampleSubCategories: SubCategory[] = [
  {
    id: "1",
    name: { en: "Smartphones", ar: "هواتف ذكية" },
    parentCategory: { en: "Electronics", ar: "إلكترونيات" },
    date: "15/5/2025",
    products: 120,
    orders: 150,
    totalSales: { en: "50K EGP", ar: "٥٠ ألف جنيه" },
    status: "active",
    isActive: true,
  },
  {
    id: "2",
    name: { en: "Laptops", ar: "أجهزة كمبيوتر محمولة" },
    parentCategory: { en: "Electronics", ar: "إلكترونيات" },
    date: "15/5/2025",
    products: 80,
    orders: 90,
    totalSales: { en: "40K EGP", ar: "٤٠ ألف جنيه" },
    status: "active",
    isActive: false,
  },
  {
    id: "3",
    name: { en: "Men's Wear", ar: "ملابس رجالية" },
    parentCategory: { en: "Clothing", ar: "ملابس" },
    date: "15/5/2025",
    products: 200,
    orders: 180,
    totalSales: { en: "60K EGP", ar: "٦٠ ألف جنيه" },
    status: "active",
    isActive: false,
  },
];

export const sampleBrands: Brand[] = [
  {
    id: "1",
    logo: "/images/landau.jpg",
    name: { en: "Landau", ar: "لانداو" },
    date: "15/5/2025",
    products: 450,
    orders: 500,
    totalSales: { en: "150K EGP", ar: "١٥٠ ألف جنيه" },
    status: "active",
    isActive: true,
  },
  {
    id: "2",
    logo: "/images/landau.jpg",
    name: { en: "Nike", ar: "نايك" },
    date: "15/5/2025",
    products: 320,
    orders: 400,
    totalSales: { en: "120K EGP", ar: "١٢٠ ألف جنيه" },
    status: "active",
    isActive: true,
  },
  {
    id: "3",
    logo: "/images/landau.jpg",
    name: { en: "Apple", ar: "آبل" },
    date: "15/5/2025",
    products: 280,
    orders: 350,
    totalSales: { en: "200K EGP", ar: "٢٠٠ ألف جنيه" },
    status: "active",
    isActive: false,
  },
];
