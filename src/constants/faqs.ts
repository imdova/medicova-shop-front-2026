import { FAQ } from "@/types";

export const dummyFAQs: FAQ[] = [
  {
    id: "1",
    question: {
      en: "How do I reset my password?",
      ar: "كيف يمكنني إعادة تعيين كلمة المرور؟",
    },
    category: {
      en: "Account",
      ar: "الحساب",
    },
    answer: {
      en: "To reset your password, go to the login page and click on 'Forgot Password'. Enter your email address and we'll send you a password reset link.",
      ar: "لإعادة تعيين كلمة المرور الخاصة بك، انتقل إلى صفحة تسجيل الدخول وانقر على 'نسيت كلمة المرور'. أدخل عنوان بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور.",
    },
    createdAt: "2024-01-15T10:30:00Z",
    status: { en: "published", ar: "منشور" },
  },
  {
    id: "2",
    question: {
      en: "What payment methods do you accept?",
      ar: "ما هي طرق الدفع التي تقبلونها؟",
    },
    category: {
      en: "Payments",
      ar: "المدفوعات",
    },
    answer: {
      en: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for larger orders.",
      ar: "نقبل جميع بطاقات الائتمان الرئيسية (فيزا، ماستركارد، أمريكان إكسبريس)، باي بال، وتحويلات البنك للطلبات الكبيرة.",
    },
    createdAt: "2024-01-20T14:45:00Z",
    status: { en: "published", ar: "منشور" },
  },
  {
    id: "3",
    question: {
      en: "How long does shipping take?",
      ar: "كم تستغرق مدة الشحن؟",
    },
    category: {
      en: "Shipping",
      ar: "الشحن",
    },
    answer: {
      en: "Standard shipping takes 3-5 business days. Express shipping is available for delivery within 1-2 business days.",
      ar: "الشحن القياسي يستغرق من 3 إلى 5 أيام عمل. الشحن السريع متاح للتوصيل خلال 1-2 أيام عمل.",
    },
    createdAt: "2024-02-01T09:15:00Z",
    status: { en: "draft", ar: "مسودة" },
  },
  {
    id: "4",
    question: {
      en: "Can I change my order after placing it?",
      ar: "هل يمكنني تغيير طلبي بعد وضعه؟",
    },
    category: {
      en: "Orders",
      ar: "الطلبات",
    },
    answer: {
      en: "You can modify your order within 1 hour of placement. After that, please contact our customer service team for assistance.",
      ar: "يمكنك تعديل طلبك خلال ساعة واحدة من وضعه. بعد ذلك، يرجى الاتصال بفريق خدمة العملاء للحصول على المساعدة.",
    },
    createdAt: "2024-02-05T16:20:00Z",
    status: { en: "published", ar: "منشور" },
  },
  {
    id: "5",
    question: {
      en: "Do you offer international shipping?",
      ar: "هل تقدمون شحنًا دوليًا؟",
    },
    category: {
      en: "Shipping",
      ar: "الشحن",
    },
    answer: {
      en: "Yes, we ship to over 50 countries worldwide. International shipping costs and delivery times vary by destination.",
      ar: "نعم، نقوم بالشحن إلى أكثر من 50 دولة حول العالم. تختلف تكاليف الشحن الدولي وأوقات التسليم حسب الوجهة.",
    },
    createdAt: "2024-02-10T11:00:00Z",
    status: { en: "draft", ar: "مسودة" },
  },
  {
    id: "6",
    question: {
      en: "What is your return policy?",
      ar: "ما هي سياسة الإرجاع الخاصة بكم؟",
    },
    category: {
      en: "Returns",
      ar: "الإرجاع",
    },
    answer: {
      en: "You can return products within 14 days of delivery in their original packaging. Please contact support for return instructions.",
      ar: "يمكنك إرجاع المنتجات خلال 14 يومًا من التسليم في عبوتها الأصلية. يرجى التواصل مع الدعم للحصول على تعليمات الإرجاع.",
    },
    createdAt: "2024-02-12T13:30:00Z",
    status: { en: "published", ar: "منشور" },
  },
  {
    id: "7",
    question: {
      en: "How can I track my order?",
      ar: "كيف يمكنني تتبع طلبي؟",
    },
    category: {
      en: "Orders",
      ar: "الطلبات",
    },
    answer: {
      en: "Once your order is shipped, you’ll receive a tracking number by email to monitor the delivery status.",
      ar: "بمجرد شحن طلبك، ستتلقى رقم تتبع عبر البريد الإلكتروني لمتابعة حالة التوصيل.",
    },
    createdAt: "2024-02-15T08:45:00Z",
    status: { en: "published", ar: "منشور" },
  },
  {
    id: "8",
    question: {
      en: "Are there any discounts for bulk orders?",
      ar: "هل هناك خصومات على الطلبات بالجملة؟",
    },
    category: {
      en: "Pricing",
      ar: "التسعير",
    },
    answer: {
      en: "Yes, we offer special discounts for bulk and wholesale purchases. Contact our sales team for a custom quote.",
      ar: "نعم، نقدم خصومات خاصة للطلبات بالجملة والشراء بالجملة. تواصل مع فريق المبيعات للحصول على عرض مخصص.",
    },
    createdAt: "2024-02-18T15:10:00Z",
    status: { en: "draft", ar: "مسودة" },
  },
];
