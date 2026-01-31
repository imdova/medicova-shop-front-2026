// components/product/SetupStep.tsx
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState, useEffect, useMemo, useCallback } from "react";
import { Clipboard, X, RefreshCw, ArrowRight, CheckCircle, Globe, Plus, Minus, Trash2, Sparkles, ImageIcon, Star, Image as ImageIconType, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductFormData } from "@/lib/validations/product-schema";
import { CategoryType, Brand } from "@/types";
import { allCategories } from "@/constants/categouries";
import { brands } from "@/constants/brands";
import {
  EnhancedDynamicSearchMenu,
  SearchableItem,
} from "@/components/UI/DynamicSearchMenu";
import { motion } from "framer-motion";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";

import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Separator } from "@/components/UI/separator";
import { Label } from "@/components/UI/label";
import { Alert, AlertDescription } from "@/components/UI/alert";
import { Textarea } from "@/components/UI/textarea";
import { CardFooter } from "@/components/UI/card";
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

interface SetupStepProps {
  product: ProductFormData;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  onValidate: () => void;
  onBack: () => void;
}

interface KeyFeature {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
}

const translations = {
  en: {
    setup: "Setup",
    productName: "Product Name",
    productNameEn: "Product Name (English)",
    productNameAr: "Product Name (Arabic)",
    enterProductNameEn: "Enter product name in English",
    enterProductNameAr: "Enter product name in Arabic",
    selectProductCategory: "Select Product Category",
    selectProductSubcategory: "Select Product Subcategory",
    searchCategories: "Search categories...",
    searchSubcategories: "Search subcategories...",
    noCategoriesFound: "No categories found",
    selected: "Selected",
    selectBrand: "Select Brand",
    searchBrand: "Search brand...",
    noBrandsFound: "No brands found",
    selectStore: "Select Store",
    searchStore: "Search store...",
    noStoresFound: "No stores found",
    productType: "Product Type",
    physical: "Physical",
    digitalProduct: "Digital Product",
    productIdentity: "Product Identity",
    permalink: "Permalink",
    permalinkPlaceholder: "product-url-slug",
    generatePermalink: "Generate from product name",
    manualSkuEntry: "Manual SKU Entry",
    enterSku: "Enter your SKU",
    submit: "Submit",
    or: "or",
    generateSku: "Generate SKU Automatically",
    skuGenerated: "SKU Generated",
    nextDetails: "Next: Details",
    clearSearch: "Clear search",
    clearAll: "Clear All",
    back: "Back",
    mainCategories: "Main Categories",
    subcategories: "Subcategories",
    nestedSubcategories: "Child Subcategories",
    selectedCategoryPath: "Selected Category Path",
    clearSelection: "Clear Selection",
    loading: "Loading...",
    required: "Required",
    pleaseSelect: "Please select...",
    selectFromList: "Select from list...",
    baseUrl: "https://yourstore.com/products/",
    permalinkHelp: "This will be used for the product URL",
    regenerate: "Regenerate",
    setupDescription: "Configure basic product information and identity",
    productInfo: "Product Information",
    categoryInfo: "Category & Brand",
    validationInfo: "Complete all required fields to proceed",
    requiredField: "This field is required",
    optional: "Optional",
    productDescription: "Product Description",
    productDescriptionEn: "English Description",
    productDescriptionAr: "Arabic Description",
    enterDescriptionEn: "Enter product description in English...",
    enterDescriptionAr: "Enter product description in Arabic...",
    addArabicDescription: "+ Add Arabic Description",
    hideArabicDescription: "Hide Arabic Description",
    keyFeatures: "Key Features",
    keyFeaturesTitleEn: "Title in English",
    keyFeaturesTitleAr: "Title in Arabic",
    keyFeaturesDescEn: "Description in English",
    keyFeaturesDescAr: "Description in Arabic",
    addFeature: "Add Feature",
    productImages: "Product Gallery",
    clickToUpload: "Drag & drop or click to upload",
    maxImages: "Up to 10 images • JPG, PNG, WebP",
    uploadImage: "Upload Image",
    chooseFromGallery: "Choose from Gallery",
    featuredImage: "Featured Image",
    setAsFeatured: "Set as Featured",
    removeFeatured: "Remove Featured",
    video: "Product Video",
    addNew: "Add Video",
    file: "Upload Video File",
    orExternalVideoUrl: "Enter External Video URL",
    enterVideoUrl: "Enter YouTube or Vimeo video URL",
    videoThumbnail: "Video Thumbnail",
    chooseImage: "Choose image",
    orAddFromUrl: "or Add from URL",
    enterThumbnailUrl: "Enter thumbnail image URL",
    saveChanges: "Save Changes",
    cancel: "Cancel",
  },
  ar: {
    setup: "الإعداد",
    productName: "اسم المنتج",
    productNameEn: "اسم المنتج (الإنجليزية)",
    productNameAr: "اسم المنتج (العربية)",
    enterProductNameEn: "أدخل اسم المنتج باللغة الإنجليزية",
    enterProductNameAr: "أدخل اسم المنتج باللغة العربية",
    selectProductCategory: "اختر فئة المنتج",
    selectProductSubcategory: "اختر فئة المنتج الفرعية",
    searchCategories: "ابحث في الفئات...",
    searchSubcategories: "ابحث في الفئات الفرعية...",
    noCategoriesFound: "لا توجد فئات",
    selected: "محدد",
    selectBrand: "اختر العلامة التجارية",
    searchBrand: "ابحث عن علامة تجارية...",
    noBrandsFound: "لا توجد علامات تجارية",
    selectStore: "اختر المتجر",
    searchStore: "ابحث عن متجر...",
    noStoresFound: "لا توجد متاجر",
    productType: "نوع المنتج",
    physical: "مادي",
    digitalProduct: "منتج رقمي",
    productIdentity: "هوية المنتج",
    permalink: "الرابط الدائم",
    permalinkPlaceholder: "اسم-المنتج",
    generatePermalink: "إنشاء من اسم المنتج",
    manualSkuEntry: "إدخال SKU يدويًا",
    enterSku: "أدخل SKU الخاص بك",
    submit: "إرسال",
    or: "أو",
    generateSku: "إنشاء SKU تلقائيًا",
    skuGenerated: "تم إنشاء SKU",
    nextDetails: "التالي: التفاصيل",
    clearSearch: "مسح البحث",
    clearAll: "مسح الكل",
    back: "رجوع",
    mainCategories: "الفئات الرئيسية",
    subcategories: "الفئات الفرعية",
    nestedSubcategories: "الفئات الفرعية التابعة",
    selectedCategoryPath: "مسار الفئة المحددة",
    clearSelection: "مسح الاختيار",
    loading: "جاري التحميل...",
    required: "مطلوب",
    pleaseSelect: "الرجاء الاختيار...",
    selectFromList: "اختر من القائمة...",
    baseUrl: "https://yourstore.com/products/",
    permalinkHelp: "سيتم استخدام هذا لرابط المنتج",
    regenerate: "إعادة إنشاء",
    setupDescription: "تكوين المعلومات الأساسية للمنتج وهويتها",
    productInfo: "معلومات المنتج",
    categoryInfo: "الفئة والعلامة التجارية",
    validationInfo: "أكمل جميع الحقول المطلوبة للمتابعة",
    requiredField: "هذا الحقل مطلوب",
    optional: "اختياري",
    productDescription: "وصف المنتج",
    productDescriptionEn: "الوصف بالإنجليزية",
    productDescriptionAr: "الوصف بالعربية",
    enterDescriptionEn: "أدخل وصف المنتج بالإنجليزية...",
    enterDescriptionAr: "أدخل وصف المنتج بالعربية...",
    addArabicDescription: "+ إضافة وصف عربي",
    hideArabicDescription: "إخفاء الوصف العربي",
    keyFeatures: "المميزات الرئيسية",
    keyFeaturesTitleEn: "العنوان بالإنجليزية",
    keyFeaturesTitleAr: "العنوان بالعربية",
    keyFeaturesDescEn: "الوصف بالإنجليزية",
    keyFeaturesDescAr: "الوصف بالعربية",
    addFeature: "إضافة ميزة",
    productImages: "معرض المنتج",
    clickToUpload: "اسحب وأفلت أو انقر للتحميل",
    maxImages: "حتى 10 صور • JPG، PNG، WebP",
    uploadImage: "تحميل صورة",
    chooseFromGallery: "اختر من المعرض",
    featuredImage: "الصورة المميزة",
    setAsFeatured: "تعيين كمميزة",
    removeFeatured: "إزالة المميزة",
    video: "فيديو المنتج",
    addNew: "إضافة فيديو",
    file: "تحميل ملف فيديو",
    orExternalVideoUrl: " أدخل رابط فيديو خارجي",
    enterVideoUrl: "أدخل رابط فيديو YouTube أو Vimeo",
    videoThumbnail: "صورة مصغرة للفيديو",
    chooseImage: "اختر صورة",
    orAddFromUrl: "أو أضف من رابط",
    enterThumbnailUrl: "أدخل رابط صورة مصغرة",
    saveChanges: "حفظ التغييرات",
    cancel: "إلغاء",
  },
};

