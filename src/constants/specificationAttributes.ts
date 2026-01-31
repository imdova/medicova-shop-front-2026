import { SpecificationAttribute } from "@/types/product";
import { dummySpecificationGroups } from "./specificationGroups";

// Dummy data for specification attributes
export const dummySpecificationAttributes: SpecificationAttribute[] = [
  {
    id: "1",
    name: {
      en: "Screen Size",
      ar: "حجم الشاشة",
    },
    associatedGroup: dummySpecificationGroups[0],
    fieldType: "number",
    createdAt: "2024-01-15T10:30:00Z",
    status: {
      en: "published",
      ar: "نشط",
    },
  },
  {
    id: "2",
    name: {
      en: "Weight",
      ar: "الوزن",
    },
    associatedGroup: dummySpecificationGroups[1],
    fieldType: "number",
    createdAt: "2024-01-16T14:20:00Z",
    status: {
      en: "published",
      ar: "نشط",
    },
  },
  {
    id: "3",
    name: {
      en: "Water Resistant",
      ar: "مقاوم للماء",
    },
    associatedGroup: dummySpecificationGroups[2],
    fieldType: "boolean",
    createdAt: "2024-01-17T09:15:00Z",
    status: {
      en: "published",
      ar: "نشط",
    },
  },
  {
    id: "4",
    name: {
      en: "Color Options",
      ar: "خيارات الألوان",
    },
    associatedGroup: dummySpecificationGroups[1],
    fieldType: "select",
    createdAt: "2024-01-18T16:45:00Z",
    status: {
      en: "draft",
      ar: "مسودة",
    },
  },
  {
    id: "5",
    name: {
      en: "Processor Speed",
      ar: "سرعة المعالج",
    },
    associatedGroup: dummySpecificationGroups[2],
    fieldType: "number",
    createdAt: "2024-01-19T11:20:00Z",
    status: {
      en: "published",
      ar: "نشط",
    },
  },
  {
    id: "6",
    name: {
      en: "Description",
      ar: "الوصف",
    },
    associatedGroup: dummySpecificationGroups[1],
    fieldType: "textarea",
    createdAt: "2024-01-20T13:10:00Z",
    status: {
      en: "draft",
      ar: "مسودة",
    },
  },
  {
    id: "7",
    name: {
      en: "Material Type",
      ar: "نوع المادة",
    },
    associatedGroup: dummySpecificationGroups[2],
    fieldType: "text",
    createdAt: "2024-01-21T15:30:00Z",
    status: {
      en: "published",
      ar: "نشط",
    },
  },
  {
    id: "8",
    name: {
      en: "Operating System",
      ar: "نظام التشغيل",
    },
    associatedGroup: dummySpecificationGroups[1],
    fieldType: "select",
    createdAt: "2024-01-22T08:45:00Z",
    status: {
      en: "published",
      ar: "نشط",
    },
  },
];
