import { SpecificationGroup } from "@/types/product";

// ---------------- Dummy Data ----------------
export const dummySpecificationGroups: SpecificationGroup[] = [
  {
    id: "1",
    slug: "electronics-specs",
    name: { en: "Electronics Specifications", ar: "مواصفات الإلكترونيات" },
    description: {
      en: "Technical specifications for electronic devices",
      ar: "المواصفات التقنية للأجهزة الإلكترونية",
    },
    status: { en: "published", ar: "منشور" },
    createdAt: "2024-02-12T16:20:00Z",
  },
  {
    id: "2",
    slug: "fashion-specs",
    name: { en: "Fashion Specifications", ar: "مواصفات الأزياء" },
    description: {
      en: "Size and material specifications for fashion items",
      ar: "مواصفات المقاسات والمواد للملابس",
    },
    status: { en: "draft", ar: "مسودة" },
    createdAt: "2024-02-12T16:20:00Z",
  },
  {
    id: "3",
    slug: "home-appliances",
    name: { en: "Home Appliances", ar: "الأجهزة المنزلية" },
    description: {
      en: "Specifications for home appliances and equipment",
      ar: "مواصفات الأجهزة والمعدات المنزلية",
    },
    status: { en: "draft", ar: "مسودة" },
    createdAt: "2024-02-12T16:20:00Z",
  },
];
