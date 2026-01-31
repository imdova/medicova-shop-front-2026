import { FilterGroup } from "@/types";

// Mock data for filters
export const leftFilters: FilterGroup[] = [
  {
    id: "category",
    name: { en: "Category", ar: "الفئة" },
    options: [
      {
        id: "medical",
        name: {
          en: "Medical Supplies & Equipment",
          ar: "المستلزمات والمعدات الطبية",
        },
        subcategories: [
          {
            id: "medical-wear",
            name: { en: "Medical Wear & Uniforms", ar: "الملابس الطبية والزي" },
            subcategories: [
              {
                id: "scrubs",
                name: { en: "Surgical Scrubs", ar: "ملابس جراحية" },
              },
              {
                id: "lab-coats",
                name: { en: "Lab Coats", ar: "معاطف المختبر" },
              },
              {
                id: "shoes",
                name: { en: "Medical Footwear", ar: "أحذية طبية" },
              },
              {
                id: "nursing-wear",
                name: { en: "Nursing Wear", ar: "ملابس التمريض" },
              },
              {
                id: "medical-accessories",
                name: { en: "Medical Accessories", ar: "إكسسوارات طبية" },
              },
            ],
          },
          {
            id: "medical-equipment",
            name: { en: "Medical Equipment", ar: "معدات طبية" },
            subcategories: [
              {
                id: "diagnostic",
                name: { en: "Diagnostic Equipment", ar: "معدات التشخيص" },
              },
              {
                id: "surgical",
                name: { en: "Surgical Instruments", ar: "أدوات جراحية" },
              },
              {
                id: "equipment-dental",
                name: { en: "Dental Equipment", ar: "معدات الأسنان" },
              },
              {
                id: "hospital-furniture",
                name: { en: "Hospital Furniture", ar: "أثاث المستشفى" },
              },
              {
                id: "monitoring",
                name: {
                  en: "Patient Care Equipment",
                  ar: "معدات رعاية المرضى",
                },
              },
              {
                id: "medical-carts",
                name: { en: "Medical Carts & Stands", ar: "عربات وحوامل طبية" },
              },
            ],
          },
          {
            id: "medical-consumables",
            name: {
              en: "Medical Consumables",
              ar: "المستلزمات الطبية الاستهلاكية",
            },
            subcategories: [
              {
                id: "disposable",
                name: {
                  en: "Disposable Products",
                  ar: "منتجات للاستخدام مرة واحدة",
                },
              },
              {
                id: "face-protection",
                name: { en: "Face Masks & Shields", ar: "أقنعة الوجه والدروع" },
              },
              {
                id: "wound-care",
                name: {
                  en: "Wound Care Supplies",
                  ar: "مستلزمات العناية بالجروح",
                },
              },
              {
                id: "infection-control",
                name: { en: "Infection Control", ar: "مكافحة العدوى" },
              },
              {
                id: "medical-consumables-tapes",
                name: {
                  en: "Medical Tapes & Dressings",
                  ar: "لاصقات طبية وضمادات",
                },
              },
              {
                id: "syringes-needles",
                name: { en: "Syringes & Needles", ar: "الحقن والإبر" },
              },
            ],
          },
        ],
      },
      {
        id: "lifestyle",
        name: { en: "Lifestyle Products", ar: "منتجات نمط الحياة" },
        subcategories: [
          {
            id: "fashion",
            name: { en: "Fashion", ar: "الأزياء" },
            subcategories: [
              { id: "casual", name: { en: "Casual Wear", ar: "ملابس كاجوال" } },
              { id: "formal", name: { en: "Formal Wear", ar: "ملابس رسمية" } },
              {
                id: "athleisure",
                name: { en: "Athleisure", ar: "ملابس رياضية" },
              },
            ],
          },
          {
            id: "accessories",
            name: { en: "Accessories", ar: "الإكسسوارات" },
            subcategories: [
              { id: "watches", name: { en: "Watches", ar: "ساعات" } },
              { id: "jewelry", name: { en: "Jewelry", ar: "مجوهرات" } },
              { id: "eyewear", name: { en: "Eyewear", ar: "نظارات" } },
            ],
          },
          {
            id: "wellness",
            name: { en: "Wellness", ar: "العناية الذاتية" },
            subcategories: [
              {
                id: "fitness",
                name: { en: "Fitness Equipment", ar: "معدات اللياقة" },
              },
              {
                id: "massage",
                name: { en: "Massage Tools", ar: "أدوات التدليك" },
              },
              { id: "relaxation", name: { en: "Relaxation", ar: "الاسترخاء" } },
            ],
          },
          {
            id: "personal-care",
            name: { en: "Personal Care", ar: "العناية الشخصية" },
            subcategories: [
              { id: "fragrances", name: { en: "Fragrances", ar: "العطور" } },
              {
                id: "skincare",
                name: { en: "Skincare", ar: "العناية بالبشرة" },
              },
              {
                id: "haircare",
                name: { en: "Haircare", ar: "العناية بالشعر" },
              },
            ],
          },
        ],
      },
      {
        id: "all-medical",
        name: { en: "All Medical Supplies", ar: "جميع المستلزمات الطبية" },
      },
      {
        id: "all-lifestyle",
        name: { en: "All Lifestyle Products", ar: "جميع منتجات نمط الحياة" },
      },
    ],
  },
  {
    id: "brand",
    name: { en: "Brand", ar: "العلامة التجارية" },
    options: [
      { id: "apple", name: { en: "Apple", ar: "آبل" }, count: 124 },
      { id: "samsung", name: { en: "Samsung", ar: "سامسونج" }, count: 89 },
      { id: "huawei", name: { en: "Huawei", ar: "هواوي" }, count: 76 },
      { id: "amazfit", name: { en: "Amazfit", ar: "أمازفيت" }, count: 42 },
      { id: "fitbit", name: { en: "Fitbit", ar: "فيتبيت" }, count: 35 },
      { id: "xiaomi", name: { en: "Xiaomi", ar: "شاومي" }, count: 28 },
      { id: "garmin", name: { en: "Garmin", ar: "جارمين" }, count: 22 },
      { id: "fossil", name: { en: "Fossil", ar: "فوسيل" }, count: 18 },
    ],
  },
  {
    id: "price",
    name: { en: "Price", ar: "السعر" },
    options: [
      {
        id: "custom-range",
        name: { en: "Custom Range", ar: "نطاق مخصص" },
        isRange: true,
      },
    ],
  },
  {
    id: "rating",
    name: { en: "Customer Rating", ar: "تقييم العملاء" },
    options: [
      { id: "4.5", name: { en: "4.5 & Up", ar: "4.5 فأعلى" }, count: 1245 },
      { id: "4", name: { en: "4 & Up", ar: "4 فأعلى" }, count: 1890 },
      { id: "3.5", name: { en: "3.5 & Up", ar: "3.5 فأعلى" }, count: 2345 },
      { id: "3", name: { en: "3 & Up", ar: "3 فأعلى" }, count: 2890 },
    ],
  },
  {
    id: "availability",
    name: { en: "Availability", ar: "التوفر" },
    options: [
      { id: "in-stock", name: { en: "In Stock", ar: "متوفر" }, count: 3456 },
      {
        id: "out-of-stock",
        name: { en: "Out of Stock", ar: "غير متوفر" },
        count: 123,
      },
      { id: "pre-order", name: { en: "Pre-order", ar: "طلب مسبق" }, count: 45 },
    ],
  },
];