const convertCategoriesToSearchable = (
  categories: CategoryType[],
  parentId?: string,
): SearchableItem[] => {
  return categories.map((category) => ({
    id: category.id,
    label: category.title,
    subItems: category.subCategories
      ? convertCategoriesToSearchable(category.subCategories, category.id)
      : undefined,
    parentId,
    rawData: category,
  }));
};

const convertBrandsToSearchable = (brandsList: Brand[]): SearchableItem[] => {
  return brandsList.map((brand) => ({
    id: brand.id,
    label: brand.name,
    rawData: brand,
  }));
};


const findItemById = (
  items: SearchableItem[],
  id: string,
): SearchableItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.subItems) {
      const found = findItemById(item.subItems, id);
      if (found) return found;
    }
  }
  return null;
};

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
};

export const SetupStep = ({
  product,
  errors,
  onUpdate,
  onValidate,
  onBack,
}: SetupStepProps) => {
  const { language, direction } = useLanguage();
  const t = translations[language];

  const getText = useCallback(
    (en: string, ar: string) => ({
      en,
      ar,
    }),
    [],
  );

  // Memoize data conversions
  const categoryItems = useMemo(
    () => convertCategoriesToSearchable(allCategories),
    [allCategories],
  );

  const brandItems = useMemo(() => convertBrandsToSearchable(brands), [brands]);

  // State for description fields visibility
  const [showArabicDescription, setShowArabicDescription] = useState(false);
  
  // State for key features Arabic fields visibility
  const [showArabicKeyFeatures, setShowArabicKeyFeatures] = useState(false);

  // State for Key Features
  const [keyFeatures, setKeyFeatures] = useState<KeyFeature[]>([]);
  const [collapsedFeatureIds, setCollapsedFeatureIds] = useState<Set<string>>(new Set());

  // State for collapsible sections
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(false);
  const [isKeyFeaturesCollapsed, setIsKeyFeaturesCollapsed] = useState(false);

  const toggleFeatureCollapse = (featureId: string) => {
    setCollapsedFeatureIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  };

  // Video state
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars 
  const [videoFile, setVideoFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [externalVideoUrl, setExternalVideoUrl] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Featured image state
  const featuredImageIndex = (product as Record<string, unknown>)
    .featuredImageIndex as number | undefined;

  // Category selection state
  const [selectedMainCategory, setSelectedMainCategory] =
    useState<SearchableItem | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<SearchableItem | null>(null);
  const [selectedNestedSubcategory, setSelectedNestedSubcategory] =
    useState<SearchableItem | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeCategoryLevel, setActiveCategoryLevel] = useState<
    "main" | "sub" | "nested"
  >("main");

  // Initialize category selection
  useEffect(() => {
    if (product.category) {
      const categoryItem = findItemById(categoryItems, product.category.id);
      if (categoryItem) {
        if (categoryItem.parentId) {
          const parent = findItemById(categoryItems, categoryItem.parentId);
          if (parent?.parentId) {
            const grandParent = findItemById(categoryItems, parent.parentId);
            setSelectedMainCategory(grandParent);
            setSelectedSubcategory(parent);
            setSelectedNestedSubcategory(categoryItem);
            setActiveCategoryLevel("nested");
          } else {
            setSelectedMainCategory(parent);
            setSelectedSubcategory(categoryItem);
            setActiveCategoryLevel("sub");
          }
        } else {
          setSelectedMainCategory(categoryItem);
          setActiveCategoryLevel("main");
        }
      }
    }
  }, [product.category, categoryItems]);

  // Selected brand as SearchableItem
  const selectedBrandItem = useMemo(() => {
    if (!product.brand) return null;
    return {
      id: product.brand.id,
      label: product.brand.name,
      rawData: product.brand,
    };
  }, [product.brand]);


  // Category handlers
  const handleMainCategorySelect = useCallback(
    (item: SearchableItem | null) => {
      setSelectedMainCategory(item);
      setSelectedSubcategory(null);
      setSelectedNestedSubcategory(null);

      if (item?.subItems && item.subItems.length > 0) {
        setActiveCategoryLevel("sub");
      } else {
        setActiveCategoryLevel("main");
        onUpdate({
          category: item ? (item.rawData as CategoryType) : undefined,
        });
      }
    },
    [onUpdate],
  );

  const handleSubcategorySelect = useCallback(
    (item: SearchableItem | null) => {
      setSelectedSubcategory(item);
      setSelectedNestedSubcategory(null);

      if (item?.subItems && item.subItems.length > 0) {
        setActiveCategoryLevel("nested");
      } else {
        setActiveCategoryLevel("sub");
        onUpdate({
          category: item ? (item.rawData as CategoryType) : undefined,
        });
      }
    },
    [onUpdate],
  );

  const handleNestedSubcategorySelect = useCallback(
    (item: SearchableItem | null) => {
      setSelectedNestedSubcategory(item);
      onUpdate({ category: item ? (item.rawData as CategoryType) : undefined });
    },
    [onUpdate],
  );

  const getSubcategoryItems = useCallback(() => {
    if (!selectedMainCategory) return [];
    return selectedMainCategory.subItems || [];
  }, [selectedMainCategory]);

  const getNestedSubcategoryItems = useCallback(() => {
    if (!selectedSubcategory) return [];
    return selectedSubcategory.subItems || [];
  }, [selectedSubcategory]);

  const handleBrandSelect = useCallback(
    (item: SearchableItem | null) => {
      onUpdate({ brand: item ? (item.rawData as Brand) : undefined });
    },
    [onUpdate],
  );

  const handleProductTypeSelect = useCallback(
    (value: "physical" | "digital") => {
      onUpdate({ productType: value });
    },
    [onUpdate],
  );

  // Error helper
  const hasError = (field: string) => !!errors[field];

  // ============== HANDLERS FOR DESCRIPTION ==============
  const handleDescriptionChange = useCallback(
    (lang: "en" | "ar", value: string) => {
      onUpdate({
        description: {
          en: lang === "en" ? value : product.description?.en || "",
          ar: lang === "ar" ? value : product.description?.ar || "",
        },
      });
    },
    [onUpdate, product.description],
  );

  // ============== HANDLERS FOR KEY FEATURES ==============
  const handleAddKeyFeature = useCallback(() => {
    const newKeyFeature: KeyFeature = {
      id: Date.now().toString(),
      title: { en: "", ar: "" },
      description: { en: "", ar: "" },
    };
    setKeyFeatures([...keyFeatures, newKeyFeature]);
  }, [keyFeatures]);

  const handleUpdateKeyFeature = useCallback(
    (
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
    },
    [keyFeatures],
  );

  const handleRemoveKeyFeature = useCallback(
    (id: string) => {
      setKeyFeatures(keyFeatures.filter((feature) => feature.id !== id));
    },
    [keyFeatures],
  );


  const handleThumbnailFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setThumbnailFile(file);
      }
    },
    [],
  );

  const handleSaveVideo = useCallback(() => {
    const videoData = {
      externalVideoUrl: externalVideoUrl.trim() || undefined,
      thumbnailFile: thumbnailFile,
    };
    onUpdate({ videos: [videoData] } as Partial<ProductFormData>);
    setShowVideoDialog(false);
    setExternalVideoUrl("");
    setThumbnailFile(null);
  }, [externalVideoUrl, thumbnailFile, onUpdate]);

  const generateSku = useCallback(() => {
    const randomPart = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    return `PSKU_${randomPart}_${Date.now()}`;
  }, []);

  const handleGenerateSku = useCallback(() => {
    onUpdate({ sku: generateSku() });
  }, [onUpdate, generateSku]);

  const generatePermalink = useCallback(() => {
    const name = product.title?.en || product.title?.ar || "";
    if (name) {
      const slug = generateSlug(name);
      onUpdate({ slug });
    }
  }, [product.title, onUpdate]);

  useEffect(() => {
    if (!product.slug && (product.title?.en || product.title?.ar)) {
      generatePermalink();
    }
  }, [product.title, product.slug, generatePermalink]);

  const handleClearAll = useCallback(() => {
    onUpdate({
      category: undefined,
      brand: undefined,
      sku: "",
      slug: "",
    });
    setSelectedMainCategory(null);
    setSelectedSubcategory(null);
    setSelectedNestedSubcategory(null);
    setActiveCategoryLevel("main");
  }, [onUpdate]);

  // Validation state
  const isStepComplete = useMemo(() => {
    return !!(product.category && product.brand && product.sku && product.slug);
  }, [product]);

  // ============== RENDER DESCRIPTION SECTION ==============
  const renderDescriptionSection = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t.productDescription}</CardTitle>
            <CardDescription>
              Provide detailed product descriptions in both English and Arabic
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDescriptionCollapsed(!isDescriptionCollapsed)}
            className="gap-2"
          >
            {isDescriptionCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {!isDescriptionCollapsed && (
        <>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t.productDescriptionEn}
              </Label>
              <Textarea
                placeholder={t.enterDescriptionEn}
                value={product.description?.en || ""}
                onChange={(e) => handleDescriptionChange("en", e.target.value)}
                className={hasError("description.en") ? "border-destructive" : ""}
                dir="ltr"
                rows={6}
              />
              {hasError("description.en") && (
                <p className="text-sm text-destructive">
                  {errors["description.en"]}
                </p>
              )}
            </div>

            {showArabicDescription && <Separator />}

            {showArabicDescription && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t.productDescriptionAr}
                </Label>
                <Textarea
                  placeholder={t.enterDescriptionAr}
                  value={product.description?.ar || ""}
                  onChange={(e) => handleDescriptionChange("ar", e.target.value)}
                  className={hasError("description.ar") ? "border-destructive" : ""}
                  dir="rtl"
                  rows={6}
                />
                {hasError("description.ar") && (
                  <p className="text-sm text-destructive">
                    {errors["description.ar"]}
                  </p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArabicDescription(!showArabicDescription)}
              className="gap-2"
            >
              {showArabicDescription ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {showArabicDescription
                ? t.hideArabicDescription
                : t.addArabicDescription}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );

  // ============== RENDER KEY FEATURES SECTION ==============
  const renderKeyFeaturesSection = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t.keyFeatures}</CardTitle>
            <CardDescription>
              Add key features with titles and descriptions in both languages
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsKeyFeaturesCollapsed(!isKeyFeaturesCollapsed)}
            className="gap-2"
          >
            {isKeyFeaturesCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {!isKeyFeaturesCollapsed && (
        <>
          <CardContent className="space-y-6">
            {keyFeatures.map((feature, index) => {
              const isFeatureCollapsed = collapsedFeatureIds.has(feature.id);
              return (
                <div key={feature.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatureCollapse(feature.id)}
                        className="h-6 w-6 p-0"
                      >
                        {isFeatureCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </Button>
                      <h3 className="font-medium">Feature #{index + 1}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveKeyFeature(feature.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {!isFeatureCollapsed && (
                    <div className="space-y-4">
              {/* Title Row - English and Arabic side by side */}
              <div className={`grid gap-4 ${showArabicKeyFeatures ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t.keyFeaturesTitleEn}
                  </Label>
                  <Input
                    placeholder="Enter title in English"
                    value={feature.title.en}
                    onChange={(e) =>
                      handleUpdateKeyFeature(
                        feature.id,
                        "title",
                        "en",
                        e.target.value,
                      )
                    }
                    dir="ltr"
                  />
                </div>

                {showArabicKeyFeatures && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t.keyFeaturesTitleAr}
                    </Label>
                    <Input
                      placeholder="أدخل العنوان بالعربية"
                      value={feature.title.ar}
                      onChange={(e) =>
                        handleUpdateKeyFeature(
                          feature.id,
                          "title",
                          "ar",
                          e.target.value,
                        )
                      }
                      dir="rtl"
                    />
                  </div>
                )}
              </div>

              {/* Description Row - English and Arabic side by side */}
              <div className={`grid gap-4 ${showArabicKeyFeatures ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t.keyFeaturesDescEn}
                  </Label>
                  <Textarea
                    placeholder="Enter description in English"
                    value={feature.description.en}
                    onChange={(e) =>
                      handleUpdateKeyFeature(
                        feature.id,
                        "description",
                        "en",
                        e.target.value,
                      )
                    }
                    dir="ltr"
                    rows={3}
                  />
                </div>

                {showArabicKeyFeatures && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {t.keyFeaturesDescAr}
                    </Label>
                    <Textarea
                      placeholder="أدخل الوصف بالعربية"
                      value={feature.description.ar}
                      onChange={(e) =>
                        handleUpdateKeyFeature(
                          feature.id,
                          "description",
                          "ar",
                          e.target.value,
                        )
                      }
                      dir="rtl"
                      rows={3}
                    />
                  </div>
                )}
              </div>
                    </div>
                  )}
                </div>
              );
            })}

            {keyFeatures.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <Sparkles className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium">No key features added</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Add key features with titles and descriptions in both English and
                  Arabic
                </p>
                <Button onClick={handleAddKeyFeature}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t.addFeature}
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddKeyFeature}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {t.addFeature}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArabicKeyFeatures(!showArabicKeyFeatures)}
              className="gap-2"
            >
              {showArabicKeyFeatures ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {showArabicKeyFeatures
                ? t.hideArabicDescription
                : t.addArabicDescription}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );

  // ============== RENDER IMAGES SECTION ==============
  const renderImagesSection = () => {
    const allImages = product.images || [];
    const featuredImage = featuredImageIndex !== undefined && allImages[featuredImageIndex]
      ? allImages[featuredImageIndex]
      : null;
    const galleryImages = allImages.filter((_, index) => index !== featuredImageIndex);

    const handleFeaturedImageUpload = (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      const currentImages = product.images || [];
      
      if (featuredImageIndex !== undefined && currentImages[featuredImageIndex]) {
        // Replace existing featured image
        const updated = [...currentImages];
        updated[featuredImageIndex] = file;
        onUpdate({ 
          images: updated,
          featuredImageIndex: featuredImageIndex
        } as Partial<ProductFormData>);
      } else {
        // Add new featured image at the beginning
        const updated = [file, ...currentImages];
        onUpdate({ 
          images: updated.slice(0, 10),
          featuredImageIndex: 0
        } as Partial<ProductFormData>);
      }
    };

    const handleGalleryImagesUpload = (files: FileList | null) => {
      if (!files) return;
      const newFiles = Array.from(files);
      const currentImages = product.images || [];
      const updated = [...currentImages];
      newFiles.forEach((file) => {
        updated.push(file);
      });
      onUpdate({ images: updated.slice(0, 10) });
    };

    const handleRemoveFeaturedImage = () => {
      if (featuredImageIndex === undefined) return;
      const updated = allImages.filter((_, i) => i !== featuredImageIndex);
      onUpdate({ 
        images: updated,
        featuredImageIndex: undefined
      } as Partial<ProductFormData>);
    };

    const handleRemoveGalleryImage = (galleryIndex: number) => {
      // Find the actual index in the allImages array
      let actualIndex = 0;
      let galleryCount = 0;
      for (let i = 0; i < allImages.length; i++) {
        if (i !== featuredImageIndex) {
          if (galleryCount === galleryIndex) {
            actualIndex = i;
            break;
          }
          galleryCount++;
        }
      }
      
      const updated = allImages.filter((_, i) => i !== actualIndex);
      
      // Adjust featuredImageIndex if needed
      if (featuredImageIndex !== undefined) {
        if (actualIndex < featuredImageIndex) {
          onUpdate({
            images: updated,
            featuredImageIndex: featuredImageIndex - 1
          } as Partial<ProductFormData>);
        } else {
          onUpdate({ 
            images: updated,
            featuredImageIndex: featuredImageIndex
          } as Partial<ProductFormData>);
        }
      } else {
        onUpdate({ images: updated });
      }
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.productImages}</CardTitle>
          <CardDescription>{t.maxImages}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Featured Image - 1/3 */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">{t.featuredImage}</Label>
                <p className="mt-1 text-sm text-muted-foreground">Main product image</p>
              </div>

              {/* Choose from Gallery Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  // TODO: Open gallery selection modal/dialog
                  console.log("Choose from gallery clicked for featured image");
                }}
              >
                <ImageIcon className="h-4 w-4" />
                {t.chooseFromGallery}
              </Button>
              
              {featuredImage ? (
                <div className="group relative overflow-hidden rounded-lg border-2 border-primary ring-2 ring-primary/20">
                  <Image
                    src={typeof featuredImage === "string" ? featuredImage : URL.createObjectURL(featuredImage)}
                    alt="Featured product image"
                    width={400}
                    height={400}
                    className="aspect-square w-full object-cover"
                  />
                  <Badge className="absolute left-2 top-2">
                    <Star className="mr-1 h-3 w-3" />
                    {t.featuredImage}
                  </Badge>
                  <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-full items-center justify-center gap-2">
                      <label
                        htmlFor="featuredImageUpload"
                        className="cursor-pointer"
                      >
                        <Button variant="secondary" size="sm" asChild>
                          <span>Change</span>
                        </Button>
                        <input
                          id="featuredImageUpload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFeaturedImageUpload(e.target.files)}
                        />
                      </label>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveFeaturedImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="featuredImageUpload"
                  className="hover:bg-primary/5 group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center transition-colors hover:border-primary"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-primary/10 rounded-full p-3">
                      <ImageIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t.clickToUpload}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <span>{t.uploadImage}</span>
                    </Button>
                  </div>
                  <input
                    id="featuredImageUpload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFeaturedImageUpload(e.target.files)}
                  />
                </label>
              )}
            </div>

            {/* Gallery Images - 2/3 */}
            <div className="space-y-4 md:col-span-2">
              <div>
                <Label className="text-base font-medium">Gallery Images</Label>
                <p className="mt-1 text-sm text-muted-foreground">Additional product images</p>
              </div>

              {/* Choose from Gallery Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  // TODO: Open gallery selection modal/dialog
                  console.log("Choose from gallery clicked for gallery images");
                }}
              >
                <ImageIcon className="h-4 w-4" />
                {t.chooseFromGallery}
              </Button>

              {/* Upload Area for Gallery */}
              <label
                htmlFor="galleryImageUpload"
                className="hover:bg-primary/5 group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center transition-colors hover:border-primary"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-3">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{t.clickToUpload}</p>
                    <p className="mt-1 text-xs text-gray-500">{t.maxImages}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <span>{t.uploadImage}</span>
                  </Button>
                </div>
                <input
                  id="galleryImageUpload"
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleGalleryImagesUpload(e.target.files)}
                />
              </label>

              {/* Gallery Image Grid */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {galleryImages.map((img, galleryIndex) => {
                    return (
                      <div
                        key={`gallery-${galleryIndex}`}
                        className="group relative overflow-hidden rounded-lg border-2 border-gray-200"
                      >
                        <Image
                          src={typeof img === "string" ? img : URL.createObjectURL(img)}
                          alt={`Gallery image ${galleryIndex + 1}`}
                          width={200}
                          height={200}
                          className="aspect-square w-full object-cover"
                        />

                        {/* Actions Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex h-full items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveGalleryImage(galleryIndex)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Order Badge */}
                        <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                          {galleryIndex + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============== RENDER VIDEO SECTION ==============
  const renderVideoSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t.video}</span>
          <Dialog
            open={showVideoDialog}
            onOpenChange={setShowVideoDialog}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t.addNew}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t.video}</DialogTitle>
                <DialogDescription>
                  Add a product video from external URL
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* External URL */}
                <div className="space-y-2">
                  <Label>{t.orExternalVideoUrl}</Label>
                  <Input
                    placeholder={t.enterVideoUrl}
                    value={externalVideoUrl}
                    onChange={(e) => {
                      setExternalVideoUrl(e.target.value);
                    }}
                    dir="ltr"
                  />
                </div>

                <Separator />

                {/* Thumbnail */}
                <div className="space-y-2">
                  <Label>{t.videoThumbnail}</Label>
                  {thumbnailFile ? (
                    <div className="relative">
                      <Image
                        src={URL.createObjectURL(thumbnailFile)}
                        alt="Video thumbnail"
                        width={300}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => {
                          setThumbnailFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8">
                      <ImageIconType className="mb-4 h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {t.chooseImage}
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowVideoDialog(false)}
                >
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleSaveVideo}
                  disabled={!externalVideoUrl.trim()}
                >
                  {t.saveChanges}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
      dir={direction}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.setup}</h1>
          <p className="mt-2 text-muted-foreground">{t.setupDescription}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          {t.clearAll}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Product Information */}
        <div className="space-y-6 lg:col-span-2">
          {/* Product Name Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.productInfo}</CardTitle>
              <CardDescription>{t.setupDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Name Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nameEn">
                    {t.productNameEn} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nameEn"
                    placeholder={t.enterProductNameEn}
                    value={product.title?.en || ""}
                    onChange={(e) =>
                      onUpdate({
                        title: {
                          en: e.target.value,
                          ar: product.title?.ar || "",
                        },
                      })
                    }
                    className={errors["title.en"] ? "border-destructive" : ""}
                    dir="ltr"
                  />
                  {errors["title.en"] && (
                    <p className="text-sm text-destructive">
                      {errors["title.en"]}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameAr">
                    {t.productNameAr} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nameAr"
                    placeholder={t.enterProductNameAr}
                    value={product.title?.ar || ""}
                    onChange={(e) =>
                      onUpdate({
                        title: {
                          en: product.title?.en || "",
                          ar: e.target.value,
                        },
                      })
                    }
                    className={errors["title.ar"] ? "border-destructive" : ""}
                    dir="rtl"
                  />
                  {errors["title.ar"] && (
                    <p className="text-sm text-destructive">
                      {errors["title.ar"]}
                    </p>
                  )}
                </div>
              </div>

              {/* Permalink Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slug">
                    {t.permalink} <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generatePermalink}
                    className="gap-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {t.regenerate}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {t.baseUrl}
                  </span>
                  <Input
                    id="slug"
                    placeholder={t.permalinkPlaceholder}
                    value={product.slug || ""}
                    onChange={(e) => onUpdate({ slug: e.target.value })}
                    className={errors.slug ? "border-destructive" : ""}
                    dir="ltr"
                  />
                </div>
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t.permalinkHelp}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category & Brand Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.categoryInfo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-4">
                <Label>
                  {t.selectProductCategory}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t.mainCategories}
                    </Label>
                    <EnhancedDynamicSearchMenu
                      items={categoryItems}
                      selectedItem={selectedMainCategory}
                      onSelect={handleMainCategorySelect}
                      placeholder={getText(
                        t.selectProductCategory,
                        t.selectProductCategory,
                      )}
                      searchPlaceholder={getText(
                        t.searchCategories,
                        t.searchCategories,
                      )}
                      noResultsText={getText(
                        t.noCategoriesFound,
                        t.noCategoriesFound,
                      )}
                      error={errors.category}
                      showNavigation={false}
                      maxHeight={250}
                      disabled={false}
                      clearText={getText(t.clearSelection, t.clearSelection)}
                      backText={getText(t.back, t.back)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t.subcategories}
                    </Label>
                    <EnhancedDynamicSearchMenu
                      items={getSubcategoryItems()}
                      selectedItem={selectedSubcategory}
                      onSelect={handleSubcategorySelect}
                      placeholder={getText(
                        selectedMainCategory
                          ? t.selectProductSubcategory
                          : t.pleaseSelect,
                        selectedMainCategory
                          ? t.selectProductSubcategory
                          : t.pleaseSelect,
                      )}
                      searchPlaceholder={getText(
                        t.searchSubcategories,
                        t.searchSubcategories,
                      )}
                      noResultsText={getText(
                        t.noCategoriesFound,
                        t.noCategoriesFound,
                      )}
                      error={errors.category}
                      showNavigation={false}
                      maxHeight={250}
                      disabled={!selectedMainCategory}
                      clearText={getText(t.clearSelection, t.clearSelection)}
                      backText={getText(t.back, t.back)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      {t.nestedSubcategories}
                    </Label>
                    <EnhancedDynamicSearchMenu
                      items={getNestedSubcategoryItems()}
                      selectedItem={selectedNestedSubcategory}
                      onSelect={handleNestedSubcategorySelect}
                      placeholder={getText(
                        selectedSubcategory
                          ? t.selectProductSubcategory
                          : t.selectFromList,
                        selectedSubcategory
                          ? t.selectProductSubcategory
                          : t.selectFromList,
                      )}
                      searchPlaceholder={getText(
                        t.searchSubcategories,
                        t.searchSubcategories,
                      )}
                      noResultsText={getText(
                        t.noCategoriesFound,
                        t.noCategoriesFound,
                      )}
                      error={errors.category}
                      showNavigation={false}
                      maxHeight={250}
                      disabled={!selectedSubcategory}
                      clearText={getText(t.clearSelection, t.clearSelection)}
                      backText={getText(t.back, t.back)}
                    />
                  </div>
                </div>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>

              {/* Brand & Store */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    {t.selectBrand} <span className="text-red-500">*</span>
                  </Label>
                  <EnhancedDynamicSearchMenu
                    items={brandItems}
                    selectedItem={selectedBrandItem}
                    onSelect={handleBrandSelect}
                    placeholder={getText(t.selectBrand, t.selectBrand)}
                    searchPlaceholder={getText(t.searchBrand, t.searchBrand)}
                    noResultsText={getText(t.noBrandsFound, t.noBrandsFound)}
                    error={errors.brand}
                    showNavigation={false}
                    maxHeight={250}
                    clearText={getText(t.clearSelection, t.clearSelection)}
                    backText={getText(t.back, t.back)}
                  />
                  {errors.brand && (
                    <p className="text-sm text-destructive">{errors.brand}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    {t.productType} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={product.productType || "physical"}
                    onValueChange={(value: "physical" | "digital") =>
                      handleProductTypeSelect(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.pleaseSelect} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">
                        {t.physical}
                      </SelectItem>
                      <SelectItem value="digital">
                        {t.digitalProduct}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.productType && (
                    <p className="text-sm text-destructive">{errors.productType}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description and Key Features Sections */}
          <div className="space-y-6">
            {renderDescriptionSection()}
            {renderKeyFeaturesSection()}
          </div>

          {/* Media Sections */}
          <div className="space-y-6">
            {renderImagesSection()}
            {renderVideoSection()}
          </div>
        </div>

        {/* Right Column - SKU & Validation */}
        <div className="space-y-6">
          {/* SKU Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.productIdentity}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.sku && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.sku}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">
                    {t.manualSkuEntry} <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="sku"
                      placeholder={t.enterSku}
                      value={product.sku || ""}
                      onChange={(e) => onUpdate({ sku: e.target.value })}
                      className={errors.sku ? "border-destructive" : ""}
                      dir={direction}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onUpdate({ sku: product.sku || "" })}
                      disabled={!product.sku}
                    >
                      {t.submit}
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label>{t.or}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-24 w-full flex-col gap-2"
                    onClick={handleGenerateSku}
                  >
                    <Clipboard className="h-8 w-8 text-muted-foreground" />
                    <span className="font-medium">{t.generateSku}</span>
                  </Button>
                </div>

                {product.sku && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-lg border border-green-200 bg-green-50 p-4"
                  >
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">{t.skuGenerated}</span>
                    </div>
                    <code className="mt-2 block rounded bg-green-100 px-3 py-2 font-mono text-sm">
                      {product.sku}
                    </code>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Validation Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.validationInfo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[
                  {
                    label: t.productNameEn,
                    value: !!product.title?.en,
                    error: errors["title.en"],
                  },
                  {
                    label: t.productNameAr,
                    value: !!product.title?.ar,
                    error: errors["title.ar"],
                  },
                  {
                    label: t.permalink,
                    value: !!product.slug,
                    error: errors.slug,
                  },
                  {
                    label: t.selectProductCategory,
                    value: !!product.category,
                    error: errors.category,
                  },
                  {
                    label: t.selectBrand,
                    value: !!product.brand,
                    error: errors.brand,
                  },
                  {
                    label: t.productIdentity,
                    value: !!product.sku,
                    error: errors.sku,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{item.label}</span>
                    <Badge
                      variant={item.value ? "default" : "outline"}
                      className={
                        item.value
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : item.error
                            ? "bg-red-100 text-red-800 hover:bg-red-100"
                            : ""
                      }
                    >
                      {item.value ? "✓" : "✗"}
                    </Badge>
                  </div>
                ))}
              </div>

              <Separator />

              <Button
                type="button"
                className="w-full gap-2"
                size="lg"
                onClick={onValidate}
                disabled={!isStepComplete}
              >
                {t.nextDetails}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onBack}
              >
                {t.back}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
