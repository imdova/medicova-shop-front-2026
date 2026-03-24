import { Brand, LiquidSizeType, NumericSizeType, SizeType } from ".";
import { Customer } from "./customers";
import { LocalizedTitle } from "./language";

export type Seller = {
  id: string;
  name: string;
  rating: number;
  image?: string;
  isActive: boolean;
  positiveRatings?: string;
  partnerSince?: string;
  products?: number;
  customers?: number;
  sales?: number;
  country?: string;
  city?: string;
  returnPolicy: LocalizedTitle;
  itemShown: number;
  status: LocalizedTitle;
};

// Types
export type Status = "published" | "draft";
export type FieldType = "text" | "number" | "boolean" | "select" | "textarea";

export type methodType = {
  id: string;
  name: string;
  price: number;
  image: string;
};
// Type definition
export type Review = {
  id: string;
  rating: number;
  content: string;
  author: {
    id: string;
    name: string;
    imgUrl: string;
  };
  date: string;
};

export type shippingMethod = {
  en: "standard" | "express" | "free";
  ar: "قياسي" | "سريع" | "مجاني";
};

export type ColorNameEn =
  | "Black"
  | "White"
  | "Red"
  | "Blue"
  | "Green"
  | "Yellow"
  | "Orange"
  | "Purple"
  | "Grey"
  | "Brown"
  | "Beige"
  | "Pink"
  | "Navy"
  | "Maroon"
  | "Olive"
  | "Teal";

export type ColorNameAr =
  | "أسود"
  | "أبيض"
  | "أحمر"
  | "أزرق"
  | "أخضر"
  | "أصفر"
  | "برتقالي"
  | "بنفسجي"
  | "رمادي"
  | "بني"
  | "بيج"
  | "وردي"
  | "كحلي"
  | "خمري"
  | "زيتي"
  | "أخضر مزرق";

export type MultilingualColor = {
  en: ColorNameEn[];
  ar: ColorNameAr[];
};

export interface SelectedColorState {
  en?: ColorNameEn;
  ar?: ColorNameAr;
}
interface CategoryType {
  id: string;
  slug?: string;
  url?: string;
  title: LocalizedTitle;
  image: string;
  isSale?: boolean;
  subcategory?: { title: LocalizedTitle; url?: string };
}

// export interface Product {
//   id: string;
//   brand?: Brand;
//   model?: string;
//   category?: CategoryType;
//   title: string;
//   price: number;
//   del_price?: number;
//   status?: string;
//   images?: string[];
//   rating?: number;
//   sale?: string;
//   isBestSaller?: boolean;
//   nudges?: string[];
//   name?: string;
//   reviewCount?: number;
//   description?: string;
//   features?: string[];
//   deliveryTime?: string;
//   shippingMethod: shippingMethod;
//   weightKg: number;
//   installmentOptions?: {
//     methodType: methodType;
//     months: number;
//     amount: number;
//   }[];
//   bankOffers?: {
//     title: string;
//     url: string;
//   }[];
//   sellers?: Seller;
//   sizes?: SizeType[] | NumericSizeType[] | LiquidSizeType[];
//   colors?: ColorType[];
//   highlights?: string[];
//   overview_desc?: string;
//   specifications?: { label: string; content: string }[];
//   stock?: number;
//   shipping_fee: number;
//   sku?: string;
// }
export interface Product {
  id: string;
  sku?: string; // Optional if not all products have it
  brand: Brand;
  model: LocalizedTitle;
  category: CategoryType;
  title: LocalizedTitle;
  slug: LocalizedTitle;
  price: number;
  del_price?: number; // Optional
  stock?: number; // Optional
  status?: LocalizedTitle;
  rating: number;
  sale?: string; // This could also be LocalizedTitle if the "OFF" needs translation
  sizes?: SizeType[] | NumericSizeType[] | LiquidSizeType[]; // Sizes might be universal or you might need LangArray if sizes names change (e.g., Small vs. صغير)
  colors?: MultilingualColor;
  images: string[];
  isBestSaller: boolean;
  nudges?: {
    en: string[];
    ar: string[];
  };
  reviewCount: number;
  description: LocalizedTitle;
  features: {
    en: string[];
    ar: string[];
  };
  deliveryTime?: LocalizedTitle;
  installmentOptions?: {
    months: number;
    amount: number;
    methodType: {
      id: string;
      name: string;
      price: number;
      image: string;
    };
  }[];
  bankOffers?: {
    title: LocalizedTitle;
    url: string;
  }[];
  sellers: Seller;
  overview_desc: LocalizedTitle;
  highlights: {
    en: string[];
    ar: string[];
  };
  specifications: {
    label: LocalizedTitle;
    content: LocalizedTitle;
  }[];
  weightKg: number;
  shipping_fee: number;
  shippingMethod: shippingMethod;
  createdBy?: "admin" | "seller" | string;
  sellerId?: string | null;
  seller?: {
    _id?: string;
    brandName?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  } | string;
  selectedOptions?: {
    label: LocalizedTitle;
    values: string[];
  }[];
  tags?: string[];
  shippingCostInsideCairo?: number;
  shippingCostRegion1?: number;
  shippingCostRegion2?: number;
}

