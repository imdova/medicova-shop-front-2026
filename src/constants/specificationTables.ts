import { SpecificationTable } from "@/types/product";
import { dummySpecificationGroups } from "./specificationGroups";

// Dummy data for specification tables
export const dummySpecificationTables: SpecificationTable[] = [
  {
    id: "1",
    name: {
      en: "Mobile Phone Specs",
      ar: "مواصفات الهاتف المحمول",
    },
    description: {
      en: "Complete specification table for mobile devices",
      ar: "جدول المواصفات الكامل للأجهزة المحمولة",
    },
    assignedGroups: [...dummySpecificationGroups.slice(0, 1)],
    createdAt: "2024-01-15T10:30:00Z",
    status: {
      en: "published",
      ar: "نشط",
    },
  },
  {
    id: "2",
    name: {
      en: "Laptop Specifications",
      ar: "مواصفات اللابتوب",
    },
    description: {
      en: "Detailed specifications for laptop computers",
      ar: "مواصفات مفصلة لأجهزة اللابتوب",
    },
    assignedGroups: [...dummySpecificationGroups.slice(0, 1)],
    createdAt: "2024-01-16T14:20:00Z",
    status: {
      en: "published",
      ar: "نشط",
    },
  },
  {
    id: "3",
    name: {
      en: "Camera Features",
      ar: "ميزات الكاميرا",
    },
    description: {
      en: "Camera and imaging specifications table",
      ar: "جدول مواصفات الكاميرا والتصوير",
    },
    assignedGroups: [...dummySpecificationGroups.slice(0, 2)],
    createdAt: "2024-01-17T09:15:00Z",
    status: {
      en: "draft",
      ar: "مسودة",
    },
  },
  {
    id: "4",
    name: {
      en: "Audio Equipment",
      ar: "معدات الصوت",
    },
    description: {
      en: "Audio and sound specifications table",
      ar: "جدول مواصفات الصوت والصوتيات",
    },
    assignedGroups: [...dummySpecificationGroups.slice(1, 2)],

    createdAt: "2024-01-18T16:45:00Z",
    status: {
      en: "published",
      ar: "نشط",
    },
  },
  {
    id: "5",
    name: {
      en: "Smart Home Devices",
      ar: "أجهزة المنزل الذكي",
    },
    description: {
      en: "Specifications for smart home automation devices",
      ar: "مواصفات أجهزة أتمتة المنزل الذكي",
    },
    assignedGroups: [...dummySpecificationGroups.slice(0, 2)],
    createdAt: "2024-01-19T11:20:00Z",
    status: {
      en: "draft",
      ar: "مسودة",
    },
  },
  {
    id: "6",
    name: {
      en: "Wearable Tech",
      ar: "التقنيات القابلة للارتداء",
    },
    description: {
      en: "Specification table for wearable technology",
      ar: "جدول المواصفات للتقنيات القابلة للارتداء",
    },
    assignedGroups: [...dummySpecificationGroups.slice(0, 1)],
    createdAt: "2024-01-20T13:10:00Z",
    status: {
      en: "published",
      ar: "نشط",
    },
  },
  {
    id: "7",
    name: {
      en: "Gaming Console",
      ar: "كونسول الألعاب",
    },
    description: {
      en: "Complete gaming console specifications",
      ar: "مواصفات كونسول الألعاب الكاملة",
    },
    assignedGroups: [...dummySpecificationGroups.slice(0, 1)],
    createdAt: "2024-01-21T15:30:00Z",
    status: {
      en: "published",
      ar: "نشط",
    },
  },
  {
    id: "8",
    name: {
      en: "Kitchen Appliances",
      ar: "أجهزة المطبخ",
    },
    description: {
      en: "Specifications for kitchen electronic appliances",
      ar: "مواصفات الأجهزة الإلكترونية للمطبخ",
    },
    assignedGroups: [...dummySpecificationGroups.slice(0, 1)],
    createdAt: "2024-01-22T08:45:00Z",
    status: {
      en: "draft",
      ar: "مسودة",
    },
  },
];
