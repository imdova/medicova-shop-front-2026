import {
  AppLink,
  FooterSection,
  LegalLink,
  PaymentMethod,
  SocialMedia,
} from "@/types";

// Footer sections data
export const sections: FooterSection[] = [
  {
    title: { en: "ELECTRONICS", ar: "إلكترونيات" },
    links: [
      { name: { en: "Mobiles", ar: "الهواتف" }, href: "/electronics/mobiles" },
      {
        name: { en: "Tablets", ar: "الأجهزة اللوحية" },
        href: "/electronics/tablets",
      },
      {
        name: { en: "Laptops", ar: "أجهزة الكمبيوتر المحمولة" },
        href: "/electronics/laptops",
      },
      {
        name: { en: "Home Appliances", ar: "الأجهزة المنزلية" },
        href: "/electronics/appliances",
      },
      {
        name: { en: "Camera, Photo & Video", ar: "كاميرات وصور وفيديو" },
        href: "/electronics/cameras",
      },
      {
        name: { en: "Televisions", ar: "أجهزة التلفاز" },
        href: "/electronics/tvs",
      },
      {
        name: { en: "Headphones", ar: "سماعات الرأس" },
        href: "/electronics/headphones",
      },
      {
        name: { en: "Video Games", ar: "ألعاب الفيديو" },
        href: "/electronics/games",
      },
    ],
  },
  {
    title: { en: "FASHION", ar: "أزياء" },
    links: [
      {
        name: { en: "Women's Fashion", ar: "أزياء النساء" },
        href: "/fashion/women",
      },
      {
        name: { en: "Men's Fashion", ar: "أزياء الرجال" },
        href: "/fashion/men",
      },
      {
        name: { en: "Girls' Fashion", ar: "أزياء البنات" },
        href: "/fashion/girls",
      },
      {
        name: { en: "Boys' Fashion", ar: "أزياء الأولاد" },
        href: "/fashion/boys",
      },
      {
        name: { en: "Men's Watches", ar: "ساعات الرجال" },
        href: "/fashion/mens-watches",
      },
      {
        name: { en: "Women's Watches", ar: "ساعات النساء" },
        href: "/fashion/womens-watches",
      },
      { name: { en: "Eyewear", ar: "نظارات" }, href: "/fashion/eyewear" },
      {
        name: { en: "Bags & Luggage", ar: "الحقائب والأمتعة" },
        href: "/fashion/bags",
      },
    ],
  },
  {
    title: { en: "HOME AND KITCHEN", ar: "المنزل والمطبخ" },
    links: [
      {
        name: { en: "Kitchen & Dining", ar: "المطبخ وتناول الطعام" },
        href: "/home/kitchen",
      },
      { name: { en: "Bedding", ar: "مفروشات" }, href: "/home/bedding" },
      { name: { en: "Bath", ar: "الحمام" }, href: "/home/bath" },
      { name: { en: "Home Decor", ar: "ديكور المنزل" }, href: "/home/decor" },
      {
        name: { en: "Home Appliances", ar: "أجهزة منزلية" },
        href: "/home/appliances",
      },
      {
        name: { en: "Tools & Home Improvement", ar: "أدوات وتحسين المنزل" },
        href: "/home/tools",
      },
      {
        name: { en: "Patio, Lawn & Garden", ar: "الفناء والحديقة" },
        href: "/home/garden",
      },
      {
        name: { en: "Home Storage & Organisation", ar: "تخزين وتنظيم المنزل" },
        href: "/home/storage",
      },
    ],
  },
  {
    title: { en: "BEAUTY", ar: "الجمال" },
    links: [
      {
        name: { en: "Women's Fragrance", ar: "عطور النساء" },
        href: "/beauty/womens-fragrance",
      },
      {
        name: { en: "Men's Fragrance", ar: "عطور الرجال" },
        href: "/beauty/mens-fragrance",
      },
      { name: { en: "Make-Up", ar: "مكياج" }, href: "/beauty/makeup" },
      {
        name: { en: "Haircare", ar: "العناية بالشعر" },
        href: "/beauty/haircare",
      },
      {
        name: { en: "Skincare", ar: "العناية بالبشرة" },
        href: "/beauty/skincare",
      },
      {
        name: { en: "Personal Care", ar: "العناية الشخصية" },
        href: "/beauty/personal-care",
      },
      {
        name: { en: "Tools & Accessories", ar: "الأدوات والإكسسوارات" },
        href: "/beauty/tools",
      },
    ],
  },
  {
    title: { en: "KIDS, BABY & TOYS", ar: "أطفال ورضع وألعاب" },
    links: [
      {
        name: { en: "Strollers & Accessories", ar: "عربات وإكسسوارات" },
        href: "/kids/strollers",
      },
      {
        name: { en: "Car Seats", ar: "مقاعد سيارات" },
        href: "/kids/car-seats",
      },
      {
        name: { en: "Baby Clothing", ar: "ملابس الرضع" },
        href: "/kids/baby-clothing",
      },
      { name: { en: "Feeding", ar: "الرضاعة" }, href: "/kids/feeding" },
      {
        name: { en: "Bathing & Skincare", ar: "الاستحمام والعناية بالبشرة" },
        href: "/kids/bathing",
      },
      { name: { en: "Diapering", ar: "الحفاضات" }, href: "/kids/diapering" },
      {
        name: { en: "Baby & Toddler Toys", ar: "ألعاب الرضع والصغار" },
        href: "/kids/toys",
      },
      { name: { en: "Toys & Games", ar: "ألعاب" }, href: "/kids/games" },
    ],
  },
  {
    title: { en: "TOP BRANDS", ar: "أفضل العلامات التجارية" },
    links: [
      { name: { en: "Apple", ar: "آبل" }, href: "/brands/apple" },
      { name: { en: "Samsung", ar: "سامسونج" }, href: "/brands/samsung" },
      { name: { en: "Nike", ar: "نايكي" }, href: "/brands/nike" },
      { name: { en: "Ray-Ban", ar: "راي بان" }, href: "/brands/rayban" },
      { name: { en: "Tefal", ar: "تيفال" }, href: "/brands/tefal" },
      {
        name: { en: "L'Oreal Paris", ar: "لوريال باريس" },
        href: "/brands/loreal",
      },
      { name: { en: "Chicco", ar: "شيكو" }, href: "/brands/chicco" },
      { name: { en: "Tomado", ar: "تومادو" }, href: "/brands/tomado" },
    ],
  },
  {
    title: { en: "DISCOVER NOW", ar: "اكتشف الآن" },
    links: [
      {
        name: { en: "Brand Glossary", ar: "دليل العلامات التجارية" },
        href: "/discover/glossary",
      },
      {
        name: { en: "Noon Kuwait", ar: "نون الكويت" },
        href: "/discover/kuwait",
      },
      {
        name: { en: "Noon Bahrain", ar: "نون البحرين" },
        href: "/discover/bahrain",
      },
      { name: { en: "Noon Oman", ar: "نون عمان" }, href: "/discover/oman" },
      { name: { en: "Noon Qatar", ar: "نون قطر" }, href: "/discover/qatar" },
    ],
  },
];

