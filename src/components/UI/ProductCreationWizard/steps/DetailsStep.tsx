// components/product/DetailsStep.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import {
  ImageIcon,
  X,
  Check,
  Percent,
  DollarSign,
  Calendar,
  GripVertical,
  Plus,
  Info,
  Image as ImageIconType,
  Search,
  Star,
  Clock,
  Package,
  Tag,
  Ruler,
  Palette,
  Hash,
  Globe,
  FileVideo,
  Link,
  Upload,
  Filter,
  ShoppingCart,
  Sparkles,
  MapPin,
  Truck,
  Box,
  Layers,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Download,
  Upload as UploadIcon,
  Globe as GlobeIcon,
  Minus,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ProductFormData,
  Specification,
} from "@/lib/validations/product-schema";
import Image from "next/image";
import { products } from "@/constants/products";
import { Product } from "@/types/product";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// shadcn/ui imports
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Separator } from "@/components/UI/separator";
import { Label } from "@/components/UI/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/UI/alert";
import { Textarea } from "@/components/UI/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/UI/dialog";

import { ScrollArea } from "@/components/UI/scroll-area";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { Switch } from "@/components/UI/switch";
import { Checkbox } from "@/components/UI/Check-Box";

interface DetailsStepProps {
  product: ProductFormData;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  onValidate: () => void;
  onBack: () => void;
}