export const tapFilters: FilterGroup[] = [
  {
    id: "brand",
    name: { en: "Brand", ar: "العلامة التجارية" },
    options: leftFilters.find((f) => f.id === "brand")?.options || [],
  },
  {
    id: "material",
    name: { en: "Material", ar: "الخامة" },
    options: [
      {
        id: "stainless-steel",
        name: { en: "Stainless Steel", ar: "الفولاذ المقاوم للصدأ" },
        count: 45,
      },
      { id: "aluminum", name: { en: "Aluminum", ar: "الألمنيوم" }, count: 32 },
      { id: "plastic", name: { en: "Plastic", ar: "البلاستيك" }, count: 28 },
      { id: "titanium", name: { en: "Titanium", ar: "التيتانيوم" }, count: 12 },
      { id: "ceramic", name: { en: "Ceramic", ar: "السيراميك" }, count: 8 },
    ],
  },
  {
    id: "color",
    name: { en: "Color", ar: "اللون" },
    options: [
      { id: "black", name: { en: "Black", ar: "أسود" }, count: 67 },
      { id: "silver", name: { en: "Silver", ar: "فضي" }, count: 45 },
      { id: "blue", name: { en: "Blue", ar: "أزرق" }, count: 32 },
      { id: "red", name: { en: "Red", ar: "أحمر" }, count: 24 },
      { id: "gold", name: { en: "Gold", ar: "ذهبي" }, count: 18 },
      { id: "white", name: { en: "White", ar: "أبيض" }, count: 15 },
      { id: "green", name: { en: "Green", ar: "أخضر" }, count: 12 },
    ],
  },
  {
    id: "price",
    name: { en: "Price", ar: "السعر" },
    options: [
      {
        id: "custom-range",
        name: { en: "Custom Range", ar: "نطاق مخصص" },
        isRange: true,
      },
    ],
  },
  {
    id: "brand",
    name: { en: "Apple", ar: "آبل" },
    option: "apple",
  },
  {
    id: "brand",
    name: { en: "HUAWEI", ar: "هواوي" },
    option: "huawei",
  },
  {
    id: "category",
    name: { en: "Fashion", ar: "الموضة" },
    option: "fashion",
  },
];

export const sortOptions = [
  { id: "recommended", name: { en: "Recommended", ar: "موصى به" } },
  {
    id: "price-asc",
    name: { en: "Price: Low to High", ar: "السعر: من الأقل إلى الأعلى" },
  },
  {
    id: "price-desc",
    name: { en: "Price: High to Low", ar: "السعر: من الأعلى إلى الأقل" },
  },
  { id: "rating", name: { en: "Customer Rating", ar: "تقييم العملاء" } },
  { id: "newest", name: { en: "Newest Arrivals", ar: "الأحدث" } },
];