// Social media links
export const socialMedia: SocialMedia[] = [
  {
    name: "LinkedIn",
    icon: "/icons/icons8-linkedin-circled.svg",
    href: "https://linkedin.com/company/medicova",
  },
  {
    name: "Instagram",
    icon: "/icons/icons8-instagram.svg",
    href: "https://instagram.com/medicova",
  },
  {
    name: "X",
    icon: "/icons/icons8-x.svg",
    href: "https://x.com/medicova",
  },
  {
    name: "Facebook",
    icon: "/icons/icons8-facebook.svg",
    href: "https://facebook.com/medicova",
  },
];

// Payment methods
export const paymentMethods: PaymentMethod[] = [
  { name: "VISA", icon: "/icons/card-visa.svg" },
  { name: "MasterCard", icon: "/icons/card-mastercard.svg" },
  { name: "Valu Pay", icon: "/icons/valu_v2.svg" },
  { name: "amex", icon: "/icons/card-amex.svg" },
  { name: "Cash on Delivery", icon: "/icons/cod-en.svg" },
];

// Legal links
export const legalLinks: LegalLink[] = [
  {
    name: { en: "Careers", ar: "الوظائف" },
    href: "/careers",
  },
  {
    name: { en: "Warranty Policy", ar: "سياسة الضمان" },
    href: "/warranty",
  },
  {
    name: { en: "Sell with us", ar: "البيع معنا" },
    href: "/sell-with-us",
  },
  {
    name: { en: "Terms of Use", ar: "شروط الاستخدام" },
    href: "/terms",
  },
  {
    name: { en: "Terms of Sale", ar: "شروط البيع" },
    href: "/terms-of-sale",
  },
  {
    name: { en: "Privacy Policy", ar: "سياسة الخصوصية" },
    href: "/privacy",
  },
];

// App download links
export const appLinks: AppLink[] = [
  { name: "App Store", icon: "/icons/app-store.svg", href: "#" },
  { name: "Google Play", icon: "/icons/google-play.svg", href: "#" },
  { name: "AppGallery", icon: "/icons/Huawei-icon.avif", href: "#" },
];
