import { Review, ReviewType } from "@/types/product";
import { products } from "./products";
import { dummyCustomers } from "./customers";

export const reviews: Review[] = [
  {
    id: "1",
    rating: 5,
    content: "Excellent product, very comfortable and stylish!",
    author: {
      id: "1",
      name: "Ahmed M.",
      imgUrl: "",
    },
    date: "2025-05-20",
  },
  {
    id: "2",
    rating: 4,
    content: "Good value for the price. Could use some improvements.",
    author: {
      id: "2",
      name: "Sara B.",
      imgUrl: "",
    },
    date: "2025-05-22",
  },
  {
    id: "3",
    rating: 3,
    content: "Average experience. The quality was okay, but shipping was slow.",
    author: {
      id: "3",
      name: "John K.",
      imgUrl: "",
    },
    date: "2025-05-18",
  },
  {
    id: "4",
    rating: 2,
    content: "Not satisfied with the product. Poor customer service.",
    author: {
      id: "4",
      name: "Fatima S.",
      imgUrl: "",
    },
    date: "2025-05-15",
  },
  {
    id: "5",
    rating: 5,
    content: "Absolutely love it! High quality and very stylish.",
    author: {
      id: "5",
      name: "Omar R.",
      imgUrl: "",
    },
    date: "2025-05-12",
  },
];

// Dummy data for reviews
export const dummyReviews: ReviewType[] = [
  {
    id: "REV-001",
    product: products[0],
    user: dummyCustomers[0],
    rating: 5,
    comment:
      "Excellent sound quality and comfortable to wear for long periods. Battery life is amazing!",
    images: [],
    status: { en: "Published", ar: "منشور" },
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "REV-002",
    product: products[1],
    user: dummyCustomers[1],
    rating: 4,
    comment:
      "Good features but the battery could be better. Love the health tracking functions.",
    images: [],
    status: { en: "Pending", ar: "قيد الانتظار" },
    createdAt: "2024-01-14T14:20:00Z",
  },
  {
    id: "REV-003",
    product: products[3],
    user: dummyCustomers[0],
    rating: 3,
    comment:
      "Average quality. Zipper broke after 2 months of use. Not very durable.",
    images: [],
    status: { en: "Published", ar: "منشور" },
    createdAt: "2024-01-13T09:15:00Z",
  },
  {
    id: "REV-004",
    product: products[4],
    user: dummyCustomers[2],
    rating: 5,
    comment:
      "أحببتها كثيرًا! أفضل عملية شراء قمت بها هذا العام. إلغاء الضوضاء مثالي.",
    images: [],
    status: { en: "Published", ar: "منشور" },
    createdAt: "2024-01-12T16:45:00Z",
  },
  {
    id: "REV-005",
    product: products[1],
    user: dummyCustomers[1],
    rating: 2,
    comment: "توقف عن العمل بعد 3 أسابيع. محبط جدًا من الجودة.",
    images: [],
    status: { en: "Rejected", ar: "مرفوض" },
    createdAt: "2024-01-11T11:20:00Z",
  },
  {
    id: "REV-006",
    product: products[2],
    user: dummyCustomers[1],
    rating: 5,
    comment:
      "Perfect for fitness tracking! The sleep analysis feature is very accurate.",
    images: [],
    status: { en: "Published", ar: "منشور" },
    createdAt: "2024-01-10T13:10:00Z",
  },
  {
    id: "REV-007",
    product: products[2],
    user: dummyCustomers[1],
    rating: 4,
    comment:
      "Good value for money. Adjustable brightness is useful for different tasks.",
    images: [],
    status: { en: "Pending", ar: "قيد الانتظار" },
    createdAt: "2024-01-09T08:30:00Z",
  },
  {
    id: "REV-008",
    product: products[1],
    user: dummyCustomers[2],
    rating: 5,
    comment:
      "واسع جدًا ومريح. مثالي لرحلتي اليومية مع الكمبيوتر المحمول والكتب.",
    images: [],
    status: { en: "Published", ar: "منشور" },
    createdAt: "2024-01-08T15:25:00Z",
    replies: [
      {
        id: "RPL-001",
        admin_name: "Support Team",
        comment:
          "شكرًا لتعليقاتك الإيجابية! نحن سعداء لسماع أنك راضٍ عن خدمتنا.",
        created_at: "2024-01-08T16:00:00Z",
      },
    ],
  },
];