// Predefined options
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
const colorOptions = [
  { name: "Red", color: "#ef4444" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Green", color: "#10b981" },
  { name: "Black", color: "#000000" },
  { name: "White", color: "#ffffff", border: "#e5e7eb" },
  { name: "Yellow", color: "#f59e0b" },
  { name: "Purple", color: "#8b5cf6" },
  { name: "Pink", color: "#ec4899" },
  { name: "Orange", color: "#f97316" },
  { name: "Gray", color: "#6b7280" },
] as const;

const translations = {
  en: {
    // Basic Information
    productDetails: "Product Details",
    productDescription: "Product Description",
    productDescriptionEn: "English Description",
    productDescriptionAr: "Arabic Description",
    enterDescriptionEn: "Enter product description in English...",
    enterDescriptionAr: "Enter product description in Arabic...",
    addArabicDescription: "+ Add Arabic Description",
    addEnglishDescription: "+ Add English Description",
    hideArabicDescription: "Hide Arabic Description",
    hideEnglishDescription: "Hide English Description",

    // Key Features
    keyFeatures: "Key Features",
    keyFeaturesTitleEn: "Title in English",
    keyFeaturesTitleAr: "Title in Arabic",
    keyFeaturesDescEn: "Description in English",
    keyFeaturesDescAr: "Description in Arabic",
    addFeature: "Add Feature",
    removeFeature: "Remove Feature",

    // Delivery
    deliveryInfo: "Delivery Information",
    deliveryTime: "Delivery Time",
    deliveryPlaceholder: "e.g. 3-5 business days",

    // Pricing
    pricing: "Pricing & Discount",
    price: "Original Price",
    salePrice: "Sale Price",
    discountFromOriginal: "Discount {percent}% from original price",
    chooseDiscountPeriod: "Set Discount Period",
    saleStart: "Sale Start Date",
    saleEnd: "Sale End Date",
    percentage: "Percentage",
    fixedAmount: "Fixed Amount",
    discountType: "Discount Type",
    discount: "Discount",

    // Inventory
    inventoryWeight: "Inventory & Weight",
    stockQuantity: "Stock Quantity",
    weight: "Weight (kg)",

    // Sizes & Colors
    sizes: "Sizes",
    colors: "Colors",
    selectColor: "Select Color",
    addColor: "Add Color",
    selectSize: "Select Size",
    addSize: "Add Size",
    addSelectedSizes: "Add Selected Sizes",

    // Specifications
    specifications: "Product Specifications",
    specKeyPlaceholderEn: "Key (e.g., Material)",
    specKeyPlaceholderAr: "المفتاح (مثال: المادة)",
    specValuePlaceholderEn: "Value (e.g., Cotton)",
    specValuePlaceholderAr: "القيمة (مثال: قطن)",

    // Media
    productImages: "Product Gallery",
    clickToUpload: "Drag & drop or click to upload",
    maxImages: "Up to 10 images • JPG, PNG, WebP",

    // General
    back: "Back",
    remove: "Remove",
    add: "Add",
    save: "Save",
    cancel: "Cancel",
    update: "Update",
    edit: "Edit",
    delete: "Delete",
    done: "Done",

    // Variants
    variants: "Product Variants",
    variantsManagement: "Variants Management",
    optionName: "Option name",
    optionValues: "Option values",
    addValue: "Add a value",
    optionValueRequired: "Option value is required",
    deleteOption: "Delete Option",
    saveOption: "Save Option",
    addAnotherOption: "Add Another Option",
    itemDetailsOfVariant: "Item details of variant",
    sellingPrice: "Selling price",
    enterSellingPrice: "Enter selling price",
    enterUpc: "Enter upc",
    selectImage: "Select Image",

    // Variants Table
    groupBy: "Group by",
    collapseAll: "Collapse all",
    expandAll: "Expand all",
    variantPrice: "Price",
    variantAvailable: "Available",
    variantImages: "Images",
    variantSku: "SKU",
    totalInventory: "Total inventory",
    available: "available",
    addVariantImage: "Add variant image",
    variantOriginPrice: "Origin Price",
    editPrice: "Edit Price",
    copyVariant: "Copy Variant",
    deleteVariant: "Delete Variant",

    // Shipping
    shipping: "Shipping",
    shippingSettings: "Shipping Settings",
    shippingDimensions: "Shipping Dimensions",
    weightGrams: "Weight (g)",
    lengthCm: "Length (cm)",
    wideCm: "Width (cm)",
    heightCm: "Height (cm)",

    // Shipping Packages
    addPackage: "Add package",
    managePackages: "Manage packages",
    packageName: "Package name",
    packageType: "Package type",
    box: "Box",
    envelope: "Envelope",
    softPackage: "Soft package",
    dimensions: "Dimensions",
    weightEmpty: "Weight (empty)",
    useAsDefault: "Use as default package",
    defaultPackageDescription:
      "Used to calculate rates at checkout and pre-selected when buying labels",

    // Shipping Prices
    allowShipping: "Allow shipping",
    shippingPrice: "Shipping Price",
    shippingInsideCairo: "Inside Cairo",
    shippingRegionOne: "Region 1",
    shippingRegionTwo: "Region 2",

    // Product Type
    physicalProduct: "Physical Product",
    digitalProduct: "Digital Product",
    shippingRequired: "Shipping Required",
    shippingNotRequired: "Shipping Not Required",

    // Video
    video: "Product Video",
    addNew: "Add Video",
    file: "Upload Video File",
    chooseFile: "Choose file",
    orExternalVideoUrl: "Or Enter External Video URL",
    enterVideoUrl: "Enter YouTube or Vimeo video URL",
    videoThumbnail: "Video Thumbnail",
    chooseImage: "Choose image",
    orAddFromUrl: "or Add from URL",
    enterThumbnailUrl: "Enter thumbnail image URL",

    // Featured Image
    setAsFeatured: "Set as Featured",
    featuredImage: "Featured Image",
    removeFeatured: "Remove Featured",

    // Related Products
    relatedProducts: "Related Products",
    crossSellingProducts: "Cross-selling products",
    searchProducts: "Search products...",
    priceFieldInfo: "Price field: Enter the amount you want to reduce from the original price. Example: If the original price is $100, enter 20 to reduce the price to $80.",
    typeFieldInfo: "Type field: Choose the discount type: Fixed (reduce a specific amount) or Percent (reduce by a percentage).",
    crossSellingPrice: "Price",
    crossSellingType: "Type",
    crossSellingFixed: "Fixed",
    crossSellingPercent: "Percent",

    // Navigation
    previous: "Previous",
    next: "Next",

    // Instructions
    priceFieldInstruction: "Enter the amount to reduce from original price",
    typeFieldInstruction: "Choose discount type",
    specificationsDescription: "Add detailed product specifications",
    inventoryDescription: "Manage stock levels and product weight",
    shippingDescription: "Package dimensions for shipping",
    variantsDescription: "Create product variations (size, color, etc.)",
    mediaDescription: "Upload product images and videos",
    recommendationsDescription: "Add related and cross-selling products",

    // Validation
    requiredField: "This field is required",
    optional: "Optional",

    // Actions
    uploadImage: "Upload Image",
    clearAll: "Clear All",
    saveChanges: "Save Changes",
    preview: "Preview",

    // Status
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    published: "Published",
    draft: "Draft",

    // Visibility
    visibility: "Visibility",
    public: "Public",
    private: "Private",

    // Tags
    featured: "Featured Product",
    bestseller: "Bestseller",
    newArrival: "New Arrival",
    onSale: "On Sale",
    outOfStock: "Out of Stock",
    lowStock: "Low Stock",
    inStock: "In Stock",

    // Product Info
    quantity: "Quantity",
    sku: "SKU",
    barcode: "Barcode",
    manufacturer: "Manufacturer",
    warranty: "Warranty",
    returnPolicy: "Return Policy",
    shippingPolicy: "Shipping Policy",

    // Tags & SEO
    tags: "Product Tags",
    addTag: "Add Tag",
    metaTitle: "Meta Title",
    metaDescription: "Meta Description",
    metaKeywords: "Meta Keywords",
    seo: "SEO Settings",

    // Advanced
    advanced: "Advanced Settings",

    // Tabs
    basicInfo: "Basic Information",
    media: "Media",
    pricingInventory: "Pricing & Inventory",
    shippingSpecs: "Shipping & Specifications",
    variantsOptions: "Variants & Options",
    related: "Related Products",
    seoSettings: "SEO",
    statusSettings: "Status & Visibility",

    // View History
    viewAdjustmentHistory: "View adjustment history",

    // Variant Options
    color: "Color",
    size: "Size",
    material: "Material",
    style: "Style",
  },
  ar: {
    // Basic Information
    productDetails: "تفاصيل المنتج",
    productDescription: "وصف المنتج",
    productDescriptionEn: "الوصف بالإنجليزية",
    productDescriptionAr: "الوصف بالعربية",
    enterDescriptionEn: "أدخل وصف المنتج بالإنجليزية...",
    enterDescriptionAr: "أدخل وصف المنتج بالعربية...",
    addArabicDescription: "+ إضافة وصف عربي",
    addEnglishDescription: "+ إضافة وصف إنجليزي",
    hideArabicDescription: "إخفاء الوصف العربي",
    hideEnglishDescription: "إخفاء الوصف الإنجليزي",

    // Key Features
    keyFeatures: "الميزات الرئيسية",
    keyFeaturesTitleEn: "العنوان بالإنجليزية",
    keyFeaturesTitleAr: "العنوان بالعربية",
    keyFeaturesDescEn: "الوصف بالإنجليزية",
    keyFeaturesDescAr: "الوصف بالعربية",
    addFeature: "إضافة ميزة",
    removeFeature: "إزالة الميزة",

    // Delivery
    deliveryInfo: "معلومات التوصيل",
    deliveryTime: "وقت التوصيل",
    deliveryPlaceholder: "مثال: 3-5 أيام عمل",

    // Pricing
    pricing: "التسعير والخصم",
    price: "السعر الأصلي",
    salePrice: "سعر البيع",
    discountFromOriginal: "خصم {percent}% من السعر الأصلي",
    chooseDiscountPeriod: "تعيين فترة الخصم",
    saleStart: "تاريخ بدء البيع",
    saleEnd: "تاريخ انتهاء البيع",
    percentage: "النسبة المئوية",
    fixedAmount: "المبلغ الثابت",
    discountType: "نوع الخصم",
    discount: "الخصم",

    // Inventory
    inventoryWeight: "المخزون والوزن",
    stockQuantity: "الكمية المتاحة",
    weight: "الوزن (كجم)",

    // Sizes & Colors
    sizes: "المقاسات",
    colors: "الألوان",
    selectColor: "اختر اللون",
    addColor: "إضافة لون",
    selectSize: "اختر المقاس",
    addSize: "إضافة مقاس",
    addSelectedSizes: "إضافة المقاسات المحددة",
    addSelectedColors: "إضافة الألوان المحددة",

    // Specifications
    specifications: "مواصفات المنتج",
    specKeyPlaceholderEn: "المفتاح (مثال: Material)",
    specKeyPlaceholderAr: "المفتاح (مثال: المادة)",
    specValuePlaceholderEn: "القيمة (مثال: Cotton)",
    specValuePlaceholderAr: "القيمة (مثال: قطن)",

    // Media
    productImages: "معرض المنتج",
    clickToUpload: "اسحب وأفلت أو انقر للتحميل",
    maxImages: "حتى 10 صور • JPG, PNG, WebP",

    // General
    back: "رجوع",
    remove: "إزالة",
    add: "إضافة",
    save: "حفظ",
    cancel: "إلغاء",
    update: "تحديث",
    edit: "تعديل",
    delete: "حذف",
    done: "تم",

    // Variants
    variants: "متغيرات المنتج",
    variantsManagement: "إدارة المتغيرات",
    optionName: "اسم الخيار",
    optionValues: "قيم الخيار",
    addValue: "أضف قيمة",
    optionValueRequired: "قيمة الخيار مطلوبة",
    deleteOption: "حذف الخيار",
    saveOption: "حفظ الخيار",
    addAnotherOption: "إضافة خيار آخر",
    itemDetailsOfVariant: "تفاصيل العنصر من المتغير",
    sellingPrice: "سعر البيع",
    enterSellingPrice: "أدخل سعر البيع",
    enterUpc: "أدخل الرمز الشريطي",
    selectImage: "اختر صورة",

    // Variants Table
    groupBy: "تجميع حسب",
    collapseAll: "طي الكل",
    expandAll: "توسيع الكل",
    variantPrice: "السعر",
    variantAvailable: "متوفر",
    variantImages: "الصور",
    variantSku: "الرمز",
    totalInventory: "إجمالي المخزون",
    available: "متوفر",
    addVariantImage: "إضافة صورة للمتغير",
    variantOriginPrice: "السعر الأصلي",
    editPrice: "تعديل السعر",
    copyVariant: "نسخ المتغير",
    deleteVariant: "حذف المتغير",

    // Shipping
    shipping: "الشحن",
    shippingSettings: "إعدادات الشحن",
    shippingDimensions: "أبعاد الشحن",
    weightGrams: "الوزن (جم)",
    lengthCm: "الطول (سم)",
    wideCm: "العرض (سم)",
    heightCm: "الارتفاع (سم)",

    // Shipping Packages
    addPackage: "إضافة عبوة",
    managePackages: "إدارة العبوات",
    packageName: "اسم العبوة",
    packageType: "نوع العبوة",
    box: "صندوق",
    envelope: "مظروف",
    softPackage: "عبوة ناعمة",
    dimensions: "الأبعاد",
    weightEmpty: "الوزن (فارغ)",
    useAsDefault: "استخدام كعبوة افتراضية",
    defaultPackageDescription:
      "تُستخدم لحساب الأسعار عند الدفع وتحدد مسبقًا عند شراء الملصقات",

    // Shipping Prices
    allowShipping: "السماح بالشحن",
    shippingPrice: "سعر الشحن",
    shippingInsideCairo: "داخل القاهرة",
    shippingRegionOne: "المنطقة 1",
    shippingRegionTwo: "المنطقة 2",

    // Product Type
    physicalProduct: "منتج مادي",
    digitalProduct: "منتج رقمي",
    shippingRequired: "الشحن مطلوب",
    shippingNotRequired: "الشحن غير مطلوب",

    // Video
    video: "فيديو المنتج",
    addNew: "إضافة فيديو",
    file: "رفع ملف فيديو",
    chooseFile: "اختر ملف",
    orExternalVideoUrl: "أو إدخال رابط فيديو خارجي",
    enterVideoUrl: "أدخل رابط فيديو من YouTube أو Vimeo",
    videoThumbnail: "صورة مصغرة للفيديو",
    chooseImage: "اختر صورة",
    orAddFromUrl: "أو أضف من رابط",
    enterThumbnailUrl: "أدخل رابط صورة مصغرة",

    // Featured Image
    setAsFeatured: "تعيين كصورة مميزة",
    featuredImage: "الصورة المميزة",
    removeFeatured: "إزالة الصورة المميزة",

    // Related Products
    relatedProducts: "المنتجات ذات الصلة",
    crossSellingProducts: "منتجات البيع المتقاطع",
    searchProducts: "ابحث عن المنتجات...",
    priceFieldInfo: "حقل السعر: أدخل المبلغ الذي تريد خصمه من السعر الأصلي. مثال: إذا كان السعر الأصلي 100 دولار، أدخل 20 لتخفيض السعر إلى 80 دولار.",
    typeFieldInfo: "حقل النوع: اختر نوع الخصم: مبلغ ثابت (خصم مبلغ محدد) أو نسبة مئوية (خصم بنسبة مئوية).",
    crossSellingPrice: "السعر",
    crossSellingType: "النوع",
    crossSellingFixed: "مبلغ ثابت",
    crossSellingPercent: "نسبة مئوية",

    // Navigation
    previous: "السابق",
    next: "التالي",

    // Instructions
    priceFieldInstruction: "أدخل المبلغ لتقليله من السعر الأصلي",
    typeFieldInstruction: "اختر نوع الخصم",
    specificationsDescription: "إضافة مواصفات تفصيلية للمنتج",
    inventoryDescription: "إدارة مستويات المخزون ووزن المنتج",
    shippingDescription: "أبعاد العبوة للشحن",
    variantsDescription: "إنشاء متغيرات المنتج (مقاس، لون، إلخ)",
    mediaDescription: "رفع صور وفيديوهات المنتج",
    recommendationsDescription: "إضافة منتجات ذات صلة وبيع متقاطع",

    // Validation
    requiredField: "هذا الحقل مطلوب",
    optional: "اختياري",

    // Actions
    uploadImage: "رفع صورة",
    clearAll: "مسح الكل",
    saveChanges: "حفظ التغييرات",
    preview: "معاينة",

    // Status
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    published: "منشور",
    draft: "مسودة",

    // Visibility
    visibility: "الرؤية",
    public: "عام",
    private: "خاص",

    // Tags
    featured: "منتج مميز",
    bestseller: "الأكثر مبيعاً",
    newArrival: "وصل حديثاً",
    onSale: "في عرض",
    outOfStock: "نفذ من المخزون",
    lowStock: "مخزون منخفض",
    inStock: "متوفر",

    // Product Info
    quantity: "الكمية",
    sku: "الرمز",
    barcode: "الباركود",
    manufacturer: "الشركة المصنعة",
    warranty: "الضمان",
    returnPolicy: "سياسة الإرجاع",
    shippingPolicy: "سياسة الشحن",

    // Tags & SEO
    tags: "علامات المنتج",
    addTag: "إضافة علامة",
    metaTitle: "العنوان التعريفي",
    metaDescription: "الوصف التعريفي",
    metaKeywords: "الكلمات الدلالية",
    seo: "إعدادات SEO",

    // Advanced
    advanced: "الإعدادات المتقدمة",

    // Tabs
    basicInfo: "المعلومات الأساسية",
    media: "الوسائط",
    pricingInventory: "التسعير والمخزون",
    shippingSpecs: "الشحن والمواصفات",
    variantsOptions: "المتغيرات والخيارات",
    related: "المنتجات ذات الصلة",
    seoSettings: "SEO",
    statusSettings: "الحالة والرؤية",

    // View History
    viewAdjustmentHistory: "عرض سجل التعديلات",

    // Variant Options
    color: "اللون",
    size: "المقاس",
    material: "المادة",
    style: "النمط",
  },
};

// Types for variants
interface VariantOption {
  id: string;
  name: string;
  values: string[];
  newValue: string;
  error: string;
  isEditing: boolean;
}

interface ProductVariant {
  id: string;
  sku: string;
  options: Record<string, string>;
  originPrice: number;
  salePrice?: number;
  stock: number;
  images: File[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

interface KeyFeature {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
}

interface ShippingPackage {
  id: string;
  name: string;
  type: "box" | "envelope" | "soft-package";
  length: number;
  width: number;
  height: number;
  weight: number;
  isDefault: boolean;
}

export const DetailsStep = ({
  product,
  errors,
  onUpdate,
  onBack,
}: DetailsStepProps) => {
  const { language, direction } = useLanguage();
  const t = translations[language];

  // State for description fields visibility
  const [showArabicDescription, setShowArabicDescription] = useState(false);
  const [showEnglishDescription, setShowEnglishDescription] = useState(true);
  
  // State for key features Arabic fields visibility
  const [showArabicKeyFeatures, setShowArabicKeyFeatures] = useState(false);

  // State for Key Features
  const [keyFeatures, setKeyFeatures] = useState<KeyFeature[]>([
    {
      id: "1",
      title: { en: "Premium Quality", ar: "جودة عالية" },
      description: {
        en: "Made with the finest materials for durability and comfort",
        ar: "مصنوع من أفضل المواد للمتانة والراحة",
      },
    },
    {
      id: "2",
      title: { en: "Fast Delivery", ar: "توصيل سريع" },
      description: {
        en: "Get your order delivered within 3-5 business days",
        ar: "احصل على طلبك خلال 3-5 أيام عمل",
      },
    },
  ]);

  // Sale price type: "fixed" or "percentage"
  const [salePriceType, setSalePriceType] = useState<"fixed" | "percentage">(
    "fixed",
  );
  const [showDiscountPeriod, setShowDiscountPeriod] = useState(false);
  const [salePercentage, setSalePercentage] = useState<number>(0);

  // Shipping dimensions state
  const [shippingWeight, setShippingWeight] = useState<number>(
    ((product as Record<string, unknown>).shippingWeight as number) || 0,
  );
  const [shippingLength, setShippingLength] = useState<number>(
    ((product as Record<string, unknown>).shippingLength as number) || 0,
  );
  const [shippingWide, setShippingWide] = useState<number>(
    ((product as Record<string, unknown>).shippingWide as number) || 0,
  );
  const [shippingHeight, setShippingHeight] = useState<number>(
    ((product as Record<string, unknown>).shippingHeight as number) || 0,
  );

  // Sync shipping dimensions from product updates
  useEffect(() => {
    const productShippingWeight = (product as Record<string, unknown>)
      .shippingWeight as number | undefined;
    const productShippingLength = (product as Record<string, unknown>)
      .shippingLength as number | undefined;
    const productShippingWide = (product as Record<string, unknown>)
      .shippingWide as number | undefined;
    const productShippingHeight = (product as Record<string, unknown>)
      .shippingHeight as number | undefined;

    if (productShippingWeight !== undefined)
      setShippingWeight(productShippingWeight || 0);
    if (productShippingLength !== undefined)
      setShippingLength(productShippingLength || 0);
    if (productShippingWide !== undefined)
      setShippingWide(productShippingWide || 0);
    if (productShippingHeight !== undefined)
      setShippingHeight(productShippingHeight || 0);
  }, [product]);

  // ============== VARIANTS STATE ==============
  const [variantOptions, setVariantOptions] = useState<VariantOption[]>([
    {
      id: "color-1",
      name: "Color",
      values: ["Green", "Brown", "Navy"],
      newValue: "",
      error: "",
      isEditing: true,
    },
    {
      id: "size-1",
      name: "Size",
      values: ["M", "L", "XL"],
      newValue: "",
      error: "",
      isEditing: false,
    },
  ]);

  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: "var-1",
      sku: "PROD-GRN-M",
      options: { Color: "Green", Size: "M" },
      originPrice: 1000,
      stock: 500,
      images: [],
    },
    {
      id: "var-2",
      sku: "PROD-GRN-L",
      options: { Color: "Green", Size: "L" },
      originPrice: 1000,
      stock: 0,
      images: [],
    },
    {
      id: "var-3",
      sku: "PROD-BRN-M",
      options: { Color: "Brown", Size: "M" },
      originPrice: 1000,
      stock: 0,
      images: [],
    },
    {
      id: "var-4",
      sku: "PROD-BRN-L",
      options: { Color: "Brown", Size: "L" },
      originPrice: 1000,
      stock: 0,
      images: [],
    },
    {
      id: "var-5",
      sku: "PROD-NAV-M",
      options: { Color: "Navy", Size: "M" },
      originPrice: 1000,
      stock: 0,
      images: [],
    },
    {
      id: "var-6",
      sku: "PROD-NAV-L",
      options: { Color: "Navy", Size: "L" },
      originPrice: 1000,
      stock: 0,
      images: [],
    },
    {
      id: "var-7",
      sku: "PROD-NAV-XL",
      options: { Color: "Navy", Size: "XL" },
      originPrice: 1000,
      stock: 0,
      images: [],
    },
  ]);

  const [groupByOption, setGroupByOption] = useState("Color");
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({});

  // ============== SHIPPING PACKAGES STATE ==============
  const [packages, setPackages] = useState<ShippingPackage[]>([
    {
      id: "pkg-1",
      name: "Sample box",
      type: "box",
      length: 22,
      width: 13.7,
      height: 4.2,
      weight: 0,
      isDefault: true,
    },
  ]);

  const [newPackage, setNewPackage] = useState<Omit<ShippingPackage, "id">>({
    name: "",
    type: "box",
    length: 0,
    width: 0,
    height: 0,
    weight: 0,
    isDefault: false,
  });

  const [showAddPackageDialog, setShowAddPackageDialog] = useState(false);

  // ============== SHIPPING SETTINGS STATE ==============
  const [allowShipping, setAllowShipping] = useState(true);
  const [shippingPrices, setShippingPrices] = useState({
    insideCairo: 0,
    regionOne: 0,
    regionTwo: 0,
  });

  // ============== RELATED PRODUCTS STATE ==============
  const [relatedProductsSearch, setRelatedProductsSearch] = useState("");
  const [relatedProductsDropdownOpen, setRelatedProductsDropdownOpen] =
    useState(false);
  const [relatedProductsSelected, setRelatedProductsSelected] = useState<
    Product[]
  >([]);
  const relatedProductsRef = useRef<HTMLDivElement>(null);

  // ============== CROSS-SELLING PRODUCTS STATE ==============
  interface CrossSellingProduct {
    productId: string;
    price: number;
    type: "fixed" | "percent";
  }
  const [crossSellingSearch, setCrossSellingSearch] = useState("");
  const [crossSellingDropdownOpen, setCrossSellingDropdownOpen] =
    useState(false);
  const [crossSellingProducts, setCrossSellingProducts] = useState<
    CrossSellingProduct[]
  >([]);
  const crossSellingRef = useRef<HTMLDivElement>(null);

  // ============== COLOR MODAL STATE ==============
  const [showColorModal, setShowColorModal] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColorHex, setCustomColorHex] = useState("#000000");
  const [customColorName, setCustomColorName] = useState("");
  const [customColors, setCustomColors] = useState<Array<{ name: string; hex: string }>>([]);

  // ============== SIZE MODAL STATE ==============
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSizesInModal, setSelectedSizesInModal] = useState<string[]>([]);

  // ============== VIDEO STATE ==============
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [externalVideoUrl, setExternalVideoUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  // Featured image state
  const featuredImageIndex = (product as Record<string, unknown>)
    .featuredImageIndex as number | undefined;

  // Error helper
  const hasError = (field: string) => !!errors[field];

  // ============== HANDLERS FOR DESCRIPTION ==============
  const handleDescriptionChange = (lang: "en" | "ar", value: string) => {
    onUpdate({
      description: {
        en: lang === "en" ? value : product.description?.en || "",
        ar: lang === "ar" ? value : product.description?.ar || "",
      },
    });
  };

  // ============== HANDLERS FOR KEY FEATURES ==============
  const handleAddKeyFeature = () => {
    const newKeyFeature: KeyFeature = {
      id: Date.now().toString(),
      title: { en: "", ar: "" },
      description: { en: "", ar: "" },
    };
    setKeyFeatures([...keyFeatures, newKeyFeature]);
  };

  const handleUpdateKeyFeature = (
    id: string,
    field: "title" | "description",
    lang: "en" | "ar",
    value: string,
  ) => {
    setKeyFeatures(
      keyFeatures.map((feature) =>
        feature.id === id
          ? { ...feature, [field]: { ...feature[field], [lang]: value } }
          : feature,
      ),
    );
  };

  const handleRemoveKeyFeature = (id: string) => {
    setKeyFeatures(keyFeatures.filter((feature) => feature.id !== id));
  };

  // ============== HANDLERS FOR SPECIFICATIONS ==============
  const [newSpec, setNewSpec] = useState<Specification>({
    key: { en: "", ar: "" },
    value: { en: "", ar: "" },
  });

  const handleAddSpecification = () => {
    if (
      newSpec.key.en &&
      newSpec.value.en &&
      newSpec.key.ar &&
      newSpec.value.ar
    ) {
      onUpdate({
        specifications: [...(product.specifications || []), newSpec],
      });
      setNewSpec({ key: { en: "", ar: "" }, value: { en: "", ar: "" } });
    }
  };

  const handleRemoveSpecification = (index: number) => {
    onUpdate({
      specifications: product.specifications?.filter((_, i) => i !== index),
    });
  };

  // ============== HANDLERS FOR IMAGES ==============
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const updated = [...(product.images || []), ...newFiles].slice(0, 10);
    onUpdate({ images: updated });
  };

  const handleRemoveImage = (index: number) => {
    const updated = (product.images || []).filter((_, i) => i !== index);
    onUpdate({ images: updated });
    if (featuredImageIndex === index) {
      onUpdate({ featuredImageIndex: undefined } as Partial<ProductFormData>);
    } else if (featuredImageIndex !== undefined && featuredImageIndex > index) {
      onUpdate({
        featuredImageIndex: featuredImageIndex - 1,
      } as Partial<ProductFormData>);
    }
  };

  const handleSetFeaturedImage = (index: number) => {
    if (featuredImageIndex === index) {
      onUpdate({ featuredImageIndex: undefined } as Partial<ProductFormData>);
    } else {
      onUpdate({ featuredImageIndex: index } as Partial<ProductFormData>);
    }
  };

  // ============== 100% WORKING VARIANTS HANDLERS ==============
  const handleAddOption = () => {
    const newOption: VariantOption = {
      id: `option-${Date.now()}`,
      name: "",
      values: [],
      newValue: "",
      error: "",
      isEditing: true,
    };
    setVariantOptions([...variantOptions, newOption]);
  };

  const handleUpdateOptionName = (optionId: string, name: string) => {
    setVariantOptions(
      variantOptions.map((opt) =>
        opt.id === optionId ? { ...opt, name } : opt,
      ),
    );
  };

  const handleUpdateOptionNewValue = (optionId: string, value: string) => {
    setVariantOptions(
      variantOptions.map((opt) =>
        opt.id === optionId ? { ...opt, newValue: value, error: "" } : opt,
      ),
    );
  };

  const handleAddOptionValue = (optionId: string) => {
    const option = variantOptions.find((opt) => opt.id === optionId);
    if (!option) return;

    if (!option.newValue.trim()) {
      setVariantOptions(
        variantOptions.map((opt) =>
          opt.id === optionId ? { ...opt, error: t.optionValueRequired } : opt,
        ),
      );
      return;
    }

    // Check if value already exists
    if (option.values.includes(option.newValue.trim())) {
      setVariantOptions(
        variantOptions.map((opt) =>
          opt.id === optionId
            ? { ...opt, error: "Value already exists", newValue: "" }
            : opt,
        ),
      );
      return;
    }

    const updatedOptions = variantOptions.map((opt) =>
      opt.id === optionId
        ? {
            ...opt,
            values: [...opt.values, option.newValue.trim()],
            newValue: "",
            error: "",
          }
        : opt,
    );

    setVariantOptions(updatedOptions);

    // Auto-generate variants when we have at least 2 options with values
    const optionsWithValues = updatedOptions.filter(
      (opt) => opt.values.length > 0,
    );
    if (optionsWithValues.length >= 2) {
      generateAllVariants(updatedOptions);
    }
  };

  const handleRemoveOptionValue = (optionId: string, valueIndex: number) => {
    const updatedOptions = variantOptions.map((opt) =>
      opt.id === optionId
        ? { ...opt, values: opt.values.filter((_, i) => i !== valueIndex) }
        : opt,
    );

    setVariantOptions(updatedOptions);

    // Regenerate variants after removing a value
    generateAllVariants(updatedOptions);
  };

  const handleDeleteOption = (optionId: string) => {
    const updatedOptions = variantOptions.filter((opt) => opt.id !== optionId);
    setVariantOptions(updatedOptions);

    // Regenerate variants after deleting an option
    if (updatedOptions.length > 0) {
      generateAllVariants(updatedOptions);
    } else {
      setVariants([]);
    }
  };

  const handleToggleOptionEditing = (optionId: string) => {
    setVariantOptions(
      variantOptions.map((opt) =>
        opt.id === optionId ? { ...opt, isEditing: !opt.isEditing } : opt,
      ),
    );
  };

  // Function to generate all possible variants from options
  const generateAllVariants = (options: VariantOption[]) => {
    const optionsWithValues = options.filter((opt) => opt.values.length > 0);

    if (optionsWithValues.length === 0) {
      setVariants([]);
      return;
    }

    // Generate all combinations
    const combinations: Record<string, string>[] = [];

    function generateCombinations(
      current: Record<string, string>,
      index: number,
    ) {
      if (index === optionsWithValues.length) {
        combinations.push({ ...current });
        return;
      }

      const option = optionsWithValues[index];
      for (const value of option.values) {
        current[option.name] = value;
        generateCombinations(current, index + 1);
      }
    }

    generateCombinations({}, 0);

    // Create variants from combinations
    const newVariants: ProductVariant[] = combinations.map((combo, index) => {
      // Find existing variant with same options
      const existingVariant = variants.find(
        (variant) => JSON.stringify(variant.options) === JSON.stringify(combo),
      );

      // Generate SKU
      const skuParts = Object.entries(combo).map(
        ([key, value]) =>
          `${key.slice(0, 3).toUpperCase()}-${value.slice(0, 3).toUpperCase()}`,
      );
      const sku = `PROD-${skuParts.join("-")}`;

      return {
        id: existingVariant?.id || `var-${Date.now()}-${index}`,
        sku: existingVariant?.sku || sku,
        options: combo,
        originPrice: existingVariant?.originPrice || product.del_price || 0,
        stock: existingVariant?.stock || 0,
        images: existingVariant?.images || [],
        salePrice: existingVariant?.salePrice,
        weight: existingVariant?.weight,
        dimensions: existingVariant?.dimensions,
      };
    });

    setVariants(newVariants);
  };

  // Variant image handlers
  const handleVariantImageUpload = (
    variantId: string,
    files: FileList | null,
  ) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setVariants(
      variants.map((variant) =>
        variant.id === variantId
          ? { ...variant, images: [...variant.images, ...newFiles].slice(0, 5) }
          : variant,
      ),
    );
  };

  const handleRemoveVariantImage = (variantId: string, imageIndex: number) => {
    setVariants(
      variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              images: variant.images.filter((_, i) => i !== imageIndex),
            }
          : variant,
      ),
    );
  };

  // Variant price and stock handlers
  const handleUpdateVariantPrice = (variantId: string, price: number) => {
    setVariants(
      variants.map((variant) =>
        variant.id === variantId ? { ...variant, originPrice: price } : variant,
      ),
    );
  };

  const handleUpdateVariantStock = (variantId: string, stock: number) => {
    setVariants(
      variants.map((variant) =>
        variant.id === variantId ? { ...variant, stock } : variant,
      ),
    );
  };

  // Generate variants from colors and sizes
  const generateVariantsFromColorsAndSizes = () => {
    const colors = product.colors || [];
    const sizes = product.sizes || [];

    if (colors.length === 0 || sizes.length === 0) {
      return [];
    }

    const combinations: Array<{ color: string; size: string }> = [];
    colors.forEach((color) => {
      sizes.forEach((size) => {
        combinations.push({ color, size });
      });
    });

    return combinations.map((combo, index) => {
      const variantName = `${combo.color}-${combo.size}`;
      // Check if variant already exists
      const existingVariant = variants.find((v) => {
        const variantColor = v.options["Color"] || v.options["color"] || "";
        const variantSize = v.options["Size"] || v.options["size"] || "";
        return variantColor === combo.color && variantSize === combo.size;
      });

      return {
        id: existingVariant?.id || `variant-${Date.now()}-${index}`,
        color: combo.color,
        size: combo.size,
        variantName,
        price: existingVariant?.originPrice || product.del_price || 0,
        upc: existingVariant?.sku || "",
        images: existingVariant?.images || [],
      };
    });
  };

  // Update variant price
  const handleVariantPriceChange = (
    variantId: string,
    price: string | number,
  ) => {
    const priceNum = typeof price === "string" ? parseFloat(price) || 0 : price;
    setVariants(
      variants.map((variant) =>
        variant.id === variantId ? { ...variant, originPrice: priceNum } : variant,
      ),
    );
  };

  // Update variant UPC
  const handleVariantUPCChange = (variantId: string, upc: string) => {
    setVariants(
      variants.map((variant) =>
        variant.id === variantId ? { ...variant, sku: upc } : variant,
      ),
    );
  };

  // Handle variant image selection
  const handleVariantImageSelect = (
    variantId: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setVariants(
      variants.map((variant) =>
        variant.id === variantId
          ? { ...variant, images: [...variant.images, ...newFiles].slice(0, 5) }
          : variant,
      ),
    );
  };

  const handleUpdateVariantSku = (variantId: string, sku: string) => {
    setVariants(
      variants.map((variant) =>
        variant.id === variantId ? { ...variant, sku } : variant,
      ),
    );
  };

  const handleCopyVariant = (variantId: string) => {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) return;

    const newVariant: ProductVariant = {
      ...variant,
      id: `var-${Date.now()}`,
      sku: `${variant.sku}-COPY`,
    };

    setVariants([...variants, newVariant]);
  };

  const handleDeleteVariant = (variantId: string) => {
    setVariants(variants.filter((v) => v.id !== variantId));
  };

  // Group variants by selected option
  const groupedVariants = variants.reduce(
    (groups, variant) => {
      const groupKey = variant.options[groupByOption] || "Other";
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(variant);
      return groups;
    },
    {} as Record<string, ProductVariant[]>,
  );

  const handleToggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    Object.keys(groupedVariants).forEach((key) => {
      allCollapsed[key] = true;
    });
    setCollapsedGroups(allCollapsed);
  };

  const handleExpandAll = () => {
    setCollapsedGroups({});
  };

  // Calculate total inventory
  const totalInventory = variants.reduce(
    (sum, variant) => sum + variant.stock,
    0,
  );

  // ============== PACKAGE HANDLERS ==============
  const handleAddPackage = () => {
    const newPackageWithId: ShippingPackage = {
      ...newPackage,
      id: `pkg-${Date.now()}`,
    };

    // If this package is set as default, remove default from others
    let updatedPackages = [...packages];
    if (newPackage.isDefault) {
      updatedPackages = updatedPackages.map((pkg) => ({
        ...pkg,
        isDefault: false,
      }));
    }

    setPackages([...updatedPackages, newPackageWithId]);
    setNewPackage({
      name: "",
      type: "box",
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
      isDefault: false,
    });
    setShowAddPackageDialog(false);
  };

  const handleRemovePackage = (packageId: string) => {
    const updatedPackages = packages.filter((pkg) => pkg.id !== packageId);

    // If we removed the default package and there are other packages, set the first one as default
    if (
      updatedPackages.length > 0 &&
      !updatedPackages.some((pkg) => pkg.isDefault)
    ) {
      updatedPackages[0].isDefault = true;
    }

    setPackages(updatedPackages);
  };

  const handleSetDefaultPackage = (packageId: string) => {
    setPackages(
      packages.map((pkg) => ({
        ...pkg,
        isDefault: pkg.id === packageId,
      })),
    );
  };

  // ============== SHIPPING PRICE HANDLERS ==============
  const handleShippingPriceChange = (
    region: keyof typeof shippingPrices,
    value: string,
  ) => {
    setShippingPrices({
      ...shippingPrices,
      [region]: parseFloat(value) || 0,
    });
  };

  // ============== VIDEO HANDLERS ==============
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setExternalVideoUrl("");
    }
  };

  const handleThumbnailFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailUrl("");
    }
  };

  const handleSaveVideo = () => {
    const videoData = {
      videoFile: videoFile,
      externalVideoUrl: externalVideoUrl.trim() || undefined,
      thumbnailFile: thumbnailFile,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
    };
    onUpdate({ videos: [videoData] } as Partial<ProductFormData>);
    setShowVideoDialog(false);
    setVideoFile(null);
    setExternalVideoUrl("");
    setThumbnailFile(null);
    setThumbnailUrl("");
  };

  // ============== RELATED PRODUCTS HANDLERS ==============
  const filterRelatedProducts = (searchTerm: string) => {
    if (!searchTerm.trim()) return [];
    return products.filter(
      (product) =>
        !relatedProductsSelected.some(
          (selected) => selected.id === product.id,
        ) &&
        (product.title[language]
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          product.title.en?.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  };

  const relatedProductsFiltered = filterRelatedProducts(relatedProductsSearch);

  const handleRelatedProductSelect = (product: Product) => {
    if (!relatedProductsSelected.some((p) => p.id === product.id)) {
      setRelatedProductsSelected([...relatedProductsSelected, product]);
      setRelatedProductsSearch("");
      setRelatedProductsDropdownOpen(false);
    }
  };

  const handleRemoveRelatedProduct = (productId: string) => {
    setRelatedProductsSelected(
      relatedProductsSelected.filter((p) => p.id !== productId),
    );
  };

  // ============== CROSS-SELLING PRODUCTS HANDLERS ==============
  const filterCrossSellingProducts = (searchTerm: string) => {
    if (!searchTerm.trim()) return [];
    return products.filter(
      (product) =>
        !crossSellingProducts.some(
          (selected) => selected.productId === product.id,
        ) &&
        (product.title[language]
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          product.title.en?.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  };

  const crossSellingFiltered = filterCrossSellingProducts(crossSellingSearch);

  const handleCrossSellingProductSelect = (product: Product) => {
    if (!crossSellingProducts.some((p) => p.productId === product.id)) {
      setCrossSellingProducts([
        ...crossSellingProducts,
        {
          productId: product.id,
          price: 0,
          type: "fixed" as const,
        },
      ]);
      setCrossSellingSearch("");
      setCrossSellingDropdownOpen(false);
    }
  };

  const handleRemoveCrossSellingProduct = (productId: string) => {
    setCrossSellingProducts(
      crossSellingProducts.filter((p) => p.productId !== productId),
    );
  };

  const handleCrossSellingPriceChange = (
    productId: string,
    price: string | number,
  ) => {
    const priceNum = typeof price === "string" ? parseFloat(price) || 0 : price;
    setCrossSellingProducts(
      crossSellingProducts.map((p) =>
        p.productId === productId ? { ...p, price: priceNum } : p,
      ),
    );
  };

  const handleCrossSellingTypeChange = (
    productId: string,
    type: "fixed" | "percent",
  ) => {
    setCrossSellingProducts(
      crossSellingProducts.map((p) =>
        p.productId === productId ? { ...p, type } : p,
      ),
    );
  };

  // ============== CALCULATE DISCOUNT ==============
  const calculateDiscount = () => {
    if (product.del_price && product.price && product.del_price > 0) {
      const discount =
        ((product.del_price - product.price) / product.del_price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  // Handle sale price change based on type
  const handleSalePriceChange = (value: string) => {
    if (salePriceType === "percentage") {
      const percentage = parseFloat(value) || 0;
      setSalePercentage(percentage);
      if (product.del_price && percentage >= 0 && percentage <= 100) {
        const salePrice = product.del_price * (1 - percentage / 100);
        onUpdate({ price: parseFloat(salePrice.toFixed(2)) });
      } else if (percentage === 0) {
        onUpdate({ price: undefined });
      }
    } else {
      onUpdate({ price: parseFloat(value) || undefined });
    }
  };

  const getSalePriceValue = () => {
    if (salePriceType === "percentage") {
      return salePercentage > 0 ? salePercentage.toString() : "";
    }
    return product.price?.toString() || "";
  };

  // Toggle size and color
  const toggleSize = (size: string) => {
    const newSizes = product.sizes?.includes(size)
      ? product.sizes?.filter((s) => s !== size)
      : [...(product.sizes || []), size];
    onUpdate({ sizes: newSizes });
  };

  const toggleColor = (colorName: string) => {
    const newColors = product.colors?.includes(colorName)
      ? product.colors?.filter((c) => c !== colorName)
      : [...(product.colors || []), colorName];
    onUpdate({ colors: newColors });
  };

  // ============== COLOR MODAL HANDLERS ==============
  const handleOpenColorModal = () => {
    // Initialize selected colors with already selected colors from product
    setSelectedColors(product.colors || []);
    setShowColorModal(true);
  };

  const handleCloseColorModal = () => {
    setShowColorModal(false);
    setSelectedColors([]);
    setCustomColorHex("#000000");
    setCustomColorName("");
  };

  const handleTogglePredefinedColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  const handleAddCustomColor = () => {
    if (customColorHex && customColorName.trim()) {
      const newCustomColor = {
        name: customColorName.trim(),
        hex: customColorHex,
      };
      setCustomColors((prev) => [...prev, newCustomColor]);
      setSelectedColors((prev) => [...prev, customColorName.trim()]);
      setCustomColorHex("#000000");
      setCustomColorName("");
    }
  };

  const handleRemoveCustomColor = (colorName: string) => {
    setCustomColors((prev) => prev.filter((c) => c.name !== colorName));
    setSelectedColors((prev) => prev.filter((c) => c !== colorName));
  };

  const handleAddColorsFromModal = () => {
    // Add all selected colors to product
    onUpdate({ colors: selectedColors });
    handleCloseColorModal();
  };

  // ============== SIZE MODAL HANDLERS ==============
  const handleOpenSizeModal = () => {
    // Initialize selected sizes with already selected sizes from product
    setSelectedSizesInModal(product.sizes || []);
    setShowSizeModal(true);
  };

  const handleCloseSizeModal = () => {
    setShowSizeModal(false);
    setSelectedSizesInModal([]);
  };

  const handleToggleSizeInModal = (size: string) => {
    setSelectedSizesInModal((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  const handleAddSizesFromModal = () => {
    // Add all selected sizes to product
    onUpdate({ sizes: selectedSizesInModal });
    handleCloseSizeModal();
  };

  // Initialize variants on mount
  useEffect(() => {
    if (variantOptions.length > 0) {
      generateAllVariants(variantOptions);
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        relatedProductsRef.current &&
        !relatedProductsRef.current.contains(event.target as Node)
      ) {
        setRelatedProductsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============== RENDER VARIANTS OPTIONS SECTION ==============
  // const renderVariantsOptionsSection = () => (
  //   <Card>
  //     <CardHeader>
  //       <CardTitle>{t.variants}</CardTitle>
  //       <CardDescription>{t.variantsDescription}</CardDescription>
  //     </CardHeader>
  //     <CardContent className="space-y-6">
  //       {variantOptions.map((option) => (
  //         <div key={option.id} className="space-y-4 rounded-lg border p-4">
  //           <div className="flex items-center justify-between">
  //             <div className="flex items-center gap-2">
  //               <GripVertical className="cursor-grab text-gray-400" />
  //               <span className="font-medium">{t.optionName}</span>
  //             </div>
  //             <div className="flex items-center gap-2">
  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 onClick={() => handleDeleteOption(option.id)}
  //                 className="text-destructive hover:text-destructive"
  //               >
  //                 <Trash2 className="mr-1 h-4 w-4" />
  //                 {t.deleteOption}
  //               </Button>
  //               <Button
  //                 variant={option.isEditing ? "default" : "outline"}
  //                 size="sm"
  //                 onClick={() => handleToggleOptionEditing(option.id)}
  //               >
  //                 {option.isEditing ? (
  //                   <>
  //                     <Check className="mr-1 h-4 w-4" />
  //                     {t.done}
  //                   </>
  //                 ) : (
  //                   <>
  //                     <Edit className="mr-1 h-4 w-4" />
  //                     {t.edit}
  //                   </>
  //                 )}
  //               </Button>
  //             </div>
  //           </div>

  //           {option.isEditing ? (
  //             <div className="space-y-3">
  //               <div>
  //                 <Input
  //                   placeholder="e.g., Color, Size"
  //                   value={option.name}
  //                   onChange={(e) =>
  //                     handleUpdateOptionName(option.id, e.target.value)
  //                   }
  //                   className="font-medium"
  //                 />
  //               </div>

  //               <div>
  //                 <Label>{t.optionValues}</Label>
  //                 <div className="space-y-2">
  //                   {option.values.map((value, valueIndex) => (
  //                     <div
  //                       key={valueIndex}
  //                       className="flex items-center justify-between rounded-md border px-3 py-2"
  //                     >
  //                       <div className="flex items-center gap-2">
  //                         <div className="h-3 w-3 rounded-full border" />
  //                         <span>{value}</span>
  //                       </div>
  //                       <Button
  //                         variant="ghost"
  //                         size="sm"
  //                         className="h-8 w-8 p-0"
  //                         onClick={() =>
  //                           handleRemoveOptionValue(option.id, valueIndex)
  //                         }
  //                       >
  //                         <X className="h-4 w-4" />
  //                       </Button>
  //                     </div>
  //                   ))}

  //                   <div className="flex gap-2">
  //                     <Input
  //                       placeholder={t.addValue}
  //                       value={option.newValue}
  //                       onChange={(e) =>
  //                         handleUpdateOptionNewValue(option.id, e.target.value)
  //                       }
  //                       onKeyPress={(e) => {
  //                         if (e.key === "Enter") {
  //                           e.preventDefault();
  //                           handleAddOptionValue(option.id);
  //                         }
  //                       }}
  //                       className={option.error ? "border-destructive" : ""}
  //                     />
  //                     <Button onClick={() => handleAddOptionValue(option.id)}>
  //                       {t.add}
  //                     </Button>
  //                   </div>
  //                   {option.error && (
  //                     <p className="text-sm text-destructive">{option.error}</p>
  //                   )}
  //                 </div>
  //               </div>
  //             </div>
  //           ) : (
  //             <div className="space-y-2">
  //               <div className="font-medium text-gray-700">{option.name}</div>
  //               <div className="flex flex-wrap gap-2">
  //                 {option.values.map((value, index) => (
  //                   <Badge
  //                     key={index}
  //                     variant="secondary"
  //                     className="gap-1 pl-2"
  //                   >
  //                     {value}
  //                     <Button
  //                       variant="ghost"
  //                       size="sm"
  //                       className="h-4 w-4 p-0 hover:bg-transparent"
  //                       onClick={() =>
  //                         handleRemoveOptionValue(option.id, index)
  //                       }
  //                     >
  //                       <X className="h-3 w-3" />
  //                     </Button>
  //                   </Badge>
  //                 ))}
  //               </div>
  //             </div>
  //           )}
  //         </div>
  //       ))}

  //       <Button
  //         variant="outline"
  //         onClick={handleAddOption}
  //         className="w-full gap-2"
  //       >
  //         <Plus className="h-4 w-4" />
  //         {t.addAnotherOption}
  //       </Button>
  //     </CardContent>
  //   </Card>
  // );

  // ============== RENDER VARIANTS MANAGEMENT SECTION ==============
  // const renderVariantsManagementSection = () => (
  //   <Card>
  //     <CardHeader>
  //       <div className="flex items-center justify-between">
  //         <div>
  //           <CardTitle>{t.variantsManagement}</CardTitle>
  //           <CardDescription>
  //             Manage product variants, prices, and stock
  //           </CardDescription>
  //         </div>
  //         <div className="flex items-center gap-3">
  //           <div className="flex items-center gap-2">
  //             <Label className="text-sm text-muted-foreground">
  //               {t.groupBy}
  //             </Label>
  //             <Select value={groupByOption} onValueChange={setGroupByOption}>
  //               <SelectTrigger className="w-[120px]">
  //                 <SelectValue />
  //               </SelectTrigger>
  //               <SelectContent>
  //                 {variantOptions
  //                   .filter((opt) => opt.values.length > 0)
  //                   .map((option) => (
  //                     <SelectItem key={option.id} value={option.name}>
  //                       {option.name}
  //                     </SelectItem>
  //                   ))}
  //               </SelectContent>
  //             </Select>
  //           </div>
  //           <div className="flex items-center gap-2">
  //             <Button variant="outline" size="sm" onClick={handleExpandAll}>
  //               {t.expandAll}
  //             </Button>
  //             <Button variant="outline" size="sm" onClick={handleCollapseAll}>
  //               {t.collapseAll}
  //             </Button>
  //           </div>
  //         </div>
  //       </div>
  //     </CardHeader>
  //     <CardContent>
  //       <div className="space-y-4">
  //         {Object.entries(groupedVariants).map(([groupName, groupVariants]) => {
  //           const totalStock = groupVariants.reduce(
  //             (sum, v) => sum + v.stock,
  //             0,
  //           );
  //           const groupPrice = groupVariants[0]?.originPrice || 0;
  //           const isCollapsed = collapsedGroups[groupName];

  //           return (
  //             <div key={groupName} className="rounded-lg border">
  //               <div className="bg-muted/50 flex items-center justify-between border-b p-4">
  //                 <div className="flex items-center gap-3">
  //                   <span className="font-medium">{groupName}</span>
  //                   <Badge variant="outline">
  //                     {groupVariants.length}{" "}
  //                     {groupVariants.length === 1 ? "variant" : "variants"}
  //                   </Badge>
  //                   {totalStock === 0 && (
  //                     <Badge variant="destructive" className="gap-1">
  //                       <X className="h-3 w-3" />
  //                       {t.outOfStock}
  //                     </Badge>
  //                   )}
  //                 </div>
  //                 <div className="flex items-center gap-4">
  //                   <div className="text-right">
  //                     <div className="font-medium">
  //                       E£ {groupPrice.toLocaleString()}
  //                     </div>
  //                     <div className="text-sm text-muted-foreground">
  //                       {totalStock} {t.available}
  //                     </div>
  //                   </div>
  //                   <Button
  //                     variant="ghost"
  //                     size="sm"
  //                     onClick={() => handleToggleGroupCollapse(groupName)}
  //                   >
  //                     {isCollapsed ? (
  //                       <ChevronDown className="h-4 w-4" />
  //                     ) : (
  //                       <ChevronUp className="h-4 w-4" />
  //                     )}
  //                   </Button>
  //                 </div>
  //               </div>

  //               {!isCollapsed && (
  //                 <div className="divide-y">
  //                   {groupVariants.map((variant) => (
  //                     <div key={variant.id} className="p-4">
  //                       <div className="flex items-center justify-between">
  //                         <div className="flex items-center gap-4">
  //                           <div className="space-y-1">
  //                             <div className="font-medium">
  //                               {Object.entries(variant.options)
  //                                 .filter(([key]) => key !== groupByOption)
  //                                 .map(([key, value]) => value)
  //                                 .join(" • ")}
  //                             </div>
  //                             <div className="flex items-center gap-3 text-sm text-muted-foreground">
  //                               <span>
  //                                 {t.variantSku}: {variant.sku}
  //                               </span>
  //                             </div>
  //                           </div>
  //                         </div>

  //                         <div className="flex items-center gap-6">
  //                           {/* Variant Images */}
  //                           <div className="flex items-center gap-2">
  //                             {variant.images.length > 0 ? (
  //                               <div className="flex -space-x-2">
  //                                 {variant.images
  //                                   .slice(0, 3)
  //                                   .map((img, idx) => (
  //                                     <div
  //                                       key={idx}
  //                                       className="relative h-10 w-10"
  //                                     >
  //                                       <Image
  //                                         src={URL.createObjectURL(img)}
  //                                         alt={`Variant ${idx + 1}`}
  //                                         width={40}
  //                                         height={40}
  //                                         className="rounded-full border-2 border-white object-cover"
  //                                       />
  //                                       <Button
  //                                         variant="destructive"
  //                                         size="sm"
  //                                         className="absolute -right-1 -top-1 h-5 w-5 p-0"
  //                                         onClick={() =>
  //                                           handleRemoveVariantImage(
  //                                             variant.id,
  //                                             idx,
  //                                           )
  //                                         }
  //                                       >
  //                                         <X className="h-3 w-3" />
  //                                       </Button>
  //                                     </div>
  //                                   ))}
  //                                 {variant.images.length > 3 && (
  //                                   <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-muted text-xs">
  //                                     +{variant.images.length - 3}
  //                                   </div>
  //                                 )}
  //                               </div>
  //                             ) : (
  //                               <label>
  //                                 <Button
  //                                   variant="outline"
  //                                   size="sm"
  //                                   className="gap-2"
  //                                   onClick={() =>
  //                                     document
  //                                       .getElementById(
  //                                         `variant-image-${variant.id}`,
  //                                       )
  //                                       ?.click()
  //                                   }
  //                                 >
  //                                   <ImageIcon className="h-4 w-4" />
  //                                   {t.addVariantImage}
  //                                 </Button>
  //                                 <input
  //                                   id={`variant-image-${variant.id}`}
  //                                   type="file"
  //                                   className="hidden"
  //                                   multiple
  //                                   accept="image/*"
  //                                   onChange={(e) =>
  //                                     handleVariantImageUpload(
  //                                       variant.id,
  //                                       e.target.files,
  //                                     )
  //                                   }
  //                                 />
  //                               </label>
  //                             )}
  //                           </div>

  //                           {/* Price Input */}
  //                           <div className="w-[140px]">
  //                             <Label className="text-xs text-muted-foreground">
  //                               {t.variantPrice}
  //                             </Label>
  //                             <div className="flex">
  //                               <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-2 text-sm">
  //                                 E£
  //                               </span>
  //                               <Input
  //                                 type="number"
  //                                 value={variant.originPrice}
  //                                 onChange={(e) =>
  //                                   handleUpdateVariantPrice(
  //                                     variant.id,
  //                                     parseFloat(e.target.value) || 0,
  //                                   )
  //                                 }
  //                                 className="h-8 rounded-l-none text-sm"
  //                                 min="0"
  //                                 step="0.01"
  //                               />
  //                             </div>
  //                           </div>

  //                           {/* Stock Input */}
  //                           <div className="w-[120px]">
  //                             <Label className="text-xs text-muted-foreground">
  //                               {t.variantAvailable}
  //                             </Label>
  //                             <Input
  //                               type="number"
  //                               value={variant.stock}
  //                               onChange={(e) =>
  //                                 handleUpdateVariantStock(
  //                                   variant.id,
  //                                   parseInt(e.target.value) || 0,
  //                                 )
  //                               }
  //                               className="h-8 text-sm"
  //                               min="0"
  //                             />
  //                           </div>

  //                           {/* SKU Input */}
  //                           <div className="w-[140px]">
  //                             <Label className="text-xs text-muted-foreground">
  //                               {t.variantSku}
  //                             </Label>
  //                             <Input
  //                               value={variant.sku}
  //                               onChange={(e) =>
  //                                 handleUpdateVariantSku(
  //                                   variant.id,
  //                                   e.target.value,
  //                                 )
  //                               }
  //                               className="h-8 text-sm"
  //                             />
  //                           </div>

  //                           {/* Actions */}
  //                           <DropdownMenu>
  //                             <DropdownMenuTrigger asChild>
  //                               <Button variant="ghost" size="sm">
  //                                 <span className="sr-only">Open menu</span>
  //                                 <svg
  //                                   className="h-4 w-4"
  //                                   fill="none"
  //                                   stroke="currentColor"
  //                                   viewBox="0 0 24 24"
  //                                 >
  //                                   <path
  //                                     strokeLinecap="round"
  //                                     strokeLinejoin="round"
  //                                     strokeWidth="2"
  //                                     d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
  //                                   />
  //                                 </svg>
  //                               </Button>
  //                             </DropdownMenuTrigger>
  //                             <DropdownMenuContent align="end">
  //                               <DropdownMenuItem
  //                                 onClick={() => handleCopyVariant(variant.id)}
  //                               >
  //                                 <Copy className="mr-2 h-4 w-4" />
  //                                 {t.copyVariant}
  //                               </DropdownMenuItem>
  //                               <DropdownMenuSeparator />
  //                               <DropdownMenuItem
  //                                 className="text-destructive"
  //                                 onClick={() =>
  //                                   handleDeleteVariant(variant.id)
  //                                 }
  //                               >
  //                                 <Trash2 className="mr-2 h-4 w-4" />
  //                                 {t.deleteVariant}
  //                               </DropdownMenuItem>
  //                             </DropdownMenuContent>
  //                           </DropdownMenu>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   ))}
  //                 </div>
  //               )}
  //             </div>
  //           );
  //         })}

  //         {variants.length === 0 && (
  //           <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
  //             <Package className="mb-4 h-12 w-12 text-gray-400" />
  //             <h3 className="mb-2 text-lg font-medium">No variants created</h3>
  //             <p className="mb-4 text-sm text-gray-600">
  //               Add variant options and values to automatically generate
  //               variants
  //             </p>
  //             <Button onClick={handleAddOption}>
  //               <Plus className="mr-2 h-4 w-4" />
  //               {t.addAnotherOption}
  //             </Button>
  //           </div>
  //         )}

  //         {variants.length > 0 && (
  //           <div className="bg-muted/30 rounded-lg p-4">
  //             <div className="flex items-center justify-between">
  //               <div>
  //                 <p className="font-medium">{t.totalInventory}</p>
  //                 <p className="text-sm text-muted-foreground">
  //                   At 18 Abdalla Ibn Taher, Nasr City
  //                 </p>
  //               </div>
  //               <div className="text-right">
  //                 <p className="font-medium">
  //                   {totalInventory} {t.available}
  //                 </p>
  //                 <p className="text-sm text-muted-foreground">
  //                   {variants.length} variants total
  //                 </p>
  //               </div>
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     </CardContent>
  //   </Card>
  // );

  // ============== RENDER SHIPPING SECTION ==============
  const renderShippingSection = () => (
    <div className="space-y-6">
      {/* Physical/Digital Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>{t.shippingSettings}</CardTitle>
          <CardDescription>
            Configure shipping options for your product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">{t.physicalProduct}</Label>
                <p className="text-sm text-muted-foreground">
                  {t.shippingRequired}
                </p>
              </div>
              <Switch
                checked={allowShipping}
                onCheckedChange={setAllowShipping}
              />
            </div>

            {allowShipping ? (
              <div className="space-y-4">
                <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {t.shippingInsideCairo}
                    </Label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3">
                        E£
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={shippingPrices.insideCairo}
                        onChange={(e) =>
                          handleShippingPriceChange(
                            "insideCairo",
                            e.target.value,
                          )
                        }
                        className="rounded-l-none"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.shippingRegionOne}</Label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3">
                        E£
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={shippingPrices.regionOne}
                        onChange={(e) =>
                          handleShippingPriceChange("regionOne", e.target.value)
                        }
                        className="rounded-l-none"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.shippingRegionTwo}</Label>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3">
                        E£
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={shippingPrices.regionTwo}
                        onChange={(e) =>
                          handleShippingPriceChange("regionTwo", e.target.value)
                        }
                        className="rounded-l-none"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Packages Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">{t.packageName}</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddPackageDialog(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {t.addPackage}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-md">
                            {pkg.type === "box" && (
                              <Box className="h-5 w-5 text-primary" />
                            )}
                            {pkg.type === "envelope" && (
                              <Layers className="h-5 w-5 text-primary" />
                            )}
                            {pkg.type === "soft-package" && (
                              <Package className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{pkg.name}</span>
                              {pkg.isDefault && (
                                <Badge variant="outline" className="text-xs">
                                  {t.useAsDefault}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {pkg.length} × {pkg.width} × {pkg.height} cm,{" "}
                              {pkg.weight} kg
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultPackage(pkg.id)}
                            disabled={pkg.isDefault}
                          >
                            {t.useAsDefault}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePackage(pkg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{t.managePackages}</span>
                    <Button variant="link" size="sm">
                      {t.viewAdjustmentHistory}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>{t.digitalProduct}</AlertTitle>
                <AlertDescription>{t.shippingNotRequired}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Package Dialog */}
      <Dialog
        open={showAddPackageDialog}
        onOpenChange={setShowAddPackageDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.addPackage}</DialogTitle>
            <DialogDescription>
              Add a new shipping package configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.packageName}</Label>
              <Input
                placeholder="e.g., Sample box"
                value={newPackage.name}
                onChange={(e) =>
                  setNewPackage({ ...newPackage, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t.packageType}</Label>
              <Select
                value={newPackage.type}
                onValueChange={(value: "box" | "envelope" | "soft-package") =>
                  setNewPackage({ ...newPackage, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="box">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4" />
                      {t.box}
                    </div>
                  </SelectItem>
                  <SelectItem value="envelope">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      {t.envelope}
                    </div>
                  </SelectItem>
                  <SelectItem value="soft-package">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {t.softPackage}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t.lengthCm}</Label>
                <div className="flex">
                  <Input
                    type="number"
                    placeholder="0"
                    value={newPackage.length}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        length: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="rounded-r-none"
                    min="0"
                  />
                  <span className="inline-flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm">
                    cm
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.wideCm}</Label>
                <div className="flex">
                  <Input
                    type="number"
                    placeholder="0"
                    value={newPackage.width}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        width: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="rounded-r-none"
                    min="0"
                  />
                  <span className="inline-flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm">
                    cm
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.heightCm}</Label>
                <div className="flex">
                  <Input
                    type="number"
                    placeholder="0"
                    value={newPackage.height}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        height: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="rounded-r-none"
                    min="0"
                  />
                  <span className="inline-flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm">
                    cm
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.weightEmpty}</Label>
                <div className="flex">
                  <Input
                    type="number"
                    placeholder="0"
                    value={newPackage.weight}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="rounded-r-none"
                    min="0"
                  />
                  <span className="inline-flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm">
                    kg
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="default-package"
                checked={newPackage.isDefault}
                onCheckedChange={(checked) =>
                  setNewPackage({ ...newPackage, isDefault: checked })
                }
              />
              <Label htmlFor="default-package" className="cursor-pointer">
                <div>
                  <span className="font-medium">{t.useAsDefault}</span>
                  <p className="text-sm text-muted-foreground">
                    {t.defaultPackageDescription}
                  </p>
                </div>
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddPackageDialog(false)}
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleAddPackage}
              disabled={!newPackage.name.trim()}
            >
              {t.addPackage}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // ============== RENDER IMAGES SECTION ==============
  const renderImagesSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t.productImages}</CardTitle>
        <CardDescription>{t.maxImages}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <label
          htmlFor="imageUpload"
          className="hover:bg-primary/5 group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center transition-colors hover:border-primary"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="bg-primary/10 rounded-full p-4">
              <ImageIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-700">{t.clickToUpload}</p>
              <p className="mt-1 text-sm text-gray-500">{t.maxImages}</p>
            </div>
            <Button variant="outline" size="sm">
              {t.uploadImage}
            </Button>
          </div>
          <input
            id="imageUpload"
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
        </label>

        {/* Image Grid */}
        {(product.images || []).length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {(product.images || []).map((img, index) => {
              const isFeatured = featuredImageIndex === index;
              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                    isFeatured
                      ? "ring-primary/20 border-primary ring-2"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={
                      typeof img === "string" ? img : URL.createObjectURL(img)
                    }
                    alt={`Product image ${index + 1}`}
                    width={200}
                    height={200}
                    className="aspect-square w-full object-cover"
                  />

                  {/* Featured Badge */}
                  {isFeatured && (
                    <Badge className="absolute left-2 top-2">
                      <Star className="mr-1 h-3 w-3" />
                      {t.featuredImage}
                    </Badge>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-full items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetFeaturedImage(index)}
                        className={
                          isFeatured
                            ? "hover:bg-destructive/90 bg-destructive"
                            : ""
                        }
                      >
                        {isFeatured ? t.removeFeatured : t.setAsFeatured}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Order Badge */}
                  <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                    {index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ============== RENDER PRICING SECTION ==============
  const renderPricingSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t.pricing}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Single Row: Original Price, Sale Price, Discount Number, Discount Type */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Original Price */}
          <div className="space-y-2">
            <Label>{t.price}</Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3">
                <DollarSign className="h-4 w-4" />
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={product.del_price ?? ""}
                onChange={(e) =>
                  onUpdate({
                    del_price: parseFloat(e.target.value) || undefined,
                  })
                }
                className="rounded-l-none"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Sale Price */}
          <div className="space-y-2">
            <Label>{t.salePrice}</Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3">
                <DollarSign className="h-4 w-4" />
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={product.price ?? ""}
                onChange={(e) =>
                  onUpdate({
                    price: parseFloat(e.target.value) || undefined,
                  })
                }
                className="rounded-l-none"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Discount Number */}
          <div className="space-y-2">
            <Label>{t.discount}</Label>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3">
                {salePriceType === "fixed" ? (
                  <DollarSign className="h-4 w-4" />
                ) : (
                  <Percent className="h-4 w-4" />
                )}
              </span>
              <Input
                type="number"
                placeholder="0"
                value={getSalePriceValue()}
                onChange={(e) => handleSalePriceChange(e.target.value)}
                className="rounded-l-none"
                min="0"
                max={salePriceType === "percentage" ? "100" : undefined}
                step={salePriceType === "percentage" ? "1" : "0.01"}
              />
            </div>
          </div>

          {/* Discount Type Selection */}
          <div className="space-y-2">
            <Label>{t.discountType || "Discount Type"}</Label>
            <Select
              value={salePriceType}
              onValueChange={(value: "fixed" | "percentage") =>
                setSalePriceType(value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {t.fixedAmount}
                  </div>
                </SelectItem>
                <SelectItem value="percentage">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    {t.percentage}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Discount Period Button */}
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiscountPeriod(!showDiscountPeriod)}
          >
            <Calendar className="mr-1 h-4 w-4" />
            {t.chooseDiscountPeriod}
          </Button>
        </div>

        {/* Discount Period */}
        {showDiscountPeriod && (
          <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t.saleStart}</Label>
              <Input
                type="date"
                value={product.saleStart || ""}
                onChange={(e) => onUpdate({ saleStart: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.saleEnd}</Label>
              <Input
                type="date"
                value={product.saleEnd || ""}
                onChange={(e) => onUpdate({ saleEnd: e.target.value })}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ============== RENDER INVENTORY SECTION ==============
  const renderInventorySection = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t.inventoryWeight}</CardTitle>
        <CardDescription>{t.inventoryDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inventory & Weight */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t.stockQuantity}</Label>
            <Input
              type="number"
              placeholder="e.g. 100"
              value={product.stock ?? ""}
              onChange={(e) =>
                onUpdate({
                  stock: parseInt(e.target.value, 10) || undefined,
                })
              }
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>{t.weight}</Label>
            <Input
              type="number"
              placeholder="e.g. 1.5"
              value={product.weightKg ?? ""}
              onChange={(e) =>
                onUpdate({
                  weightKg: parseFloat(e.target.value) || undefined,
                })
              }
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Sizes Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">{t.sizes}</Label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {t.selectSize}
              </span>
              <Dialog open={showSizeModal} onOpenChange={setShowSizeModal}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenSizeModal}
                    className="gap-2"
                  >
                    <Ruler className="h-4 w-4" />
                    {t.addSize}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{t.selectSize}</DialogTitle>
                    <DialogDescription>
                      Select sizes for your product
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Predefined Sizes */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        Available Sizes
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {sizeOptions.map((size) => {
                          const isSelected = selectedSizesInModal.includes(size);
                          return (
                            <div
                              key={size}
                              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleToggleSizeInModal(size)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleToggleSizeInModal(size)
                                }
                              />
                              <label
                                className="flex flex-1 cursor-pointer items-center gap-3"
                                onClick={() => handleToggleSizeInModal(size)}
                              >
                                <span className="font-medium">{size}</span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={handleCloseSizeModal}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      onClick={handleAddSizesFromModal}
                      disabled={selectedSizesInModal.length === 0}
                    >
                      {t.addSelectedSizes} ({selectedSizesInModal.length})
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Display Selected Sizes */}
          {(product.sizes || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(product.sizes || []).map((size) => (
                <div
                  key={size}
                  className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm"
                >
                  <span className="text-sm font-medium">{size}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSize(size)}
                    className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colors Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">{t.colors}</Label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {t.selectColor}
              </span>
              <Dialog open={showColorModal} onOpenChange={setShowColorModal}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenColorModal}
                    className="gap-2"
                  >
                    <Palette className="h-4 w-4" />
                    {t.addColor}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t.selectColor}</DialogTitle>
                    <DialogDescription>
                      Select colors from predefined options or add custom colors
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Predefined Colors */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        Predefined Colors
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {colorOptions.map((color) => {
                          const isSelected = selectedColors.includes(color.name);
                          return (
                            <div
                              key={color.name}
                              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50"
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleTogglePredefinedColor(color.name)
                                }
                              />
                              <label
                                htmlFor={`color-${color.name}`}
                                className="flex flex-1 cursor-pointer items-center gap-3"
                                onClick={() =>
                                  handleTogglePredefinedColor(color.name)
                                }
                              >
                                <div
                                  className="h-8 w-8 rounded-full border"
                                  style={{
                                    backgroundColor: color.color,
                                    borderColor:
                                      (color as { border?: string }).border || color.color,
                                  }}
                                />
                                <span className="font-medium">
                                  {color.name}
                                </span>
                              </label>
                            </div>
                          );
                        })}
                        {/* Custom Colors */}
                        {customColors.map((color) => {
                          const isSelected = selectedColors.includes(color.name);
                          return (
                            <div
                              key={color.name}
                              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50"
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  handleTogglePredefinedColor(color.name)
                                }
                              />
                              <label
                                htmlFor={`color-custom-${color.name}`}
                                className="flex flex-1 cursor-pointer items-center gap-3"
                                onClick={() =>
                                  handleTogglePredefinedColor(color.name)
                                }
                              >
                                <div
                                  className="h-8 w-8 rounded-full border"
                                  style={{
                                    backgroundColor: color.hex,
                                  }}
                                />
                                <span className="font-medium">
                                  {color.name}
                                </span>
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    {/* Custom Color Picker */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        Custom Color
                      </Label>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-10 w-10 rounded border"
                              style={{ backgroundColor: customColorHex }}
                            />
                            <Input
                              type="color"
                              value={customColorHex}
                              onChange={(e) =>
                                setCustomColorHex(e.target.value)
                              }
                              className="h-10 w-20 cursor-pointer"
                            />
                            <Input
                              type="text"
                              placeholder="#000000"
                              value={customColorHex}
                              onChange={(e) => setCustomColorHex(e.target.value)}
                              className="flex-1"
                              dir="ltr"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Color Name</Label>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="Enter color name"
                              value={customColorName}
                              onChange={(e) =>
                                setCustomColorName(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddCustomColor();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={handleAddCustomColor}
                              disabled={!customColorHex || !customColorName.trim()}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Custom Colors List */}
                      {customColors.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm">Added Custom Colors</Label>
                          <div className="flex flex-wrap gap-2">
                            {customColors.map((color) => (
                              <div
                                key={color.name}
                                className="flex items-center gap-2 rounded-lg border p-2"
                              >
                                <div
                                  className="h-6 w-6 rounded-full border"
                                  style={{
                                    backgroundColor: color.hex,
                                  }}
                                />
                                <span className="text-sm font-medium">
                                  {color.name}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveCustomColor(color.name)
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={handleCloseColorModal}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      onClick={handleAddColorsFromModal}
                      disabled={selectedColors.length === 0}
                    >
                      Add Selected Colors ({selectedColors.length})
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Display Selected Colors */}
          {(product.colors || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(product.colors || []).map((colorName) => {
                // Find color in predefined options
                const predefinedColor = colorOptions.find(
                  (c) => c.name === colorName
                );
                // Find color in custom colors
                const customColor = customColors.find(
                  (c) => c.name === colorName
                );
                const colorHex = predefinedColor?.color || customColor?.hex || "#cccccc";
                const borderColor = (predefinedColor as { border?: string })?.border || colorHex;

                return (
                  <div
                    key={colorName}
                    className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm"
                  >
                    <div
                      className="h-5 w-5 rounded-full border"
                      style={{
                        backgroundColor: colorHex,
                        borderColor: borderColor,
                      }}
                    />
                    <span className="text-sm font-medium">{colorName}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleColor(colorName)}
                      className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Variants Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">{t.variants}</Label>
          
          {/* Variant Options */}
          {variantOptions.map((option) => (
            <div
              key={option.id}
              className="space-y-4 rounded-lg border bg-white p-4"
            >
              {/* Header with drag icon, option name label, and action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 cursor-grab text-gray-400" />
                  <Label className="text-sm font-medium text-gray-700">
                    {t.optionName}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteOption(option.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    {t.deleteOption}
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => handleToggleOptionEditing(option.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="mr-1 h-4 w-4" />
                    {t.done}
                  </Button>
                </div>
              </div>

              {/* Option Name Input */}
              <div className="space-y-2">
                <Input
                  placeholder="e.g., Color, Size"
                  value={option.name}
                  onChange={(e) =>
                    handleUpdateOptionName(option.id, e.target.value)
                  }
                  className="w-full"
                />
              </div>

              {/* Option Values Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  {t.optionValues}
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={t.addValue}
                    value={option.newValue}
                    onChange={(e) =>
                      handleUpdateOptionNewValue(option.id, e.target.value)
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOptionValue(option.id);
                      }
                    }}
                    className={option.error ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddOptionValue(option.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {t.add}
                  </Button>
                </div>
                {option.error && (
                  <p className="text-sm text-destructive">{option.error}</p>
                )}

                {/* Display added values as badges */}
                {option.values.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {option.values.map((value, valueIndex) => (
                      <Badge
                        key={valueIndex}
                        variant="secondary"
                        className="flex items-center gap-2 px-3 py-1"
                      >
                        {value}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveOptionValue(option.id, valueIndex)
                          }
                          className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Add Another Option Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddOption}
            className="gap-2 w-full"
          >
            <Plus className="h-4 w-4" />
            {t.addAnotherOption}
          </Button>
        </div>

        {/* Item details of variant - Generated from colors and sizes */}
        {(product.colors || []).length > 0 &&
          (product.sizes || []).length > 0 && (
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">
                {t.itemDetailsOfVariant}
              </h3>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Variants
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        {t.sellingPrice}*
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        UPC*
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Image
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generateVariantsFromColorsAndSizes().map((variant) => {
                      const existingVariant = variants.find((v) => {
                        const variantColor =
                          v.options["Color"] || v.options["color"] || "";
                        const variantSize =
                          v.options["Size"] || v.options["size"] || "";
                        return (
                          variantColor === variant.color &&
                          variantSize === variant.size
                        );
                      }) || {
                        id: variant.id,
                        originPrice: variant.price,
                        sku: variant.upc,
                        images: variant.images,
                        options: { Color: variant.color, Size: variant.size },
                        stock: 0,
                      };

                      // Ensure variant exists in variants state
                      if (!variants.find((v) => v.id === existingVariant.id)) {
                        setVariants([...variants, existingVariant]);
                      }

                      return (
                        <tr key={variant.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-sm font-medium text-gray-700">
                              {variant.variantName}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              placeholder={t.enterSellingPrice}
                              value={
                                existingVariant.originPrice > 0
                                  ? existingVariant.originPrice
                                  : ""
                              }
                              onChange={(e) =>
                                handleVariantPriceChange(
                                  existingVariant.id,
                                  e.target.value,
                                )
                              }
                              min="0"
                              step="0.01"
                              className="w-full"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              type="text"
                              placeholder={t.enterUpc}
                              value={existingVariant.sku || ""}
                              onChange={(e) =>
                                handleVariantUPCChange(
                                  existingVariant.id,
                                  e.target.value,
                                )
                              }
                              className="w-full"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) =>
                                  handleVariantImageSelect(
                                    existingVariant.id,
                                    e,
                                  )
                                }
                                className="hidden"
                                id={`variant-image-${existingVariant.id}`}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  document
                                    .getElementById(
                                      `variant-image-${existingVariant.id}`,
                                    )
                                    ?.click()
                                }
                                className="gap-2"
                              >
                                <ImageIcon className="h-4 w-4" />
                                {t.selectImage}
                              </Button>
                              {existingVariant.images.length > 0 && (
                                <span className="text-sm text-gray-500">
                                  ({existingVariant.images.length})
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );

  // ============== RENDER SPECIFICATIONS SECTION ==============
  const renderSpecificationsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t.specifications}</CardTitle>
        <CardDescription>{t.specificationsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {/* English Specification */}
          <div className="space-y-2">
            <Label>{t.specKeyPlaceholderEn}</Label>
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                placeholder="Key (e.g., Material)"
                value={newSpec.key.en || ""}
                onChange={(e) =>
                  setNewSpec({
                    ...newSpec,
                    key: { ...newSpec.key, en: e.target.value },
                  })
                }
                dir="ltr"
              />
              <Input
                placeholder="Value (e.g., Cotton)"
                value={newSpec.value.en || ""}
                onChange={(e) =>
                  setNewSpec({
                    ...newSpec,
                    value: { ...newSpec.value, en: e.target.value },
                  })
                }
                dir="ltr"
              />
            </div>
          </div>

          {/* Arabic Specification */}
          <div className="space-y-2">
            <Label>{t.specKeyPlaceholderAr}</Label>
            <div className="grid gap-2 md:grid-cols-2">
              <Input
                placeholder="المفتاح (مثال: المادة)"
                value={newSpec.key.ar || ""}
                onChange={(e) =>
                  setNewSpec({
                    ...newSpec,
                    key: { ...newSpec.key, ar: e.target.value },
                  })
                }
                dir="rtl"
              />
              <Input
                placeholder="القيمة (مثال: قطن)"
                value={newSpec.value.ar || ""}
                onChange={(e) =>
                  setNewSpec({
                    ...newSpec,
                    value: { ...newSpec.value, ar: e.target.value },
                  })
                }
                dir="rtl"
              />
            </div>
          </div>

          <Button
            onClick={handleAddSpecification}
            disabled={
              !newSpec.key.en ||
              !newSpec.value.en ||
              !newSpec.key.ar ||
              !newSpec.value.ar
            }
            className="w-full"
          >
            {t.add} Specification
          </Button>
        </div>

        {/* Specifications List */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="space-y-2">
            <Label>Added Specifications</Label>
            <ScrollArea className="h-[300px] rounded-md border">
              {product.specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b p-3 last:border-b-0"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" dir="ltr">
                        {spec.key.en}:
                      </span>
                      <span dir="ltr">{spec.value.en}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span dir="rtl">{spec.key.ar}:</span>
                      <span dir="rtl">{spec.value.ar}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSpecification(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ============== RENDER CROSS-SELLING SECTION ==============
  const renderCrossSellingSection = () => {
    return (
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>{t.crossSellingProducts}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 overflow-visible" ref={crossSellingRef}>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder={t.searchProducts}
              value={crossSellingSearch}
              onChange={(e) => {
                setCrossSellingSearch(e.target.value);
                setCrossSellingDropdownOpen(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (crossSellingSearch.length > 0) {
                  setCrossSellingDropdownOpen(true);
                }
              }}
              className="pr-9"
            />

            {/* Dropdown */}
            {crossSellingDropdownOpen && crossSellingFiltered.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-[9999] mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-white py-1 shadow-lg">
                {crossSellingFiltered.map((product) => (
                  <div
                    key={product.id}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-100"
                    onClick={() => handleCrossSellingProductSelect(product)}
                  >
                    {product.images?.[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.title[language] || product.title.en}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                      />
                    )}
                    <span className="text-sm">
                      {product.title[language] || product.title.en}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
            <p>• {t.priceFieldInfo}</p>
            <p>• {t.typeFieldInfo}</p>
          </div>

          {/* Selected Cross-selling Products */}
          {crossSellingProducts.length > 0 && (
            <div className="space-y-3">
              {crossSellingProducts.map((crossProduct) => {
                const product = products.find(
                  (p) => p.id === crossProduct.productId,
                );
                if (!product) return null;

                return (
                  <div
                    key={crossProduct.productId}
                    className="relative rounded-lg border bg-white p-4"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleRemoveCrossSellingProduct(crossProduct.productId)
                      }
                      className="absolute right-2 top-2 h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <div className="flex items-start gap-4 pr-8">
                      {/* Product Image */}
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.title[language] || product.title.en}
                          width={80}
                          height={80}
                          className="rounded object-cover"
                        />
                      )}

                      {/* Product Info and Controls */}
                      <div className="flex-1 space-y-3">
                        <div className="font-medium">
                          {product.title[language] || product.title.en}
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {/* Price Input */}
                          <div className="space-y-1">
                            <Label>{t.crossSellingPrice}</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={crossProduct.price || ""}
                              onChange={(e) =>
                                handleCrossSellingPriceChange(
                                  crossProduct.productId,
                                  e.target.value,
                                )
                              }
                              min="0"
                              step="0.01"
                            />
                          </div>

                          {/* Type Dropdown */}
                          <div className="space-y-1">
                            <Label>{t.crossSellingType}</Label>
                            <Select
                              value={crossProduct.type}
                              onValueChange={(value: "fixed" | "percent") =>
                                handleCrossSellingTypeChange(
                                  crossProduct.productId,
                                  value,
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">
                                  {t.crossSellingFixed}
                                </SelectItem>
                                <SelectItem value="percent">
                                  {t.crossSellingPercent}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // ============== RENDER RELATED PRODUCTS SECTION ==============
  const renderRelatedProductsSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>{t.relatedProducts}</CardTitle>
        <CardDescription>{t.recommendationsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" ref={relatedProductsRef}>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder={t.searchProducts}
              value={relatedProductsSearch}
              onChange={(e) => {
                setRelatedProductsSearch(e.target.value);
                setRelatedProductsDropdownOpen(e.target.value.length > 0);
              }}
              onFocus={() => {
                if (relatedProductsSearch.length > 0) {
                  setRelatedProductsDropdownOpen(true);
                }
              }}
              className="pl-9"
            />
          </div>

          {/* Search Results */}
          {relatedProductsDropdownOpen &&
            relatedProductsFiltered.length > 0 && (
              <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white py-1 shadow-lg">
                {relatedProductsFiltered.map((product) => (
                  <div
                    key={product.id}
                    className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-100"
                    onClick={() => handleRelatedProductSelect(product)}
                  >
                    {product.images?.[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.title[language] || product.title.en}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    )}
                    <div>
                      <p className="font-medium">
                        {product.title[language] || product.title.en}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {product.sku}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          {/* Selected Products */}
          {relatedProductsSelected.length > 0 && (
            <div className="space-y-2">
              <Label>
                Selected Products ({relatedProductsSelected.length})
              </Label>
              <div className="grid gap-2">
                {relatedProductsSelected.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {product.images?.[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.title[language] || product.title.en}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">
                          {product.title[language] || product.title.en}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.sku}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRelatedProduct(product.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 overflow-visible"
      dir={direction}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t.productDetails}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Complete all product details including descriptions, pricing, media,
            and specifications
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="gap-2">
          {t.back}
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-6 overflow-visible">
        {/* Pricing & Inventory */}
        <div className="space-y-6">
          {renderPricingSection()}
          {renderInventorySection()}
        </div>

        {/* Shipping & Specifications */}
        <div className="space-y-6">
          {renderShippingSection()}
          {renderSpecificationsSection()}
        </div>

        {/* Variants & Options
        <div className="space-y-6">
          {renderVariantsOptionsSection()}
          {renderVariantsManagementSection()}
        </div> */}

        {/* Related Products */}
        <div className="space-y-6">
          {renderRelatedProductsSection()}
        </div>

        {/* Cross-selling Products */}
        <div className="space-y-6 overflow-visible">
          {renderCrossSellingSection()}
        </div>
      </div>
    </motion.div>
  );
};
