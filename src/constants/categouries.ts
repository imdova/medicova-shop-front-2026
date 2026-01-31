import { CategoryType, MultiCategory } from "@/types";

const medicalCategories: CategoryType[] = [
  {
    id: "1",
    title: { en: "Medical Wear & Uniforms", ar: "الملابس والزي الطبي" },
    slug: "medical-wear",
    image:
      "https://img.freepik.com/free-photo/group-doctors-standing-together_23-2148975431.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
    isSale: true,
  },
  {
    id: "2",
    title: { en: "Surgical Scrubs", ar: "الدعك الجراحي" },
    slug: "surgical-scrubs",
    image:
      "https://img.freepik.com/free-photo/doctor-wearing-blue-scrubs_23-2148975438.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "3",
    title: { en: "Lab Coats", ar: "معاطف المختبر" },
    slug: "lab-coats",
    image:
      "https://img.freepik.com/free-photo/doctor-holding-stethoscope_23-2148975432.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
    isSale: true,
  },
  {
    id: "4",
    title: { en: "Medical Footwear", ar: "الأحذية الطبية" },
    slug: "medical-footwear",
    image:
      "https://img.freepik.com/free-photo/comfortable-shoes-medical-professionals_23-2148975440.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "5",
    title: { en: "Nursing Wear", ar: "ملابس التمريض" },
    slug: "nursing-wear",
    image:
      "https://img.freepik.com/free-photo/nurse-uniform-concept_23-2148975437.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "6",
    title: { en: "Medical Accessories", ar: "الاكسسوارات الطبية" },
    slug: "medical-accessories",
    image:
      "https://img.freepik.com/free-photo/stethoscope-medical-instruments_23-2148975439.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
];

const equipmentCategories: CategoryType[] = [
  {
    id: "7",
    title: { en: "Diagnostic Equipment", ar: "معدات التشخيص" },
    slug: "diagnostic-equipment",
    image:
      "https://img.freepik.com/free-photo/doctor-preparing-ophthalmologist-s-office_23-2150917654.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "8",
    title: { en: "Surgical Instruments", ar: "الأدوات الجراحية" },
    slug: "surgical-instruments",
    image:
      "https://img.freepik.com/free-photo/top-view-various-medical-equipment_23-2149283902.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
    isSale: true,
  },
  {
    id: "9",
    title: { en: "Dental Equipment", ar: "معدات الأسنان" },
    slug: "dental-equipment",
    image:
      "https://img.freepik.com/free-photo/top-view-career-guidance-items-dentists_23-2149443482.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "10",
    title: { en: "Hospital Furniture", ar: "أثاث المستشفيات" },
    slug: "hospital-furniture",
    image:
      "https://img.freepik.com/premium-photo/hospital-room-with-bed-wood-decoration3d-rendering_258219-799.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "11",
    title: { en: "Patient Care Equipment", ar: "معدات رعاية المرضى" },
    slug: "patient-care-equipment",
    image:
      "https://img.freepik.com/free-photo/hospital-equipment-surgical-procedure_23-2148962526.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
    isSale: true,
  },
  {
    id: "12",
    title: { en: "Medical Carts & Stands", ar: "عربات وحوامل طبية" },
    slug: "medical-carts",
    image:
      "https://img.freepik.com/free-photo/high-angle-shopping-cart-with-pill-foils-copy-space_23-2148533500.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
];

const consumableCategories: CategoryType[] = [
  {
    id: "13",
    title: { en: "Disposable Gloves", ar: "قفازات يمكن التخلص منها" },
    slug: "disposable-gloves",
    image:
      "https://img.freepik.com/free-photo/closeup-shot-person-s-hands-wearing-blue-gloves_181624-19908.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "14",
    title: { en: "Face Masks & Shields", ar: "كمامات وواقيات الوجه" },
    slug: "face-protection",
    image:
      "https://img.freepik.com/free-photo/close-up-man-with-mask_23-2148645131.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "15",
    title: { en: "Wound Care Supplies", ar: "مستلزمات العناية بالجروح" },
    slug: "wound-care",
    image:
      "https://img.freepik.com/free-photo/collection-medical-equipments-capsules-white-background_23-2147874827.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "16",
    title: { en: "Infection Control", ar: "مكافحة العدوى" },
    slug: "infection-control",
    image:
      "https://img.freepik.com/premium-photo/male-doctor-scientist-lab-coat-defensive-eyewear-mask-holds-glass-with-covid-19-word-it_146671-10515.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "17",
    title: { en: "Medical Tapes & Dressings", ar: "أشرطة وضمادات طبية" },
    slug: "medical-dressings",
    image:
      "https://img.freepik.com/free-photo/still-life-supplies_23-2149371306.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "18",
    title: { en: "Syringes & Needles", ar: "محاقن وإبر" },
    slug: "syringes-needles",
    image:
      "https://img.freepik.com/free-photo/arrangement-covid19-vaccine-bottle_23-2148961582.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
];

const lifestyleCategories: CategoryType[] = [
  {
    id: "19",
    title: { en: "Sports Wear", ar: "ملابس رياضية" },
    slug: "sports-wear",
    image:
      "https://img.freepik.com/premium-photo/sport-clothes-shoes-headphones-white-carpet-background_392895-409533.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "20",
    title: { en: "Fitness Accessories", ar: "اكسسوارات اللياقة البدنية" },
    slug: "fitness-accessories",
    image:
      "https://img.freepik.com/free-photo/still-life-sport-arrangement_23-2149006364.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "21",
    title: { en: "Luxury Watches", ar: "ساعات فاخرة" },
    slug: "luxury-watches",
    image:
      "https://img.freepik.com/free-photo/beautiful-rendering-steel-object_23-2151897644.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "22",
    title: { en: "Designer Perfumes", ar: "عطور مصممة" },
    slug: "designer-perfumes",
    image:
      "https://img.freepik.com/free-photo/set-plant-twigs-paper-near-textile-bottle_23-2148042173.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "23",
    title: { en: "Professional Bags", ar: "حقائب احترافية" },
    slug: "professional-bags",
    image:
      "https://img.freepik.com/free-photo/woman-standing-clean-urban-space_23-2149015672.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
  {
    id: "24",
    title: { en: "Eyewear", ar: "نظارات" },
    slug: "eyewear",
    image:
      "https://img.freepik.com/free-photo/people-style-fashion-concept-happy-young-woman-teen-girl-casual-clothes-sunglasses_231208-5788.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
  },
];

const megaMenuCategories: MultiCategory[] = [
  {
    id: "1",
    title: { en: "Medical Wear", ar: "الملابس الطبية" },
    slug: "medical-wear",
    image:
      "https://img.freepik.com/free-photo/group-doctors-standing-together_23-2148975431.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
    subCategories: [
      {
        id: "1-1",
        title: { en: "Scrubs", ar: "الزي الطبي (سكرابز)" },
        slug: "scrubs",
        image:
          "https://img.freepik.com/free-photo/doctor-wearing-blue-scrubs_23-2148975438.jpg?w=1380",
        cover:
          "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
        banner: {
          image:
            "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
          url: "#",
        },
        subCategories: [
          {
            id: "1-1-1",
            title: { en: "Unisex Scrubs", ar: "سكرابز للجنسين" },
            slug: "scrubs-unisex",
            image:
              "https://img.freepik.com/free-photo/doctor-wearing-blue-scrubs_23-2148975438.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "1-1-2",
            title: { en: "Women's Scrubs", ar: "سكرابز نسائي" },
            slug: "scrubs-womens",
            image:
              "https://img.freepik.com/free-photo/female-doctor-wearing-scrubs_23-2148975436.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "1-1-3",
            title: { en: "Men's Scrubs", ar: "سكرابز رجالي" },
            slug: "scrubs-mens",
            image:
              "https://img.freepik.com/free-photo/male-doctor-wearing-scrubs_23-2148975435.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
        ],
      },
      {
        id: "1-2",
        title: { en: "Lab Coats", ar: "معاطف المختبر" },
        slug: "lab-coats",
        image:
          "https://img.freepik.com/free-photo/doctor-holding-stethoscope_23-2148975432.jpg?w=1380",
        cover:
          "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
        banner: {
          image:
            "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
          url: "#",
        },
        subCategories: [
          {
            id: "1-2-1",
            title: { en: "Short Lab Coats", ar: "معاطف مختبر قصيرة" },
            slug: "lab-coats-short",
            image:
              "https://img.freepik.com/free-photo/doctor-holding-stethoscope_23-2148975432.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "1-2-2",
            title: { en: "Long Lab Coats", ar: "معاطف مختبر طويلة" },
            slug: "lab-coats-long",
            image:
              "https://img.freepik.com/free-photo/doctor-wearing-white-coat_23-2148975433.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "1-2-3",
            title: { en: "Designer Lab Coats", ar: "معاطف مختبر مصممة" },
            slug: "lab-coats-designer",
            image:
              "https://img.freepik.com/free-photo/fashionable-doctor_23-2148975434.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
        ],
      },
      {
        id: "1-3",
        title: { en: "Medical Shoes", ar: "أحذية طبية" },
        slug: "shoes",
        image:
          "https://img.freepik.com/free-photo/comfortable-shoes-medical-professionals_23-2148975440.jpg?w=1380",
        cover:
          "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
        banner: {
          image:
            "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
          url: "#",
        },
        subCategories: [
          {
            id: "1-3-1",
            title: { en: "Clogs", ar: "قباقيب" },
            slug: "shoes-clogs",
            image:
              "https://img.freepik.com/free-photo/comfortable-shoes-medical-professionals_23-2148975440.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "1-3-2",
            title: { en: "Sneakers", ar: "أحذية رياضية" },
            slug: "shoes-sneakers",
            image:
              "https://img.freepik.com/free-photo/sport-shoes-white-background_23-2148975441.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "1-3-3",
            title: { en: "Slip-resistant", ar: "مقاومة للانزلاق" },
            slug: "shoes-slip-resistant",
            image:
              "https://img.freepik.com/free-photo/shoes-with-non-slip-sole_23-2148975442.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
        ],
      },
      {
        id: "1-4",
        title: { en: "Surgical Caps", ar: "قبعات جراحية" },
        slug: "surgical-caps",
        image:
          "https://img.freepik.com/free-photo/surgical-cap-isolated-white-background_23-2148975443.jpg?w=1380",
        cover:
          "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
        banner: {
          image:
            "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
          url: "#",
        },
        subCategories: [
          {
            id: "1-4-1",
            title: { en: "Disposable Caps", ar: "قبعات يمكن التخلص منها" },
            slug: "disposable",
            image:
              "https://img.freepik.com/free-photo/surgical-cap-isolated-white-background_23-2148975443.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "1-4-2",
            title: { en: "Reusable Caps", ar: "قبعات قابلة لإعادة الاستخدام" },
            slug: "surgical-caps-reusable",
            image:
              "https://img.freepik.com/free-photo/reusable-surgical-cap_23-2148975444.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "1-4-3",
            title: { en: "Designer Caps", ar: "قبعات مصممة" },
            slug: "surgical-caps-designer",
            image:
              "https://img.freepik.com/free-photo/colorful-surgical-caps_23-2148975445.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: { en: "Medical Equipment", ar: "المعدات الطبية" },
    slug: "medical-equipment",
    image:
      "https://img.freepik.com/free-photo/top-view-various-medical-equipment_23-2149283902.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },
    subCategories: [
      {
        id: "2-1",
        title: { en: "Diagnostic Equipment", ar: "معدات التشخيص" },
        slug: "diagnostic",
        image:
          "https://img.freepik.com/free-photo/doctor-preparing-ophthalmologist-s-office_23-2150917654.jpg?w=1380",
        cover:
          "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
        banner: {
          image:
            "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
          url: "#",
        },
        subCategories: [
          {
            id: "2-1-1",
            title: { en: "Stethoscopes", ar: "سماعات طبية" },
            slug: "stethoscopes",
            image:
              "https://img.freepik.com/free-photo/stethoscope-medical-instruments_23-2148975439.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "2-1-2",
            title: { en: "Blood Pressure Monitors", ar: "أجهزة قياس ضغط الدم" },
            slug: "/medical-equipment/diagnostic/blood-pressure",
            image:
              "https://img.freepik.com/free-photo/blood-pressure-monitor_23-2148975446.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "2-1-3",
            title: { en: "Thermometers", ar: "موازين الحرارة" },
            slug: "/medical-equipment/diagnostic/thermometers",
            image:
              "https://img.freepik.com/free-photo/digital-thermometer_23-2148975447.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
        ],
      },
      {
        id: "2-2",
        title: { en: "Surgical Instruments", ar: "الأدوات الجراحية" },
        slug: "surgical",
        image:
          "https://img.freepik.com/free-photo/top-view-various-medical-equipment_23-2149283902.jpg?w=1380",
        cover:
          "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
        banner: {
          image:
            "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
          url: "#",
        },
        subCategories: [
          {
            id: "2-2-1",
            title: { en: "Scalpels", ar: "المشارط" },
            slug: "/medical-equipment/surgical/scalpels",
            image:
              "https://img.freepik.com/free-photo/surgical-scalpel_23-2148975448.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "2-2-2",
            title: { en: "Forceps", ar: "الملاقط" },
            slug: "/medical-equipment/surgical/forceps",
            image:
              "https://img.freepik.com/free-photo/surgical-forceps_23-2148975449.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "2-2-3",
            title: { en: "Scissors", ar: "المقصات" },
            slug: "/medical-equipment/surgical/scissors",
            image:
              "https://img.freepik.com/free-photo/surgical-scissors_23-2148975450.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
        ],
      },
      {
        id: "2-3",
        title: { en: "Dental Equipment", ar: "معدات الأسنان" },
        slug: "equipment-dental",
        image:
          "https://img.freepik.com/free-photo/top-view-career-guidance-items-dentists_23-2149443482.jpg?w=1380",
        cover:
          "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
        banner: {
          image:
            "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
          url: "#",
        },
        subCategories: [
          {
            id: "2-3-1",
            title: { en: "Dental Chairs", ar: "كراسي الأسنان" },
            slug: "dental-chairs",
            image:
              "https://img.freepik.com/free-photo/dental-chair_23-2148975451.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "2-3-2",
            title: { en: "Dental Drills", ar: "مثاقب الأسنان" },
            slug: "dental-drills",
            image:
              "https://img.freepik.com/free-photo/dental-drill_23-2148975452.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "2-3-3",
            title: { en: "X-ray Machines", ar: "أجهزة الأشعة السينية" },
            slug: "dental-xray",
            image:
              "https://img.freepik.com/free-photo/dental-xray-machine_23-2148975453.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
        ],
      },
      {
        id: "2-4",
        title: { en: "Patient Monitoring", ar: "مراقبة المرضى" },
        slug: "monitoring",
        image:
          "https://img.freepik.com/free-photo/hospital-equipment-surgical-procedure_23-2148962526.jpg?w=1380",
        cover:
          "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
        banner: {
          image:
            "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
          url: "#",
        },

        subCategories: [
          {
            id: "2-4-1",
            title: { en: "ECG Machines", ar: "أجهزة تخطيط القلب" },
            slug: "/medical-equipment/monitoring/ecg",
            image:
              "https://img.freepik.com/free-photo/ecg-machine_23-2148975454.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "2-4-2",
            title: { en: "Pulse Oximeters", ar: "مقاييس التأكسج النبضي" },
            slug: "/medical-equipment/monitoring/oximeters",
            image:
              "https://img.freepik.com/free-photo/pulse-oximeter_23-2148975455.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "2-4-3",
            title: { en: "Ventilators", ar: "أجهزة التنفس الصناعي" },
            slug: "/medical-equipment/monitoring/ventilators",
            image:
              "https://img.freepik.com/free-photo/medical-ventilator_23-2148975456.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
        ],
      },
    ],
  },
  {
    id: "3",
    title: { en: "Medical Consumables", ar: "المستهلكات الطبية" },
    slug: "medical-consumables",
    image:
      "https://img.freepik.com/free-photo/collection-medical-equipments-capsules-white-background_23-2147874827.jpg?w=1380",
    cover:
      "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
    banner: {
      image:
        "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
      url: "#",
    },

    subCategories: [
      {
        id: "3-1",
        title: { en: "Disposable Products", ar: "منتجات يمكن التخلص منها" },
        slug: "disposable",
        image:
          "https://img.freepik.com/free-photo/closeup-shot-person-s-hands-wearing-blue-gloves_181624-19908.jpg?w=1380",
        cover:
          "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
        banner: {
          image:
            "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
          url: "#",
        },

        subCategories: [
          {
            id: "3-1-1",
            title: { en: "Gloves", ar: "قفازات" },
            slug: "/medical-consumables/disposable/gloves",
            image:
              "https://img.freepik.com/free-photo/closeup-shot-person-s-hands-wearing-blue-gloves_181624-19908.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "3-1-2",
            title: { en: "Masks", ar: "كمامات" },
            slug: "/medical-consumables/disposable/masks",
            image:
              "https://img.freepik.com/free-photo/close-up-man-with-mask_23-2148645131.jpg?w=1380",
            cover:
              "https://f.nooncdn.com/mpcms/EN0003/assets/59200512-d12c-4e77-a765-30c623bcf11a.gif",
            banner: {
              image:
                "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
              url: "#",
            },
          },
          {
            id: "3-1-3",
            title: { en: "Syringes", ar: "محاقن" },
            slug: "/medical-consumables/disposable/syrin",
            image:
              "https://f.nooncdn.com/mpcms/EN0003/assets/10acc974-456a-4f1c-b0b3-35b894a42b50.png",
          },
        ],
      },
    ],
  },
];
const allCategories: CategoryType[] = [
  ...medicalCategories,
  ...equipmentCategories,
  ...consumableCategories,
  ...lifestyleCategories,
  ...megaMenuCategories,
];

export {
  medicalCategories,
  equipmentCategories,
  consumableCategories,
  lifestyleCategories,
  allCategories,
  megaMenuCategories,
};
