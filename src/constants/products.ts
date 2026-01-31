import { Product } from "@/types/product";

// Dummy medical wear product data
export const products: Product[] = [
  {
    id: "1",
    sku: "PSKU_165988_1749660138380",
    brand: {
      id: "1",
      name: { en: "MediPro", ar: "ميديبرو" },
      url: "/MediPro",
      image: "/images/MediPro.jpg",
    },
    model: { en: "Scrub Set", ar: "طقم سكراب" },
    category: {
      id: "1",
      title: { en: "Medical Wear", ar: "ملابس طبية" },
      url: "/medical-wear",
      image: "/images/medical-wear.jpg",
      subcategory: {
        title: { en: "Medical Shoes", ar: "أحذية طبية" },
        url: "/medical-wear/shoes",
      },
    },
    title: {
      en: "MediPro Professional V-Neck Scrub Top & Pants Set",
      ar: "طقم سكراب برقبة على شكل حرف V وبنطلون من ميديبرو",
    },
    price: 4599,
    del_price: 5999,
    stock: 5,
    status: { en: "Limited stock", ar: "مخزون محدود" },
    rating: 4.7,
    sale: "23% OFF", // Could be {en: "23% OFF", ar: "خصم 23%"} if needed
    sizes: ["S", "M", "L", "XL"], // Assuming sizes are universal abbreviations
    colors: { en: ["Orange", "White"], ar: ["برتقالي", "أبيض"] },
    images: [
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1730710595034-Untitled-1.jpg&w=1920&q=70",
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1730710595035-Untitled-4.jpg&w=1920&q=70",
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1730713251887-Untitled-1.jpg&w=1920&q=70",
    ],
    isBestSaller: true,
    nudges: {
      en: [
        "📌 Only 3 left in stock",
        "🔥 8 people viewing now",
        "⚡ Moisture-wicking fabric",
        "🚚 Delivery by tomorrow",
      ],
      ar: [
        "📌 تبقى 3 قطع فقط في المخزون",
        "🔥 8 أشخاص يشاهدون الآن",
        "⚡ نسيج ماص للرطوبة",
        "🚚 التوصيل غدًا",
      ],
    },
    reviewCount: 124,
    description: {
      en: "Professional scrub set with antimicrobial treatment",
      ar: "طقم سكراب احترافي بمعالجة مضادة للميكروبات",
    },
    features: {
      en: [
        "V-neck top with side slits",
        "Straight leg pants with elastic waist",
        "Antimicrobial treatment",
        "Wrinkle-resistant fabric",
        "Multiple pockets for utility",
      ],
      ar: [
        "بلوزة برقبة على شكل حرف V وفتحات جانبية",
        "بنطال بقصة مستقيمة وخصر مطاطي",
        "معالجة مضادة للميكروبات",
        "قماش مقاوم للتجاعيد",
        "جيوب متعددة للاستخدامات",
      ],
    },
    deliveryTime: { en: "5-7 days", ar: "٥-٧ أيام" },
    installmentOptions: [
      {
        months: 3,
        amount: 1533,
        methodType: {
          id: "1",
          name: "visa",
          price: 0,
          image: "/icons/card-visa.svg",
        },
      },
    ],
    bankOffers: [
      {
        title: {
          en: "3 months installments at 0% interest",
          ar: "3 أشهر أقساط بدون فوائد",
        },
        url: "#",
      },
      {
        title: { en: "Free embroidery available", ar: "تطريز مجاني متاح" },
        url: "#",
      },
    ],
    sellers: {
      id: "seller1",
      name: "MediPro Official Store",
      rating: 4.8,
      positiveRatings: "94%",
      partnerSince: "2018",
      returnPolicy: {
        en: "30 days return policy",
        ar: "سياسة إرجاع خلال 30 يومًا",
      },
      itemShown: 90,
      status: { en: "active", ar: "نشط" },
      isActive: false,
    },

    overview_desc: {
      en: "Professional-grade scrubs designed for healthcare workers with all-day comfort in mind. Made from durable, easy-care fabric that stands up to repeated washing.",
      ar: "سكراب احترافي مصمم للعاملين في مجال الرعاية الصحية مع الأخذ في الاعتبار الراحة طوال اليوم. مصنوع من قماش متين وسهل العناية به ويتحمل الغسيل المتكرر.",
    },
    highlights: {
      en: [
        "Antimicrobial treatment reduces odor-causing bacteria",
        "Multiple pockets for convenient storage",
        "Wrinkle-resistant for professional appearance",
      ],
      ar: [
        "المعالجة المضادة للميكروبات تقلل البكتيريا المسببة للرائحة",
        "جيوب متعددة للتخزين المريح",
        "مقاوم للتجاعيد لمظهر احترافي",
      ],
    },
    specifications: [
      {
        label: { en: "Material", ar: "الخامة" },
        content: {
          en: "65% Polyester, 35% Cotton",
          ar: "65% بوليستر، 35% قطن",
        },
      },
      {
        label: { en: "Color", ar: "اللون" },
        content: { en: "Navy, Royal Blue, Black", ar: "كحلي، أزرق ملكي، أسود" },
      },
      {
        label: { en: "Care Instructions", ar: "تعليمات العناية" },
        content: {
          en: "Machine wash, tumble dry low",
          ar: "غسيل آلي، تجفيف منخفض",
        },
      },
      {
        label: { en: "Fit Type", ar: "نوع القصة" },
        content: { en: "Regular Fit", ar: "قصة عادية" },
      },
      {
        label: { en: "Closure Type", ar: "نوع الإغلاق" },
        content: { en: "Pull On", ar: "سحب" },
      },
    ],
    shipping_fee: 0,
    shippingMethod: { en: "standard", ar: "قياسي" },
    weightKg: 2,
  },
  {
    id: "2",
    brand: {
      id: "2",
      name: { en: "WhiteCoat", ar: "وايت كوت" },
      url: "/WhiteCoat",
      image: "/images/WhiteCoat.jpg",
    },
    model: { en: "Lab Coat", ar: "بالطو معمل" },
    stock: 4,
    category: {
      id: "1",
      title: { en: "Medical Wear", ar: "ملابس طبية" },
      url: "/medical-wear",
      image: "/images/medical-wear.jpg",
      subcategory: {
        title: { en: "Surgical Caps", ar: "قبعات جراحية" },
        url: "/medical-wear/surgical-caps",
      },
    },
    title: {
      en: "WhiteCoat Professional Lab Coat with Embroidery Option",
      ar: "بالطو معمل احترافي من وايت كوت مع خيار التطريز",
    },
    price: 6899,
    del_price: 8999,
    status: { en: "New arrival", ar: "وصل حديثاً" },
    rating: 4.8,
    sale: "23% OFF",
    sizes: ["S", "M", "L", "XL"],
    colors: { en: ["Orange", "White"], ar: ["برتقالي", "أبيض"] },
    images: [
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1725131056230-MM%20Photography-.jpg&w=1920&q=70",
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1725131056231-MM%20Photography-290.jpg&w=1920&q=70",
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1725131056230-MM%20Photography-.jpg&w=1920&q=70",
    ],
    isBestSaller: false,
    nudges: {
      en: [
        "📌 Bestseller in Lab Coats",
        "🔥 Custom embroidery available",
        "⚡ Stain-resistant fabric",
        "🚚 Free returns",
      ],
      ar: [
        "📌 الأكثر مبيعاً في بالطوهات المعمل",
        "🔥 تطريز مخصص متاح",
        "⚡ قماش مقاوم للبقع",
        "🚚 إرجاع مجاني",
      ],
    },
    reviewCount: 87,
    description: {
      en: "Professional lab coat with premium fabric and functional design",
      ar: "بالطو معمل احترافي بقماش فاخر وتصميم عملي",
    },
    features: {
      en: [
        "Premium cotton-polyester blend",
        "Notched lapel collar",
        "Three pockets (two lower, one chest)",
        "Side slits for ease of movement",
        "Optional embroidery service",
      ],
      ar: [
        "مزيج قطن وبوليستر فاخر",
        "ياقة مطوية",
        "ثلاثة جيوب (اثنان سفلية، واحد على الصدر)",
        "فتحات جانبية لسهولة الحركة",
        "خدمة تطريز اختيارية",
      ],
    },
    deliveryTime: { en: "5-7 days", ar: "٥-٧ أيام" },
    installmentOptions: [
      {
        months: 3,
        amount: 2300,
        methodType: {
          id: "1",
          name: "visa",
          price: 0,
          image: "/icons/card-visa.svg",
        },
      },
    ],
    bankOffers: [
      {
        title: {
          en: "3 months installments at 0% interest",
          ar: "3 أشهر أقساط بدون فوائد",
        },
        url: "#",
      },
      {
        title: { en: "Free embroidery available", ar: "تطريز مجاني متاح" },
        url: "#",
      },
    ],
    sellers: {
      id: "seller2",
      name: "WhiteCoat Official Store",
      rating: 4.9,
      positiveRatings: "96%",
      partnerSince: "2017",
      returnPolicy: {
        en: "30 days return policy",
        ar: "سياسة إرجاع خلال 30 يومًا",
      },
      itemShown: 90,
      status: { en: "active", ar: "نشط" },
      isActive: false,
    },

    overview_desc: {
      en: "A professional lab coat designed for doctors, nurses, and medical students. Features a classic design with modern functionality and premium fabric that resists stains and wrinkles.",
      ar: "بالطو معمل احترافي مصمم للأطباء والممرضات وطلاب الطب. يتميز بتصميم كلاسيكي بوظائف حديثة وقماش فاخر يقاوم البقع والتجاعيد.",
    },
    highlights: {
      en: [
        "Optional embroidery for personalization",
        "Stain-resistant fabric maintains professional appearance",
        "Functional pockets for daily use",
      ],
      ar: [
        "تطريز اختياري للتخصيص",
        "قماش مقاوم للبقع يحافظ على المظهر الاحترافي",
        "جيوب عملية للاستخدام اليومي",
      ],
    },
    specifications: [
      {
        label: { en: "Material", ar: "الخامة" },
        content: {
          en: "65% Polyester, 35% Cotton",
          ar: "65% بوليستر، 35% قطن",
        },
      },
      {
        label: { en: "Color", ar: "اللون" },
        content: { en: "White", ar: "أبيض" },
      },
      {
        label: { en: "Care Instructions", ar: "تعليمات العناية" },
        content: { en: "Machine washable", ar: "قابل للغسل في الغسالة" },
      },
      {
        label: { en: "Fit Type", ar: "نوع القصة" },
        content: { en: "Regular Fit", ar: "قصة عادية" },
      },
      {
        label: { en: "Closure Type", ar: "نوع الإغلاق" },
        content: { en: "Button Front", ar: "أزرار أمامية" },
      },
    ],
    shipping_fee: 0,
    shippingMethod: { en: "free", ar: "مجاني" },
    weightKg: 0,
  },
  {
    id: "3",
    brand: {
      id: "3",
      name: { en: "NurseMates", ar: "نيرس ميتس" },
      url: "/NurseMates",
      image: "/images/NurseMates.jpg",
    },
    model: { en: "Alicia", ar: "أليسيا" },
    category: {
      id: "1",
      title: { en: "Medical Wear", ar: "ملابس طبية" },
      url: "/medical-wear",
      image: "/images/medical-wear.jpg",
      subcategory: {
        title: { en: "Surgical Caps", ar: "قبعات جراحية" },
        url: "/medical-wear/surgical-caps",
      },
    },
    title: {
      en: "NurseMates Alicia Women's Medical Shoes",
      ar: "أحذية نيرس ميتس أليسيا الطبية النسائية",
    },
    price: 7999,
    del_price: 9999,
    status: { en: "Trending", ar: "رائج" },
    rating: 4.6,
    sale: "20% OFF",
    sizes: ["38", "30", "40", "28"], // Assuming sizes are universal numbers
    colors: { en: ["Black", "White", "Red"], ar: ["أسود", "أبيض", "أحمر"] },
    images: [
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1720957542880-1.jpg&w=1920&q=70",
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1720957542880-1.jpg&w=1920&q=70",
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1720957542880-1.jpg&w=1920&q=70",
    ],
    isBestSaller: true,
    nudges: {
      en: [
        "📌 Last few pairs left",
        "🔥 12 bought today",
        "⚡ Slip-resistant soles",
        "🚚 Includes arch support",
      ],
      ar: [
        "📌 تبقى آخر بضعة أزواج",
        "🔥 تم شراء 12 اليوم",
        "⚡ نعل مقاوم للانزلاق",
        "🚚 يشمل دعم القوس",
      ],
    },
    reviewCount: 215,
    description: {
      en: "Comfortable medical shoes designed for healthcare professionals",
      ar: "أحذية طبية مريحة مصممة للعاملين في مجال الرعاية الصحية",
    },
    features: {
      en: [
        "Slip-resistant rubber outsole",
        "Removable cushioned insole",
        "Lightweight design",
        "Breathable mesh upper",
        "Easy to clean",
      ],
      ar: [
        "نعل خارجي مطاطي مقاوم للانزلاق",
        "نعل داخلي مبطن قابل للإزالة",
        "تصميم خفيف الوزن",
        "جزء علوي شبكي يسمح بالتهوية",
        "سهلة التنظيف",
      ],
    },
    deliveryTime: { en: "5-10 days", ar: "٥-١٠ أيام" },
    installmentOptions: [
      {
        months: 3,
        amount: 2666,
        methodType: {
          id: "1",
          name: "visa",
          price: 0,
          image: "/icons/card-visa.svg",
        },
      },
    ],
    bankOffers: [
      {
        title: {
          en: "3 months installments at 0% interest",
          ar: "3 أشهر أقساط بدون فوائد",
        },
        url: "#",
      },
      {
        title: {
          en: "Free shipping on all orders",
          ar: "شحن مجاني على جميع الطلبات",
        },
        url: "#",
      },
    ],
    sellers: {
      id: "seller3",
      name: "NurseMates Official Store",
      rating: 4.7,
      positiveRatings: "92%",
      partnerSince: "2019",
      returnPolicy: {
        en: "30 days return policy",
        ar: "سياسة إرجاع خلال 30 يومًا",
      },
      itemShown: 90,
      status: { en: "active", ar: "نشط" },
      isActive: false,
    },

    overview_desc: {
      en: "The NurseMates Alicia shoes are designed specifically for healthcare professionals who spend long hours on their feet. Features slip-resistant soles and cushioned support for all-day comfort.",
      ar: "تم تصميم أحذية نيرس ميتس أليسيا خصيصًا للعاملين في مجال الرعاية الصحية الذين يقضون ساعات طويلة واقفين. تتميز بنعال مقاومة للانزلاق ودعم مبطن لراحة طوال اليوم.",
    },
    highlights: {
      en: [
        "Slip-resistant soles for safety",
        "Removable cushioned insole for comfort",
        "Easy to clean and maintain",
      ],
      ar: [
        "نعال مقاومة للانزلاق للسلامة",
        "نعل داخلي مبطن قابل للإزالة للراحة",
        "سهلة التنظيف والصيانة",
      ],
    },
    specifications: [
      {
        label: { en: "Material", ar: "الخامة" },
        content: {
          en: "Mesh upper, rubber sole",
          ar: "جزء علوي شبكي، نعل مطاطي",
        },
      },
      {
        label: { en: "Color", ar: "اللون" },
        content: { en: "White, Black", ar: "أبيض، أسود" },
      },
      {
        label: { en: "Shoe Width", ar: "عرض الحذاء" },
        content: { en: "Medium", ar: "متوسط" },
      },
      {
        label: { en: "Closure Type", ar: "نوع الإغلاق" },
        content: { en: "Lace-up", ar: "رباط" },
      },
      {
        label: { en: "Heel Height", ar: "ارتفاع الكعب" },
        content: { en: "1 inch", ar: "1 بوصة" },
      },
    ],
    shipping_fee: 0,
    shippingMethod: { en: "standard", ar: "قياسي" },
    weightKg: 0,
  },
  {
    id: "4",
    brand: {
      id: "4",
      name: { en: "SurgiCap", ar: "سورجيكاب" },
      url: "/SurgiCap",
      image: "/images/SurgiCap.jpg",
    },
    model: { en: "Bouffant", ar: "بوفانت" },
    category: {
      id: "1",
      title: { en: "Medical Wear", ar: "ملابس طبية" },
      url: "/medical-wear",
      image: "/images/medical-wear.jpg",
      subcategory: {
        title: { en: "Scrubs", ar: "سكراب" },
        url: "/medical-wear/scrubs",
      },
    },
    title: {
      en: "SurgiCap Disposable Bouffant Surgical Caps (100 Pack)",
      ar: "قبعات جراحية بوفانت للاستعمال مرة واحدة من سورجيكاب (عبوة 100)",
    },
    price: 2499,
    del_price: 3499,
    status: { en: "Popular", ar: "شائع" },
    rating: 4.5,
    sale: "29% OFF",
    images: [
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1720961738648-Untitled-1.jpg&w=1920&q=70",
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1720961738648-Untitled-2.jpg&w=1920&q=70",
      "https://www.drbrandscrubs.com/_next/image?url=https%3A%2F%2Fs.drbrandscrubs.com%2Fuploads%2F1730380870868-Untitled-2.jpg&w=1920&q=70",
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"], // Assuming sizes are universal abbreviations
    colors: { en: ["Black", "White", "Red"], ar: ["أسود", "أبيض", "أحمر"] },
    isBestSaller: false,
    nudges: {
      en: [
        "📌 Best for OR use",
        "🔥 100 caps per pack",
        "⚡ Latex-free material",
        "🚚 Free shipping",
      ],
      ar: [
        "📌 الأفضل للاستخدام في غرفة العمليات",
        "🔥 100 قبعة في العبوة",
        "⚡ مادة خالية من اللاتكس",
        "🚚 شحن مجاني",
      ],
    },
    reviewCount: 342,
    description: {
      en: "Disposable bouffant surgical caps for medical professionals",
      ar: "قبعات جراحية بوفانت للاستعمال مرة واحدة للمهنيين الطبيين",
    },
    features: {
      en: [
        "100 caps per package",
        "Latex-free and non-irritating",
        "Breathable material",
        "One-size-fits-all design",
        "Comfortable elastic band",
      ],
      ar: [
        "100 قبعة لكل عبوة",
        "خالية من اللاتكس ولا تسبب تهيجًا",
        "مادة قابلة للتنفس",
        "تصميم يناسب الجميع بمقاس واحد",
        "شريط مطاطي مريح",
      ],
    },
    deliveryTime: { en: "6-12 days", ar: "٦-١٢ يوم" },
    installmentOptions: [
      {
        months: 3,
        amount: 833,
        methodType: {
          id: "1",
          name: "visa",
          price: 0,
          image: "/icons/card-visa.svg",
        },
      },
    ],
    bankOffers: [
      {
        title: {
          en: "Free shipping on all orders",
          ar: "شحن مجاني على جميع الطلبات",
        },
        url: "#",
      },
      {
        title: {
          en: "Bulk discounts available",
          ar: "خصومات على الكميات الكبيرة متاحة",
        },
        url: "#",
      },
    ],
    sellers: {
      id: "seller4",
      name: "MedSupply Direct",
      rating: 4.6,
      positiveRatings: "91%",
      partnerSince: "2016",
      returnPolicy: {
        en: "30 days return policy",
        ar: "سياسة إرجاع خلال 30 يومًا",
      },
      itemShown: 90,
      status: { en: "active", ar: "نشط" },
      isActive: false,
    },

    overview_desc: {
      en: "Disposable bouffant surgical caps designed for comfort and functionality in medical environments. Latex-free material is gentle on skin while providing secure coverage.",
      ar: "قبعات جراحية بوفانت للاستعمال مرة واحدة مصممة للراحة والوظائف في البيئات الطبية. مادة خالية من اللاتكس لطيفة على البشرة مع توفير تغطية آمنة.",
    },
    highlights: {
      en: [
        "100 caps per package for value",
        "Latex-free material for sensitive skin",
        "Breathable fabric for comfort",
      ],
      ar: [
        "100 قبعة لكل عبوة لقيمة ممتازة",
        "مادة خالية من اللاتكس للبشرة الحساسة",
        "قماش قابل للتنفس للراحة",
      ],
    },
    specifications: [
      {
        label: { en: "Material", ar: "الخامة" },
        content: {
          en: "Non-woven polypropylene",
          ar: "بولي بروبيلين غير منسوج",
        },
      },
      {
        label: { en: "Color", ar: "اللون" },
        content: { en: "Blue", ar: "أزرق" },
      },
      {
        label: { en: "Quantity", ar: "الكمية" },
        content: { en: "100 caps", ar: "100 قبعة" },
      },
      {
        label: { en: "Features", ar: "الميزات" },
        content: {
          en: "Latex-free, breathable",
          ar: "خالٍ من اللاتكس، قابل للتنفس",
        },
      },
      {
        label: { en: "Size", ar: "المقاس" },
        content: {
          en: "One size fits most",
          ar: "مقاس واحد يناسب معظم الأحجام",
        },
      },
    ],
    shipping_fee: 0,
    shippingMethod: { en: "free", ar: "مجاني" },
    weightKg: 0,
  },
  {
    id: "5",
    brand: {
      id: "5",
      name: { en: "HealingHands", ar: "هيلينج هاندز" },
      url: "/HealingHands",
      image: "/images/HealingHands.jpg",
    },
    model: { en: "Compression Socks", ar: "جوارب ضاغطة" },
    category: {
      id: "1",
      title: { en: "Medical Wear", ar: "ملابس طبية" },
      url: "/medical-wear",
      image: "/images/medical-wear.jpg",
      subcategory: {
        title: { en: "Lab Coats", ar: "بالطوهات معمل" },
        url: "/medical-wear/lab-coats",
      },
    },
    title: {
      en: "HealingHands 15-20 mmHg Compression Socks (3 Pack)",
      ar: "جوارب ضاغطة هيلينج هاندز 15-20 مم زئبق (عبوة 3 قطع)",
    },
    price: 3899,
    del_price: 4999,
    status: { en: "Hot deal", ar: "صفقة رائعة" },
    rating: 4.8,
    sale: "22% OFF",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: { en: ["Black", "White", "Red"], ar: ["أسود", "أبيض", "أحمر"] },
    images: [
      "https://www.healinghandsscrubs.com/dw/image/v2/BDTL_PRD/on/demandware.static/-/Sites-allheart-m-catalog/default/dw182c65ac/images/large/1_hh-2285---sls_650.jpg?sw=650&sh=1000&sm=fit&sfrm=JPG",
      "https://www.healinghandsscrubs.com/dw/image/v2/BDTL_PRD/on/demandware.static/-/Sites-allheart-m-catalog/default/dw182c65ac/images/large/1_hh-2285---sls_650.jpg?sw=650&sh=1000&sm=fit&sfrm=JPGg",
      "https://www.healinghandsscrubs.com/dw/image/v2/BDTL_PRD/on/demandware.static/-/Sites-allheart-m-catalog/default/dw15de2580/images/large/6_hh-2285---sls_650.jpg?sw=650&sh=1000&sm=fit&sfrm=JPG",
    ],
    isBestSaller: true,
    nudges: {
      en: [
        "📌 Doctor recommended",
        "🔥 30hr comfort guarantee",
        "⚡ 3-pack value",
        "🚚 Includes carrying case",
      ],
      ar: [
        "📌 يوصي به الأطباء",
        "🔥 ضمان راحة لمدة 30 ساعة",
        "⚡ قيمة عبوة 3 قطع",
        "🚚 يشمل حقيبة حمل",
      ],
    },
    reviewCount: 478,
    description: {
      en: "Medical-grade compression socks for healthcare professionals",
      ar: "جوارب ضاغطة طبية للمهنيين الصحيين",
    },
    features: {
      en: [
        "15-20 mmHg graduated compression",
        "Breathable moisture-wicking fabric",
        "Reinforced heel and toe",
        "Non-binding top band",
        "3-pack with assorted colors",
      ],
      ar: [
        "ضغط متدرج 15-20 مم زئبق",
        "قماش قابل للتنفس وماص للرطوبة",
        "كعب ومقدمة معززة",
        "شريط علوي غير ضيق",
        "عبوة من 3 قطع بألوان متنوعة",
      ],
    },
    deliveryTime: { en: "3 days", ar: "3 أيام" },
    installmentOptions: [
      {
        months: 3,
        amount: 1300,
        methodType: {
          id: "1",
          name: "visa",
          price: 0,
          image: "/icons/card-visa.svg",
        },
      },
    ],
    bankOffers: [
      {
        title: {
          en: "Free shipping on all orders",
          ar: "شحن مجاني على جميع الطلبات",
        },
        url: "#",
      },
      { title: { en: "Subscribe & save 15%", ar: "اشترك ووفر 15%" }, url: "#" },
    ],
    sellers: {
      id: "seller5",
      name: "HealingHands Medical",
      rating: 4.8,
      positiveRatings: "95%",
      partnerSince: "2015",
      returnPolicy: {
        en: "30 days return policy",
        ar: "سياسة إرجاع خلال 30 يومًا",
      },
      itemShown: 90,
      status: { en: "active", ar: "نشط" },
      isActive: false,
    },

    overview_desc: {
      en: "Medical-grade compression socks designed specifically for healthcare professionals who spend long hours on their feet. Provides graduated compression to improve circulation and reduce fatigue.",
      ar: "جوارب ضاغطة طبية مصممة خصيصًا للعاملين في مجال الرعاية الصحية الذين يقضون ساعات طويلة واقفين. توفر ضغطًا متدرجًا لتحسين الدورة الدموية وتقليل التعب.",
    },
    highlights: {
      en: [
        "15-20 mmHg medical-grade compression",
        "Moisture-wicking fabric keeps feet dry",
        "Reinforced heel and toe for durability",
      ],
      ar: [
        "ضغط طبي 15-20 مم زئبق",
        "قماش ماص للرطوبة يحافظ على جفاف القدمين",
        "كعب ومقدمة معززة للمتانة",
      ],
    },
    specifications: [
      {
        label: { en: "Material", ar: "الخامة" },
        content: {
          en: "85% Nylon, 15% Spandex",
          ar: "85% نايلون، 15% سباندكس",
        },
      },
      {
        label: { en: "Compression Level", ar: "مستوى الضغط" },
        content: { en: "15-20 mmHg", ar: "15-20 مم زئبق" },
      },
      {
        label: { en: "Quantity", ar: "الكمية" },
        content: { en: "3 pairs", ar: "3 أزواج" },
      },
      {
        label: { en: "Size", ar: "المقاس" },
        content: {
          en: "S/M (shoe size 5-10), L/XL (shoe size 10-15)",
          ar: "صغير/متوسط (مقاس الحذاء 5-10)، كبير/كبير جداً (مقاس الحذاء 10-15)",
        },
      },
      {
        label: { en: "Features", ar: "الميزات" },
        content: {
          en: "Graduated compression, moisture-wicking",
          ar: "ضغط متدرج، ماص للرطوبة",
        },
      },
    ],
    shipping_fee: 0,
    shippingMethod: { en: "express", ar: "سريع" },
    weightKg: 0,
  },
  {
    id: "6",
    brand: {
      id: "6",
      name: { en: "ScrubLife", ar: "سكراب لايف" },
      url: "/ScrubLife",
      image: "/images/ScrubLife.jpg",
    },
    model: { en: "Jogger Scrubs", ar: "سكراب رياضي" },
    category: {
      id: "1",
      title: { en: "Medical Wear", ar: "ملابس طبية" },
      url: "/medical-wear",
      image: "/images/medical-wear.jpg",
      subcategory: {
        title: { en: "Scrubs", ar: "سكراب" },
        url: "/medical-wear/scrubs",
      },
    },
    title: {
      en: "ScrubLife Men's Jogger Scrub Pants with Cargo Pockets",
      ar: "بنطال سكراب رياضي رجالي من سكراب لايف بجيوب جانبية",
    },
    price: 4299,
    del_price: 5499,
    status: { en: "Value pack", ar: "عبوة اقتصادية" },
    rating: 4.7,
    sale: "22% OFF",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: { en: ["Blue", "Maroon", "Red"], ar: ["أزرق", "أحمر"] },
    images: [
      "https://www.healinghandsscrubs.com/dw/image/v2/BDTL_PRD/on/demandware.static/-/Sites-allheart-m-catalog/default/dwa73ac753/images/large/1_hh-hh701--pew_650.jpg?sw=650&sh=1000&sm=fit&sfrm=JPG",
      "https://www.healinghandsscrubs.com/dw/image/v2/BDTL_PRD/on/demandware.static/-/Sites-allheart-m-catalog/default/dw7dedf3e8/images/large/2_hh-hh701--pew_650.jpg?sw=650&sh=1000&sm=fit&sfrm=JPG",
      "https://www.healinghandsscrubs.com/dw/image/v2/BDTL_PRD/on/demandware.static/-/Sites-allheart-m-catalog/default/dw912ce286/images/large/4_hh-hh701--pew_650.jpg?sw=650&sh=1000&sm=fit&sfrm=JPG",
    ],
    isBestSaller: false,
    nudges: {
      en: [
        "📌 500+ bought today",
        "🔥 Modern jogger fit",
        "⚡ 7 functional pockets",
        "🚚 Free scrub top with purchase",
      ],
      ar: [
        "📌 تم شراء أكثر من 500 اليوم",
        "🔥 قصة رياضية عصرية",
        "⚡ 7 جيوب عملية",
        "🚚 قطعة علوية مجانية مع الشراء",
      ],
    },
    reviewCount: 189,
    description: {
      en: "Modern jogger-style scrub pants with multiple pockets",
      ar: "بنطال سكراب بتصميم رياضي عصري بجيوب متعددة",
    },
    features: {
      en: [
        "Jogger-style cuff at ankle",
        "7 functional pockets",
        "Elastic waist with drawstring",
        "Stretch fabric for mobility",
        "Wrinkle and stain resistant",
      ],
      ar: [
        "كفة بأسلوب رياضي عند الكاحل",
        "7 جيوب عملية",
        "خصر مطاطي مع رباط",
        "قماش مطاطي للحركة",
        "مقاوم للتجاعيد والبقع",
      ],
    },
    deliveryTime: { en: "5-7 days", ar: "٥-٧ أيام" },
    installmentOptions: [
      {
        months: 3,
        amount: 1433,
        methodType: {
          id: "1",
          name: "visa",
          price: 0,
          image: "/icons/card-visa.svg",
        },
      },
    ],
    bankOffers: [
      {
        title: {
          en: "Free scrub top with purchase",
          ar: "قطعة علوية مجانية مع الشراء",
        },
        url: "#",
      },
      {
        title: {
          en: "3 months installments at 0% interest",
          ar: "3 أشهر أقساط بدون فوائد",
        },
        url: "#",
      },
    ],
    sellers: {
      id: "seller6",
      name: "ScrubLife Official Store",
      rating: 4.7,
      positiveRatings: "93%",
      partnerSince: "2018",
      returnPolicy: {
        en: "30 days return policy",
        ar: "سياسة إرجاع خلال 30 يومًا",
      },
      itemShown: 90,
      status: { en: "active", ar: "نشط" },
      isActive: false,
    },

    overview_desc: {
      en: "Modern jogger-style scrub pants designed for healthcare professionals who want both style and functionality. Features multiple pockets and stretch fabric for all-day comfort.",
      ar: "بنطال سكراب بتصميم رياضي عصري مصمم للعاملين في مجال الرعاية الصحية الذين يرغبون في الأناقة والوظائف. يتميز بجيوب متعددة وقماش مطاطي لراحة طوال اليوم.",
    },
    highlights: {
      en: [
        "Jogger-style cuff for modern look",
        "7 functional pockets for utility",
        "Stretch fabric allows full range of motion",
      ],
      ar: [
        "كفة بأسلوب رياضي لمظهر عصري",
        "7 جيوب عملية للاستخدام",
        "قماش مطاطي يسمح بحرية الحركة الكاملة",
      ],
    },
    specifications: [
      {
        label: { en: "Material", ar: "الخامة" },
        content: {
          en: "65% Polyester, 30% Cotton, 5% Spandex",
          ar: "65% بوليستر، 30% قطن، 5% سباندكس",
        },
      },
      {
        label: { en: "Color", ar: "اللون" },
        content: {
          en: "Navy, Charcoal, Forest Green",
          ar: "كحلي، فحمي، أخضر غامق",
        },
      },
      {
        label: { en: "Care Instructions", ar: "تعليمات العناية" },
        content: {
          en: "Machine wash, tumble dry low",
          ar: "غسيل آلي، تجفيف منخفض",
        },
      },
      {
        label: { en: "Fit Type", ar: "نوع القصة" },
        content: { en: "Jogger Fit", ar: "قصة رياضية" },
      },
      {
        label: { en: "Closure Type", ar: "نوع الإغلاق" },
        content: {
          en: "Elastic Waist with Drawstring",
          ar: "خصر مطاطي مع رباط",
        },
      },
    ],
    shipping_fee: 0,
    shippingMethod: { en: "standard", ar: "قياسي" },
    weightKg: 0,
  },
  {
    id: "7",
    brand: {
      id: "7",
      name: { en: "ORReady", ar: "أو آر ريدي" },
      url: "/ORReady",
      image: "/images/ORReady.jpg",
    },
    model: { en: "Surgical Gown", ar: "روب جراحي" },
    category: {
      id: "1",
      title: { en: "Medical Wear", ar: "ملابس طبية" },
      url: "/medical-wear",
      image: "/images/medical-wear.jpg",
      subcategory: {
        title: { en: "Scrubs", ar: "سكراب" },
        url: "/medical-wear/scrubs",
      },
    },
    title: {
      en: "ORReady Level 3 Disposable Surgical Gowns (25 Pack)",
      ar: "أرواب جراحية للاستعمال مرة واحدة مستوى 3 من أو آر ريدي (عبوة 25 قطعة)",
    },
    price: 8999,
    del_price: 11999,
    status: { en: "Special offer", ar: "عرض خاص" },
    rating: 4.6,
    sale: "25% OFF",
    sizes: ["M", "L", "XL", "XXL"],
    images: [
      "https://shopcdnpro.grainajz.com/category/73695/1348/da3048e2afa28ec288c428d54142c0d7/71.jpg",
      "https://shopcdnpro.grainajz.com/category/73695/1348/6a8f3e99428a0f482f0aff80d352f847/00.jpg",
      "https://shopcdnpro.grainajz.com/category/73695/1348/328fc89dc719a8696ff15d1390715ed8/01.jpg",
    ],
    isBestSaller: true,
    nudges: {
      en: [
        "📌 AAMI Level 3 protection",
        "🔥 25 gowns per box",
        "⚡ Fluid-resistant material",
        "🚚 2 year warranty",
      ],
      ar: [
        "📌 حماية مستوى AAMI 3",
        "🔥 25 روب في الصندوق",
        "⚡ مادة مقاومة للسوائل",
        "🚚 ضمان سنتين",
      ],
    },
    reviewCount: 156,
    description: {
      en: "Level 3 disposable surgical gowns for medical professionals",
      ar: "أرواب جراحية للاستعمال مرة واحدة مستوى 3 للمهنيين الطبيين",
    },
    features: {
      en: [
        "AAMI Level 3 protection",
        "Reinforced critical zones",
        "Breathable material",
        "Thumb hooks for secure fit",
        "Latex-free",
      ],
      ar: [
        "حماية AAMI مستوى 3",
        "مناطق حرجة معززة",
        "مادة قابلة للتنفس",
        "حلقات إبهام لتثبيت آمن",
        "خالي من اللاتكس",
      ],
    },
    deliveryTime: { en: "2-3 days", ar: "٢-٣ أيام" },
    installmentOptions: [
      {
        months: 3,
        amount: 3000,
        methodType: {
          id: "1",
          name: "visa",
          price: 0,
          image: "/icons/card-visa.svg",
        },
      },
    ],
    bankOffers: [
      {
        title: {
          en: "Bulk discounts available",
          ar: "خصومات على الكميات الكبيرة متاحة",
        },
        url: "#",
      },
      {
        title: {
          en: "Free shipping on orders over ₹5000",
          ar: "شحن مجاني للطلبات فوق ٥٠٠٠ جنيه",
        },
        url: "#",
      },
    ],
    sellers: {
      id: "seller7",
      name: "MedEquip Supplies",
      rating: 4.7,
      positiveRatings: "94%",
      partnerSince: "2017",
      returnPolicy: {
        en: "30 days return policy",
        ar: "سياسة إرجاع خلال 30 يومًا",
      },
      itemShown: 90,
      status: { en: "active", ar: "نشط" },
      isActive: false,
    },

    overview_desc: {
      en: "Level 3 disposable surgical gowns that provide critical zone protection against fluid penetration. Designed for surgical procedures where moderate to high fluid protection is needed.",
      ar: "أرواب جراحية للاستعمال مرة واحدة مستوى 3 توفر حماية للمناطق الحرجة ضد اختراق السوائل. مصممة للإجراءات الجراحية التي تتطلب حماية متوسطة إلى عالية من السوائل.",
    },
    highlights: {
      en: [
        "AAMI Level 3 fluid protection",
        "Reinforced critical zones for safety",
        "Breathable material for comfort during long procedures",
      ],
      ar: [
        "حماية AAMI مستوى 3 من السوائل",
        "مناطق حرجة معززة للسلامة",
        "مادة قابلة للتنفس للراحة خلال الإجراءات الطويلة",
      ],
    },
    specifications: [
      {
        label: { en: "Material", ar: "الخامة" },
        content: {
          en: "SMS (Spunbond-Meltblown-Spunbond)",
          ar: "SMS (سبونبوند-ميلت بلون-سبونبوند)",
        },
      },
      {
        label: { en: "Protection Level", ar: "مستوى الحماية" },
        content: { en: "AAMI Level 3", ar: "AAMI مستوى 3" },
      },
      {
        label: { en: "Quantity", ar: "الكمية" },
        content: { en: "25 gowns per box", ar: "25 روب لكل صندوق" },
      },
      {
        label: { en: "Size", ar: "المقاس" },
        content: { en: "Regular, Large, X-Large", ar: "عادي، كبير، كبير جداً" },
      },
      {
        label: { en: "Features", ar: "الميزات" },
        content: {
          en: "Fluid-resistant, breathable",
          ar: "مقاوم للسوائل، قابل للتنفس",
        },
      },
    ],
    shipping_fee: 0,
    shippingMethod: { en: "express", ar: "سريع" },
    weightKg: 0,
  },
  {
    id: "8",
    brand: {
      id: "8",
      name: { en: "StethoStyle", ar: "ستيثو ستايل" },
      url: "/StethoStyle",
      image: "/images/StethoStyle.jpg",
    },
    model: { en: "Warm-Up Jacket", ar: "جاكيت تدفئة" },
    category: {
      id: "1",
      title: { en: "Medical Wear", ar: "ملابس طبية" },
      url: "/medical-wear",
      image: "/images/medical-wear.jpg",
      subcategory: {
        title: { en: "Scrubs", ar: "سكراب" },
        url: "/medical-wear/scrubs",
      },
    },
    title: {
      en: "StethoStyle Fleece Warm-Up Jacket for Medical Professionals",
      ar: "جاكيت تدفئة من الصوف من ستيثو ستايل للمهنيين الطبيين",
    },
    price: 6599,
    del_price: 7999,
    status: { en: "Almost gone", ar: "على وشك النفاد" },
    rating: 4.5,
    sale: "18% OFF",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: { en: ["Black", "White", "Red"], ar: ["أسود", "أبيض", "أحمر"] },
    images: [
      "https://www.healinghandsscrubs.com/dw/image/v2/BDTL_PRD/on/demandware.static/-/Sites-allheart-m-catalog/default/dw07336ef5/images/large/1_hh-hh300f-roy_650.jpg?sw=650&sh=1000&sm=fit&sfrm=JPGhttps://www.healinghandsscrubs.com/dw/image/v2/BDTL_PRD/on/demandware.static/-/Sites-allheart-m-catalog/default/dw07336ef5/images/large/1_hh-hh300f-roy_650.jpg?sw=650&sh=1000&sm=fit&sfrm=JPG",
      "https://www.healinghandsscrubs.com/dw/image/v2/BDTL_PRD/on/demandware.static/-/Sites-allheart-m-catalog/default/dw2cfb39aa/images/large/2_hh-hh300f-roy_650.jpg?sw=650&sh=1000&sm=fit&sfrm=JPG",
      "https://www.healinghandsscrubs.com/dw/image/v2/BDTL_PRD/on/demandware.static/-/Sites-allheart-m-catalog/default/dw82c7ae22/images/large/4_hh-hh300f-roy_650.jpg?sw=650&sh=1000&sm=fit&sfrm=JPG",
    ],
    isBestSaller: false,
    nudges: {
      en: [
        "📌 Last few sizes left",
        "🔥 Plush fleece lining",
        "⚡ Zippered pockets",
        "🚚 Ships today",
      ],
      ar: [
        "📌 تبقى آخر بضعة مقاسات",
        "🔥 بطانة صوف ناعمة",
        "⚡ جيوب بسحاب",
        "🚚 يشحن اليوم",
      ],
    },
    reviewCount: 92,
    description: {
      en: "Fleece warm-up jacket designed for medical professionals",
      ar: "جاكيت تدفئة من الصوف مصمم للمهنيين الطبيين",
    },
    features: {
      en: [
        "Soft plush fleece lining",
        "Two zippered front pockets",
        "Rib-knit cuffs and waistband",
        "Embroidered logo option",
        "Machine washable",
      ],
      ar: [
        "بطانة صوف ناعمة ودافئة",
        "جيبان أماميان بسحاب",
        "أساور وخصر منسوجة بضلع",
        "خيار شعار مطرز",
        "قابل للغسل في الغسالة",
      ],
    },
    deliveryTime: { en: "5-7 days", ar: "٥-٧ أيام" },
    installmentOptions: [
      {
        months: 3,
        amount: 2200,
        methodType: {
          id: "1",
          name: "visa",
          price: 0,
          image: "/icons/card-visa.svg",
        },
      },
    ],
    bankOffers: [
      {
        title: {
          en: "3 months installments at 0% interest",
          ar: "3 أشهر أقساط بدون فوائد",
        },
        url: "#",
      },
      {
        title: { en: "Free embroidery available", ar: "تطريز مجاني متاح" },
        url: "#",
      },
    ],
    sellers: {
      id: "seller8",
      name: "StethoStyle Apparel",
      rating: 4.6,
      positiveRatings: "92%",
      partnerSince: "2019",
      returnPolicy: {
        en: "30 days return policy",
        ar: "سياسة إرجاع خلال 30 يومًا",
      },
      itemShown: 90,
      status: { en: "active", ar: "نشط" },
      isActive: false,
    },

    overview_desc: {
      en: "A comfortable fleece warm-up jacket designed specifically for healthcare professionals. Perfect for wearing over scrubs in cold environments or during breaks.",
      ar: "جاكيت تدفئة مريح من الصوف مصمم خصيصًا للمهنيين الطبيين. مثالي للارتداء فوق السكراب في البيئات الباردة أو أثناء الاستراحات.",
    },
    highlights: {
      en: [
        "Plush fleece lining for warmth",
        "Zippered pockets secure belongings",
        "Available with optional embroidery",
      ],
      ar: [
        "بطانة صوف ناعمة للدفء",
        "جيوب بسحاب لتأمين المتعلقات",
        "متاح مع تطريز اختياري",
      ],
    },
    specifications: [
      {
        label: { en: "Material", ar: "الخامة" },
        content: { en: "100% Polyester fleece", ar: "100% صوف بوليستر" },
      },
      {
        label: { en: "Color", ar: "اللون" },
        content: { en: "Navy, Black, Royal Blue", ar: "كحلي، أسود، أزرق ملكي" },
      },
      {
        label: { en: "Care Instructions", ar: "تعليمات العناية" },
        content: {
          en: "Machine wash, tumble dry low",
          ar: "غسيل آلي، تجفيف منخفض",
        },
      },
      {
        label: { en: "Fit Type", ar: "نوع القصة" },
        content: { en: "Regular Fit", ar: "قصة عادية" },
      },
      {
        label: { en: "Closure Type", ar: "نوع الإغلاق" },
        content: { en: "Full-zip", ar: "سحاب كامل" },
      },
    ],
    shipping_fee: 0,
    shippingMethod: { en: "express", ar: "سريع" },
    weightKg: 0,
  },
  {
    id: "9",
    brand: {
      id: "9",
      name: { en: "MediTech", ar: "ميديتك" },
      url: "/MediTech",
      image: "/images/MediTech.jpg",
    },
    model: { en: "VitalTrack Pro", ar: "فايتل تراك برو" },
    category: {
      id: "2",
      title: { en: "Medical Accessories", ar: "إكسسوارات طبية" },
      url: "/medical-accessories",
      image: "/images/medical-accessories.jpg",
      subcategory: {
        title: { en: "Watches", ar: "ساعات" },
        url: "/medical-accessories/watches",
      },
    },
    title: {
      en: "MediTech VitalTrack Pro Smartwatch for Healthcare Workers",
      ar: "ساعة ذكية ميديتك فايتل تراك برو للعاملين في مجال الرعاية الصحية",
    },
    price: 12999,
    del_price: 15999,
    status: { en: "New arrival", ar: "وصل حديثاً" },
    rating: 4.7,
    sale: "19% OFF",
    images: [
      "https://f.nooncdn.com/p/pnsku/N70176351V/45/_/1747227180/ec2c3973-e042-433c-8e11-caadaf56cb91.jpg?width=800",
      "https://f.nooncdn.com/p/pnsku/N70176351V/45/_/1747227185/41476a14-3aaf-439d-826e-16f3350b4a05.jpg?width=800",
      "https://f.nooncdn.com/p/pnsku/N70176351V/45/_/1747227185/41476a14-3aaf-439d-826e-16f3350b4a05.jpg?width=800",
    ],
    isBestSaller: true,
    nudges: {
      en: [
        "📌 Pulse ox & heart rate monitoring",
        "🔥 7-day battery life",
        "⚡ Hand wash timer",
        "🚚 Free screen protector",
      ],
      ar: [
        "📌 مراقبة نبض الأوكسجين ومعدل ضربات القلب",
        "🔥 عمر بطارية 7 أيام",
        "⚡ مؤقت غسل اليدين",
        "🚚 واقي شاشة مجاني",
      ],
    },
    reviewCount: 215,
    description: {
      en: "Medical-grade smartwatch with health monitoring features designed for healthcare professionals",
      ar: "ساعة ذكية طبية بميزات مراقبة الصحة مصممة للمهنيين الطبيين",
    },
    features: {
      en: [
        "Continuous heart rate monitoring",
        "Blood oxygen saturation tracking",
        "Hand hygiene timer with reminders",
        "7-day battery life",
        "Water resistant for clinical washing",
      ],
      ar: [
        "مراقبة مستمرة لمعدل ضربات القلب",
        "تتبع تشبع الأكسجين في الدم",
        "مؤقت نظافة اليدين مع تذكيرات",
        "عمر بطارية 7 أيام",
        "مقاومة للماء للغسل السريري",
      ],
    },
    deliveryTime: { en: "5-9 days", ar: "٥-٩ أيام" },
    installmentOptions: [
      {
        months: 6,
        amount: 2167,
        methodType: {
          id: "1",
          name: "visa",
          price: 0,
          image: "/icons/card-visa.svg",
        },
      },
    ],
    bankOffers: [
      {
        title: {
          en: "6 months installments at 0% interest",
          ar: "6 أشهر أقساط بدون فوائد",
        },
        url: "#",
      },
      {
        title: { en: "Free extended warranty", ar: "ضمان ممدد مجاني" },
        url: "#",
      },
    ],
    sellers: {
      id: "seller9",
      name: "MediTech Official Store",
      rating: 4.8,
      positiveRatings: "95%",
      partnerSince: "2020",
      returnPolicy: {
        en: "30 days return policy",
        ar: "سياسة إرجاع خلال 30 يومًا",
      },
      itemShown: 90,
      status: { en: "active", ar: "نشط" },
      isActive: false,
    },

    overview_desc: {
      en: "The VitalTrack Pro is designed specifically for medical professionals, featuring hospital-grade health monitoring and hygiene reminders to support clinical workflows.",
      ar: "تم تصميم فايتل تراك برو خصيصًا للمهنيين الطبيين، ويتميز بمراقبة صحية على مستوى المستشفى وتذكيرات بالنظافة لدعم سير العمل السريري.",
    },
    highlights: {
      en: [
        "FDA-cleared heart rate monitoring",
        "Automatic hand wash timer with compliance tracking",
        "Antimicrobial silicone band",
      ],
      ar: [
        "مراقبة معدل ضربات القلب معتمدة من إدارة الغذاء والدواء الأمريكية",
        "مؤقت تلقائي لغسل اليدين مع تتبع الامتثال",
        "حزام سيليكون مضاد للميكروبات",
      ],
    },
    specifications: [
      {
        label: { en: "Display", ar: "الشاشة" },
        content: {
          en: '1.4" AMOLED Touchscreen',
          ar: "شاشة لمس AMOLED 1.4 بوصة",
        },
      },
      {
        label: { en: "Battery Life", ar: "عمر البطارية" },
        content: { en: "7 days typical use", ar: "7 أيام استخدام عادي" },
      },
      {
        label: { en: "Water Resistance", ar: "مقاومة الماء" },
        content: { en: "5 ATM (splash proof)", ar: "5 ضغط جوي (مقاوم للرذاذ)" },
      },
      {
        label: { en: "Connectivity", ar: "الاتصال" },
        content: { en: "Bluetooth 5.0", ar: "بلوتوث 5.0" },
      },
      {
        label: { en: "Compatibility", ar: "التوافق" },
        content: { en: "iOS & Android", ar: "iOS و أندرويد" },
      },
    ],
    shipping_fee: 0,
    shippingMethod: { en: "express", ar: "سريع" },
    weightKg: 0,
  },
  {
    id: "10",
    brand: {
      id: "10",
      name: { en: "Clinique", ar: "كلينيك" },
      url: "/Clinique",
      image: "/images/Clinique.jpg",
    },
    model: { en: "SteriScent", ar: "ستيري سنت" },
    category: {
      id: "3",
      title: { en: "Medical Personal Care", ar: "العناية الشخصية الطبية" },
      url: "/medical-personal-care",
      image: "/images/medical-personal-care.jpg",
      subcategory: {
        title: { en: "Perfumes", ar: "عطور" },
        url: "/medical-personal-care/perfumes",
      },
    },
    title: {
      en: "Clinique SteriScent Antimicrobial Perfume for Healthcare Professionals",
      ar: "عطر كلينيك ستيري سنت المضاد للميكروبات للمهنيين الطبيين",
    },
    price: 3499,
    del_price: 4499,
    status: { en: "Limited edition", ar: "إصدار محدود" },
    rating: 4.6,
    sale: "22% OFF",
    sizes: ["50ml", "100ml"], // Sizes might be universal numbers
    images: [
      "https://f.nooncdn.com/p/v1633322266/N12890384A_1.jpg?width=800",
      "https://f.nooncdn.com/p/v1633322266/N12890384A_2.jpg?width=800",
      "https://f.nooncdn.com/p/v1633322266/N12890384A_3.jpg?width=800",
      "https://f.nooncdn.com/p/v1633322266/N12890384A_5.jpg?width=800",
      "https://f.nooncdn.com/p/v1633322266/N12890384A_6.jpg?width=800",
    ],
    isBestSaller: false,
    nudges: {
      en: [
        "📌 Alcohol-free formula",
        "🔥 24-hour protection",
        "⚡ Won't interfere with sanitizers",
        "🚚 Ships today",
      ],
      ar: [
        "📌 تركيبة خالية من الكحول",
        "🔥 حماية لمدة 24 ساعة",
        "⚡ لا يتعارض مع المعقمات",
        "🚚 يشحن اليوم",
      ],
    },
    reviewCount: 187,
    description: {
      en: "Antimicrobial fragrance designed specifically for healthcare environments that won't interfere with sanitizers or patient care",
      ar: "عطر مضاد للميكروبات مصمم خصيصًا لبيئات الرعاية الصحية لا يتعارض مع المعقمات أو رعاية المرضى",
    },
    features: {
      en: [
        "Long-lasting subtle fragrance",
        "Antimicrobial properties",
        "Alcohol-free formula",
        "pH balanced for skin",
        "Compatible with frequent hand washing",
      ],
      ar: [
        "عطر رقيق يدوم طويلاً",
        "خصائص مضادة للميكروبات",
        "تركيبة خالية من الكحول",
        "متوازن الحموضة للبشرة",
        "متوافق مع غسل اليدين المتكرر",
      ],
    },
    deliveryTime: { en: "5-7 days", ar: "٥-٧ أيام" },
    installmentOptions: [
      {
        months: 3,
        amount: 1166,
        methodType: {
          id: "1",
          name: "visa",
          price: 0,
          image: "/icons/card-visa.svg",
        },
      },
    ],
    bankOffers: [
      {
        title: {
          en: "Free travel size with purchase",
          ar: "حجم سفر مجاني مع الشراء",
        },
        url: "#",
      },
      { title: { en: "Subscribe & save 15%", ar: "اشترك ووفر 15%" }, url: "#" },
    ],
    sellers: {
      id: "seller10",
      name: "Clinique Professional",
      rating: 4.7,
      positiveRatings: "93%",
      partnerSince: "2018",
      returnPolicy: {
        en: "30 days return policy",
        ar: "سياسة إرجاع خلال 30 يومًا",
      },
      itemShown: 90,
      status: { en: "active", ar: "نشط" },
      isActive: false,
    },

    overview_desc: {
      en: "A first-of-its-kind antimicrobial fragrance designed specifically for healthcare professionals. Provides long-lasting subtle scent without interfering with clinical protocols.",
      ar: "عطر مضاد للميكروبات هو الأول من نوعه مصمم خصيصًا للمهنيين الطبيين. يوفر رائحة رقيقة تدوم طويلاً دون التعارض مع البروتوكولات السريرية.",
    },
    highlights: {
      en: [
        "Clinically tested antimicrobial properties",
        "Won't degrade effectiveness of hand sanitizers",
        "Specially formulated for healthcare environments",
      ],
      ar: [
        "خصائص مضادة للميكروبات مثبتة سريريًا",
        "لا يقلل من فعالية معقمات اليدين",
        "تركيبة خاصة لبيئات الرعاية الصحية",
      ],
    },
    specifications: [
      {
        label: { en: "Volume", ar: "الحجم" },
        content: { en: "50ml, 100ml", ar: "50 مل، 100 مل" },
      },
      {
        label: { en: "Fragrance Type", ar: "نوع العطر" },
        content: { en: "Fresh, clean scent", ar: "رائحة منعشة ونظيفة" },
      },
      {
        label: { en: "Active Ingredients", ar: "المكونات النشطة" },
        content: {
          en: "Antimicrobial essential oils",
          ar: "زيوت عطرية مضادة للميكروبات",
        },
      },
      {
        label: { en: "Alcohol Content", ar: "محتوى الكحول" },
        content: { en: "0% (alcohol-free)", ar: "0% (خالي من الكحول)" },
      },
      {
        label: { en: "Skin Type", ar: "نوع البشرة" },
        content: { en: "All skin types", ar: "جميع أنواع البشرة" },
      },
    ],
    shipping_fee: 0,
    shippingMethod: { en: "express", ar: "سريع" },
    weightKg: 2,
    stock: 6,
  },
  {
    id: "11",
    brand: {
      id: "11",
      name: { en: "DermaSeal", ar: "ديرما سيل" },
      url: "/DermaSeal",
      image: "/images/DermaSeal.jpg",
    },
    model: { en: "ProCare Kit", ar: "طقم بروكير" },
    category: {
      id: "4",
      title: { en: "Medical Supplies", ar: "مستلزمات طبية" },
      url: "/medical-supplies",
      image: "/images/medical-supplies.jpg",
      subcategory: {
        title: { en: "Tapes & Dressings", ar: "أشرطة وضمادات" },
        url: "/medical-supplies/tapes-dressings",
      },
    },
    title: {
      en: "DermaSeal ProCare Medical Tape & Dressing Kit (100 Pieces)",
      ar: "طقم شريط وضمادات طبية ديرما سيل بروكير (100 قطعة)",
    },
    price: 2499,
    del_price: 3299,
    status: { en: "Bestseller", ar: "الأكثر مبيعاً" },
    rating: 4.8,
    sale: "24% OFF",
    images: [
      "https://www.cokingmed.com/upload/1c/202109/porous-zinc-oxide-adhesive-tape.jpg",
      "https://www.cokingmed.com/upload/1c/202109/porous-zinc-oxide-adhesive-tape-2.jpg",
      "https://www.cokingmed.com/upload/1c/202109/porous-zinc-oxide-adhesive-tape-3.jpg",
    ],
    isBestSaller: true,
    nudges: {
      en: [
        "📌 Hypoallergenic adhesive",
        "🔥 100-piece comprehensive kit",
        "⚡ Breathable fabric tape",
        "🚚 Free shipping",
      ],
      ar: [
        "📌 لاصق مضاد للحساسية",
        "🔥 طقم شامل 100 قطعة",
        "⚡ شريط قماش قابل للتنفس",
        "🚚 شحن مجاني",
      ],
    },
    reviewCount: 300, // Dummy value
    description: {
      en: "Comprehensive medical tape and dressing kit for wound care",
      ar: "طقم شريط وضمادات طبية شامل للعناية بالجروح",
    },
    features: {
      en: [
        "Assorted sizes of adhesive bandages",
        "Breathable fabric tape rolls",
        "Sterile gauze pads",
        "Antiseptic wipes included",
        "Compact and portable case",
      ],
      ar: [
        "ضمادات لاصقة بأحجام متنوعة",
        "لفافات شريط قماش قابلة للتنفس",
        "ضمادات شاش معقمة",
        "مناديل مطهرة متضمنة",
        "حافظة مدمجة ومحمولة",
      ],
    },
    deliveryTime: { en: "3-5 days", ar: "٣-٥ أيام" },
    installmentOptions: [
      {
        months: 3,
        amount: 833,
        methodType: {
          id: "1",
          name: "visa",
          price: 0,
          image: "/icons/card-visa.svg",
        },
      },
    ],
    bankOffers: [
      {
        title: {
          en: "Buy one, get one 50% off",
          ar: "اشترِ واحدًا، واحصل على الثاني بخصم 50%",
        },
        url: "#",
      },
      {
        title: {
          en: "Free shipping on orders over ₹2000",
          ar: "شحن مجاني للطلبات فوق ٢٠٠٠ جنيه",
        },
        url: "#",
      },
    ],
    sellers: {
      id: "seller11",
      name: "DermaSeal Solutions",
      rating: 4.9,
      positiveRatings: "96%",
      partnerSince: "2018",
      returnPolicy: {
        en: "30 days return policy",
        ar: "سياسة إرجاع خلال 30 يومًا",
      },
      itemShown: 90,
      status: { en: "active", ar: "نشط" },
      isActive: true,
    },
    overview_desc: {
      en: "An essential medical tape and dressing kit for home and professional use. Contains a variety of bandages, tapes, and gauze for effective wound care.",
      ar: "طقم شريط وضمادات طبية أساسي للاستخدام المنزلي والمهني. يحتوي على مجموعة متنوعة من الضمادات والأشرطة والشاش للعناية الفعالة بالجروح.",
    },
    highlights: {
      en: [
        "Variety of sizes for different wounds",
        "Hypoallergenic adhesive minimizes irritation",
        "Sterile components for safe application",
      ],
      ar: [
        "تنوع في الأحجام للجروح المختلفة",
        "لاصق مضاد للحساسية يقلل التهيج",
        "مكونات معقمة لتطبيق آمن",
      ],
    },
    specifications: [
      {
        label: { en: "Contents", ar: "المحتويات" },
        content: {
          en: "Adhesive bandages, tape rolls, gauze pads, antiseptic wipes",
          ar: "ضمادات لاصقة، لفافات شريط، ضمادات شاش، مناديل مطهرة",
        },
      },
      {
        label: { en: "Material", ar: "الخامة" },
        content: { en: "Latex-free materials", ar: "مواد خالية من اللاتكس" },
      },
      {
        label: { en: "Quantity", ar: "الكمية" },
        content: { en: "100 pieces", ar: "100 قطعة" },
      },
      {
        label: { en: "Sterility", ar: "التعقيم" },
        content: { en: "Sterile gauze pads", ar: "ضمادات شاش معقمة" },
      },
      {
        label: { en: "Application", ar: "التطبيق" },
        content: {
          en: "Wound care, first aid",
          ar: "العناية بالجروح، الإسعافات الأولية",
        },
      },
    ],
    shipping_fee: 0,
    shippingMethod: { en: "standard", ar: "قياسي" },
    weightKg: 0.5,
  },
];