export type ProductTag = {
  id: string;
  name: LocalizedTitle;
  categoryId?: string;
  createdAt: string;
  status: LocalizedTitle;
  slug: string;
  slugAr?: string;
  description: LocalizedTitle;
  meta_title: LocalizedTitle;
  meta_description: LocalizedTitle;
  noindex: "true" | "false";
  image?: File;
};

// Sub-type for each attribute option (e.g. Red, Small, Cotton)
export type AttributeOption = {
  id: string;
  title: LocalizedTitle;
  color: string | null;
  image: string | null;
  is_default: boolean;
};

export type ProductAttribute = {
  id: string;
  name: LocalizedTitle;
  slug: string;
  sortOrder: number;
  createdAt: string;
  status: { en: "published" | "draft"; ar: string };

  // Extra fields from dummyAttributesData
  use_image_from_variation?: boolean;
  display_layout?: "visual_swatch" | "dropdown" | "text_swatch";
  searchable?: boolean;
  comparable?: boolean;
  use_in_product_listing?: boolean;
  categories?: string[];
  attributes?: AttributeOption[];
};

// Define ProductOption type
export type OptionValue = {
  id: string;
  label: LocalizedTitle;
  price: string;
  price_type: "fixed" | "percent";
  color?: string;
};

export type ProductOption = {
  id: string;
  slug: string;
  name: LocalizedTitle;
  option_type: "dropdown" | "radio" | "checkbox" | "text" | "color";
  isRequired: boolean;
  createdAt: string;
  option_values: OptionValue[];
  createdBy?: "admin" | "seller" | string;
  storeId?: string | null;
};

// Type definition for Product Inventory
export type ProductVariant = {
  id: number;
  image: string;
  name: string;
  sku: string;
  storefrontManagement: "out_stock" | "in_stock";
  quantity: number;
  hasVariants: false;
  isVariant: true;
  parentId: number;
};

export type ProductInventory = {
  id: number;
  image: string;
  name: string;
  sku: string;
  storefrontManagement: "out_stock" | "in_stock";
  quantity: number;
  hasVariants: boolean;
  isVariant: boolean;
  parentId: number | null;
  variants?: ProductVariant[];
};

// Flash Sale type definition
export type ProductWithQuantity = Product & {
  quantity: number;
};

export interface FlashSale {
  id: string;
  slug?: string;
  name: { en: string; ar: string };
  status: "published" | "draft" | "expired";
  endDate: string;
  createdAt: string;
  products?: ProductWithQuantity[];
}

export type SpecificationGroup = {
  id: string;
  slug: string;
  name: LocalizedTitle;
  description: LocalizedTitle;
  status: {
    en: "published" | "draft";
    ar: "منشور" | "مسودة";
  };
  createdAt: string;
};

