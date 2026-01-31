import { Testimonial } from "@/types";

//  Dummy Testimonials
export const dummyTestimonials: Testimonial[] = [
  {
    id: "1",
    slug: "testimonial-1",
    image: "/images/testimonials/user1.jpg",
    name: {
      en: "John Smith",
      ar: "جون سميث",
    },
    title: {
      en: "Amazing Service",
      ar: "خدمة مذهلة",
    },
    description: {
      en: "Great experience with the team",
      ar: "تجربة رائعة مع الفريق",
    },
    content: {
      en: "The service was exceptional and exceeded all our expectations. Highly recommended!",
      ar: "كانت الخدمة استثنائية وتجاوزت كل توقعاتنا. موصى به بشدة!",
    },
    createdAt: "2024-01-15T10:30:00Z",
    status: { en: "published", ar: "نشر" },
  },
  {
    id: "2",
    slug: "testimonial-2",
    image: "/images/testimonials/user2.jpg",
    name: {
      en: "Sarah Johnson",
      ar: "سارة جونسون",
    },
    title: {
      en: "Professional Team",
      ar: "فريق محترف",
    },
    description: {
      en: "Very professional and timely delivery",
      ar: "احترافية عالية وتسليم في الوقت المحدد",
    },
    content: {
      en: "The team demonstrated great professionalism and delivered the project ahead of schedule.",
      ar: "أظهر الفريق احترافية كبيرة وسلم المشروع قبل الموعد المحدد.",
    },
    createdAt: "2024-01-14T14:20:00Z",
    status: { en: "published", ar: "نشر" },
  },
  {
    id: "3",
    slug: "customer-success",
    image: "/images/testimonials/user3.jpg",
    name: {
      en: "Michael Brown",
      ar: "مايكل براون",
    },
    title: {
      en: "Customer Success Story",
      ar: "قصة نجاح العميل",
    },
    description: {
      en: "How we achieved great results together",
      ar: "كيف حققنا نتائج رائعة معًا",
    },
    content: {
      en: "Working with this company has transformed our business operations and increased our efficiency by 40%.",
      ar: "لقد غير العمل مع هذه الشركة عملياتنا التجارية وزيادة كفاءتنا بنسبة 40٪.",
    },
    createdAt: "2024-01-13T09:15:00Z",
    status: { en: "draft", ar: "مسودة" },
  },
  {
    id: "4",
    slug: "testimonial-4",
    image: "/images/testimonials/user4.jpg",
    name: {
      en: "Emily Davis",
      ar: "إيميلي ديفيس",
    },
    title: {
      en: "Excellent Collaboration",
      ar: "تعاون ممتاز",
    },
    description: {
      en: "Smooth communication and high-quality work.",
      ar: "تواصل سلس وعمل عالي الجودة.",
    },
    content: {
      en: "Emily was very satisfied with the outcome and praised the team's dedication.",
      ar: "كانت إيميلي راضية جدًا عن النتيجة وأشادت بتفاني الفريق.",
    },
    createdAt: "2024-01-12T16:45:00Z",
    status: { en: "published", ar: "نشر" },
  },
  {
    id: "5",
    slug: "testimonial-5",
    image: "/images/testimonials/user5.jpg",
    name: {
      en: "Robert Wilson",
      ar: "روبرت ويلسون",
    },
    title: {
      en: "Top Quality Support",
      ar: "دعم عالي الجودة",
    },
    description: {
      en: "The support team was always there to help.",
      ar: "كان فريق الدعم دائمًا متواجدًا للمساعدة.",
    },
    content: {
      en: "Robert appreciated the responsiveness and professionalism of the staff.",
      ar: "قدّر روبرت سرعة الاستجابة واحترافية الفريق.",
    },
    createdAt: "2024-01-11T11:20:00Z",
    status: { en: "draft", ar: "مسودة" },
  },
  {
    id: "6",
    slug: "testimonial-6",
    image: "/images/testimonials/user6.jpg",
    name: {
      en: "Lisa Anderson",
      ar: "ليزا أندرسون",
    },
    title: {
      en: "Outstanding Experience",
      ar: "تجربة رائعة",
    },
    description: {
      en: "Everything went smoothly from start to finish.",
      ar: "سار كل شيء بسلاسة من البداية حتى النهاية.",
    },
    content: {
      en: "Lisa highlighted the team's commitment and the overall smooth process.",
      ar: "أشادت ليزا بالتزام الفريق وسلاسة العملية بالكامل.",
    },
    createdAt: "2024-01-10T13:10:00Z",
    status: { en: "published", ar: "نشر" },
  },
];
