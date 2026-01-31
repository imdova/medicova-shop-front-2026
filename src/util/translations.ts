export type LanguageType = "en" | "ar"; // Define a specific type for languages

type Translations = {
  [key: string]: {
    en: string;
    ar: string;
  };
};

const translations: Translations = {
  welcome: {
    en: "Welcome",
    ar: "مرحبا",
  },
  products: {
    en: "Products",
    ar: "المنتجات",
  },
  copyright: {
    en: "Medicova. All Rights Reserved",
    ar: "ميديكوفا جميع الحقوق محفوظة",
  },
  paymentMethod: {
    en: "Payment method",
    ar: "طريقة الدفع",
  },
  cardNumber: {
    en: "CARD NUMBER",
    ar: "رقم البطاقة",
  },
  cardNumberPlaceholder: {
    en: "**** **** **** ****",
    ar: "**** **** **** ****",
  },
  cardNumberRequired: {
    en: "Card number is required",
    ar: "رقم البطاقة مطلوب",
  },
  invalidCardNumber: {
    en: "Invalid card number",
    ar: "رقم البطاقة غير صالح",
  },
  expiryDate: {
    en: "EXPIRY DATE",
    ar: "تاريخ الانتهاء",
  },
  monthRequired: {
    en: "Month is required",
    ar: "الشهر مطلوب",
  },
  invalidMonth: {
    en: "Invalid month (1-12)",
    ar: "الشهر غير صالح (1-12)",
  },
  yearRequired: {
    en: "Year is required",
    ar: "السنة مطلوبة",
  },
  cvv: {
    en: "CVV",
    ar: "رمز الأمان",
  },
  code: {
    en: "Code",
    ar: "الرمز",
  },
  cvvRequired: {
    en: "CVV is required",
    ar: "رمز الأمان مطلوب",
  },
  cvvInvalid: {
    en: "CVV must be 3 digits",
    ar: "رمز الأمان يجب أن يتكون من 3 أرقام",
  },
  rememberCard: {
    en: "Remember this card",
    ar: "تذكر هذه البطاقة",
  },
  rememberCardNote: {
    en: "noon will securely store this card for a faster payment experience. CVV number will not be stored.",
    ar: "سيتم تخزين هذه البطاقة بشكل آمن لتجربة دفع أسرع. لن يتم تخزين رمز الأمان.",
  },
  addCard: {
    en: "ADD MY CARD",
    ar: "أضف بطاقتي",
  },
  processing: {
    en: "Processing...",
    ar: "جار المعالجة...",
  },
};

export const t = (key: string, language: LanguageType): string => {
  // Use LanguageType for the language parameter
  return translations[key]?.[language] || key;
};