export interface SpecificationAttribute {
  id: string;
  name: LocalizedTitle;
  associatedGroup: SpecificationGroup;
  fieldType: FieldType;
  createdAt: string;
  status: {
    en: Status;
    ar: string;
  };
  defaultValue?: string;
}

export interface SpecificationTable {
  id: string;
  name: LocalizedTitle;
  description: LocalizedTitle;
  assignedGroups: SpecificationGroup[];
  createdAt: string;
  status: {
    en: Status;
    ar: string;
  };
  groupOrder?: string[];
}

export interface History {
  action: string;
  timestamp: string;
  by: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  customer: Customer;
  products?: Product[];
  shippingCompany?: LocalizedTitle;
  trackingId?: string;
  trackingLink?: string;
  estimateDateShipped?: string;
  note?: LocalizedTitle;
  shippingStatus?: {
    en:
      | "approved"
      | "pending"
      | "processing"
      | "shipped"
      | "delivered"
      | "cancelled"
      | "returned";
    ar: string;
  };
  shippingMethod?: string;
  shippingFee?: number;
  history?: History[];
  shippingAmount: number;
  status: {
    en:
      | "Approved"
      | "Delivered"
      | "Shipped"
      | "Processing"
      | "Pending"
      | "Cancelled"
      | "Returned";
    ar: string;
  };
  codStatus: {
    en: "Not available" | "Available" | "Pending" | "Paid" | "Refunded";
    ar: string;
  };
  createdAt: string;
}

export interface ReviewType {
  id: string;
  product: {
    id: string;
    title: LocalizedTitle;
    images: string[];
    price?: number;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  images: string[];
  status: { en: string; ar: string };
  approved: boolean;
  createdAt: string;
  reviewType?: "manual" | "system";
  replies?: {
    id: string;
    admin_name: string;
    comment: string;
    created_at: string;
  }[];
}

export interface ProductCollection {
  id: string;
  image: string;
  name: {
    en: string;
    ar: string;
  };
  slug: string;
  createdAt: string;
  status: "published" | "draft";
  sellerId?: string | null;
  descriptiveData?: string | null;
  description: {
    en: string;
    ar: string;
  };
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  isFeatures?: boolean;
  is_featured: boolean;
  short_description: {
    en: string;
    ar: string;
  };
  products: Product[];
  link?: string;
  orders?: number;
  revenue?: number;
}

export type DiscountType = "fixed" | "percentage" | "shipping";
export type DiscountStatus = "active" | "expired" | "scheduled";
export type DiscountMethod = "automatic_discount" | "discount_code";
export type DiscountEligibility = "all_customers" | "specific_customer_segments" | "specific_customers";
export type DiscountAppliesTo = "all_products" | "specific_products" | "specific_categories" | "specific_subcategories" | "minimum_amount" | string;

export interface Discount {
  id: string; // Maps to _id in API
  _id?: string;
  sellerId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    brandName?: string;
    email?: string;
  } | string;
  discountName: string;
  method: DiscountMethod;
  discountCode: string;
  discountType: DiscountType;
  discountValue: number;
  appliesTo: DiscountAppliesTo;
  productIds: string[];
  categoryIds: string[];
  subcategoryIds: string[];
  availableOnAllSalesChannels: boolean;
  eligibility: DiscountEligibility;
  customerSegmentIds: string[];
  customerIds: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;

  // Legacy/UI Compatibility fields (Keep for transition)
  couponCode: string; // Required by existing UI
  type: "coupon" | "promotion"; // Required by existing UI
  value: number; // Required by existing UI
  description?: string;
  status?: DiscountStatus;
  store?: string;
  applyFor?: DiscountAppliesTo;
  canUseWithPromotion?: boolean;
  canUseWithFlashSale?: boolean;
  isUnlimited?: boolean;
  applyViaUrl?: boolean;
  displayAtCheckout?: boolean;
  neverExpired?: boolean;
  minimumAmount?: number;
  selectedProducts?: string[];
  selectedCategories?: string[];
  usageLimit?: number;
  usedCount?: number;
}
