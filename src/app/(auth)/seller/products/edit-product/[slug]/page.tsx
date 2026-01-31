"use client";

import { useState, useCallback, useEffect, use } from "react";
import {
  Image as ImageIcon,
  X,
  Check,
  Save,
  Eye,
  Info,
  AlertCircle,
} from "lucide-react";
import { Brand, MultiCategory } from "@/types";
import Image from "next/image";
import DynamicButton from "@/components/UI/Buttons/DynamicButton";
import { products } from "@/constants/products"; // Assuming you have a products constant
import { useLanguage } from "@/contexts/LanguageContext";

type PricingMethod = "manual" | "auto";

type Specification = {
  key: string;
  value: string;
};

type ProductDetails = {
  id: string;
  category?: MultiCategory;
  brand?: Brand;
  sku?: string;
  pricingMethod: PricingMethod;
  del_price?: number;
  price?: number;
  saleStart?: string;
  saleEnd?: string;
  title?: string;
  description?: string;
  features?: string[];
  deliveryTime?: string;
  highlights?: string[];
  weightKg?: number;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  specifications?: Specification[];
  images?: File[];
  existingImages?: string[];
};

interface ValidationErrors {
  [key: string]: string;
}

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
const colorOptions = [
  "Red",
  "Blue",
  "Green",
  "Black",
  "White",
  "Yellow",
  "Purple",
  "Pink",
  "Orange",
  "Gray",
] as const;

const HealthStatus = ({ product }: { product: ProductDetails }) => {
  const { language } = useLanguage();

  const translations = {
    title: { en: "Health", ar: "الحالة" },
    summary: {
      allValid: { en: "All checks passed", ar: "تم اجتياز جميع الفحوصات" },
      notValid: {
        en: "Fix the following to go online",
        ar: "يرجى تصحيح التالي للنشر",
      },
    },
    labels: {
      invoicing: { en: "Invoicing", ar: "الفوترة" },
      price: { en: "Price", ar: "السعر" },
      psku: { en: "PSKU Active", ar: "رمز المنتج مفعل" },
      stock: { en: "Stock Check", ar: "الكمية المتوفرة" },
      product: { en: "Product Active", ar: "المنتج مفعل" },
    },
    errors: {
      invalidInvoicing: { en: "Invalid invoicing", ar: "الفوترة غير صالحة" },
      invalidPrice: { en: "Price is invalid", ar: "السعر غير صالح" },
      pskuNotActive: { en: "PSKU not active", ar: "رمز المنتج غير مفعل" },
      noStock: { en: "Stock not available", ar: "لا يوجد كمية متوفرة" },
      productInactive: { en: "Product not active", ar: "المنتج غير مفعل" },
    },
    learnMore: { en: "Learn more", ar: "اعرف المزيد" },
  };

  const t = (key: { en: string; ar: string }): string => key[language];

  const invoicingValid = true;
  const priceValid = product.price !== undefined && product.price >= 0;
  const pskuActive = !!product.sku && product.sku.length >= 3;
  const stockAvailable = product.stock !== undefined && product.stock > 0;
  const productActive =
    !!product.title &&
    !!product.description &&
    (product.images?.length || product.existingImages?.length || 0) > 0;

  const allValid =
    invoicingValid &&
    priceValid &&
    pskuActive &&
    stockAvailable &&
    productActive;

  const renderCheck = (valid: boolean) =>
    valid ? (
      <Check className="mr-2 h-5 w-5 text-green-500" />
    ) : (
      <X className="mr-2 h-5 w-5 text-red-500" />
    );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t(translations.title)}</h2>
      </div>

      <div className="my-4">
        <div
          className={`mb-2 rounded-md p-3 ${allValid ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}
        >
          <div className="flex items-center gap-2">
            {allValid ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <AlertCircle className="mr-2 h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {t(
                allValid
                  ? translations.summary.allValid
                  : translations.summary.notValid,
              )}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {[
            {
              valid: invoicingValid,
              label: translations.labels.invoicing,
              error: translations.errors.invalidInvoicing,
              showError: !invoicingValid,
            },
            {
              valid: priceValid,
              label: translations.labels.price,
              error: translations.errors.invalidPrice,
              showError: !priceValid,
            },
            {
              valid: pskuActive,
              label: translations.labels.psku,
              error: translations.errors.pskuNotActive,
              showError: !pskuActive,
            },
            {
              valid: stockAvailable,
              label: translations.labels.stock,
              error: translations.errors.noStock,
              showError: !stockAvailable,
            },
            {
              valid: productActive,
              label: translations.labels.product,
              error: translations.errors.productInactive,
              showError: !productActive,
            },
          ].map(({ valid, label, error, showError }, i) => (
            <div
              key={i}
              className={`rounded-md p-3 ${valid ? "bg-gray-50" : "bg-red-50"}`}
            >
              <div className="flex items-center gap-2">
                {renderCheck(valid)}
                <span className="font-medium">{t(label)}</span>
              </div>
              {showError && (
                <div className="mt-1 flex items-center gap-3 text-xs">
                  <span>{t(error)}</span>
                  <button
                    type="button"
                    className="ml-2 flex items-center gap-1 text-blue-500 hover:text-blue-700"
                  >
                    <Info className="mr-1 h-3 w-3" />
                    {t(translations.learnMore)}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductEditPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const [product, setProduct] = useState<ProductDetails>({
    id: "",
    pricingMethod: "manual",
    specifications: [],
    images: [],
    features: [],
    highlights: [],
    sizes: [],
    colors: [],
  });
  const { language } = useLanguage();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [newSpec, setNewSpec] = useState<Specification>({ key: "", value: "" });
  const [newFeature, setNewFeature] = useState("");
  const [newHighlight, setNewHighlight] = useState("");
  const { slug } = use(params);

  // Translation dictionary
  const translations = {
    en: {
      editProduct: "Edit Product",
      viewOnStore: "View on store",
      saveProduct: "Save Product",
      productDetails: "Product Details",
      productTitle: "Product Title",
      enterProductTitle: "Enter product title",
      productDescription: "Product Description",
      enterDescription: "Enter detailed product description...",
      keyFeatures: "Key Features",
      addFeature: "Add a feature",
      add: "Add",
      remove: "Remove",
      deliveryInfo: "Delivery Information",
      deliveryTime: "Delivery Time",
      deliveryPlaceholder: "e.g. 3-5 business days",
      productHighlights: "Product Highlights",
      addHighlight: "Add a highlight",
      pricing: "Pricing",
      price: "Price ($)",
      salePrice: "Sale Price ($) (Optional)",
      saleStart: "Sale Start Date (Optional)",
      saleEnd: "Sale End Date (Optional)",
      inventoryWeight: "Inventory & Weight",
      stockQuantity: "Stock Quantity",
      weight: "Weight (kg)",
      sizes: "Sizes",
      colors: "Colors",
      specifications: "Specifications",
      specKeyPlaceholder: "Key (e.g., Material)",
      specValuePlaceholder: "Value (e.g., Cotton)",
      productImages: "Product Images",
      clickToUpload: "Click to upload",
      maxImages: "Max 10 images • JPG, PNG, WebP",
      notFoundSku: "Not found SKU",
      product: "Product",
      category: "category",
      titleRequired: "Product title is required",
      titleTooShort: "Title must be at least 3 characters",
      priceRequired: "Price is required",
      priceInvalid: "Price must be a positive number",
      salePriceRequired: "Sale price is required when sale dates are set",
      salePriceInvalid: "Sale price must be a positive number",
      salePriceTooHigh: "Sale price must be less than regular price",
      saleEndRequired: "Sale end date is required when sale start is set",
      saleEndInvalid: "Sale end date must be after start date",
      descriptionRequired: "Description is required",
      descriptionTooShort: "Description must be at least 20 characters",
      weightInvalid: "Weight must be a positive number",
      stockInvalid: "Stock must be a positive number",
      productUpdated: "Product updated successfully!",
    },
    ar: {
      editProduct: "تعديل المنتج",
      viewOnStore: "عرض في المتجر",
      saveProduct: "حفظ المنتج",
      productDetails: "تفاصيل المنتج",
      productTitle: "عنوان المنتج",
      enterProductTitle: "أدخل عنوان المنتج",
      productDescription: "وصف المنتج",
      enterDescription: "أدخل وصف مفصل للمنتج...",
      keyFeatures: "الميزات الرئيسية",
      addFeature: "أضف ميزة",
      add: "إضافة",
      remove: "إزالة",
      deliveryInfo: "معلومات التوصيل",
      deliveryTime: "وقت التوصيل",
      deliveryPlaceholder: "مثال: 3-5 أيام عمل",
      productHighlights: "أبرز ميزات المنتج",
      addHighlight: "أضف نقطة بارزة",
      pricing: "التسعير",
      price: "السعر ($)",
      salePrice: "سعر البيع ($) (اختياري)",
      saleStart: "تاريخ بدء البيع (اختياري)",
      saleEnd: "تاريخ انتهاء البيع (اختياري)",
      inventoryWeight: "المخزون والوزن",
      stockQuantity: "الكمية المتاحة",
      weight: "الوزن (كجم)",
      sizes: "المقاسات",
      colors: "الألوان",
      specifications: "المواصفات",
      specKeyPlaceholder: "المفتاح (مثال: المادة)",
      specValuePlaceholder: "القيمة (مثال: قطن)",
      productImages: "صور المنتج",
      clickToUpload: "انقر للتحميل",
      maxImages: "10 صور كحد أقصى • JPG, PNG, WebP",
      notFoundSku: "لم يتم العثور على SKU",
      product: "المنتج",
      category: "الفئة",
      titleRequired: "عنوان المنتج مطلوب",
      titleTooShort: "يجب أن يكون العنوان 3 أحرف على الأقل",
      priceRequired: "السعر مطلوب",
      priceInvalid: "يجب أن يكون السعر رقمًا موجبًا",
      salePriceRequired: "سعر البيع مطلوب عند تعيين تواريخ البيع",
      salePriceInvalid: "يجب أن يكون سعر البيع رقمًا موجبًا",
      salePriceTooHigh: "يجب أن يكون سعر البيع أقل من السعر العادي",
      saleEndRequired: "تاريخ انتهاء البيع مطلوب عند تعيين تاريخ البدء",
      saleEndInvalid: "يجب أن يكون تاريخ انتهاء البيع بعد تاريخ البدء",
      descriptionRequired: "الوصف مطلوب",
      descriptionTooShort: "يجب أن يكون الوصف 20 حرفًا على الأقل",
      weightInvalid: "يجب أن يكون الوزن رقمًا موجبًا",
      stockInvalid: "يجب أن يكون المخزون رقمًا موجبًا",
      productUpdated: "تم تحديث المنتج بنجاح!",
    },
  };

  const t = translations[language];

  // Find the product by slug from constants
  useEffect(() => {
    const foundProduct = products.find((p) => p.id === slug);
    if (foundProduct) {
      // Convert the product to our editable format
      const editableProduct: ProductDetails = {
        id: foundProduct.id,
        sku: foundProduct.sku,
        title: foundProduct.title[language],
        price: foundProduct.price,
        del_price: foundProduct.del_price,
        description: foundProduct.description[language],
        features: foundProduct.features[language],
        highlights: foundProduct.highlights[language],
        deliveryTime: foundProduct.deliveryTime?.[language],
        weightKg: foundProduct.weightKg,
        stock: foundProduct.stock,
        sizes: foundProduct.sizes?.map((s) => s),
        colors: foundProduct.colors?.[language]?.map((c) => c),
        specifications: foundProduct.specifications?.map((s) => ({
          key: s.label[language],
          value: s.content[language],
        })),
        // You'll need to map other fields as needed
        pricingMethod: "manual",
        existingImages: foundProduct.images || [], // You'll need to handle images appropriately
        images: [],
        brand: foundProduct.brand,
        category: foundProduct.category as MultiCategory,
      };
      setProduct(editableProduct);
    }
  }, [slug]);

  const validateDetails = (product: ProductDetails): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!product.title) {
      errors.title = "Product title is required";
    } else if (product.title.length < 3) {
      errors.title = "Title must be at least 3 characters";
    }

    if (product.del_price === undefined || product.del_price === null) {
      errors.del_price = "del price is required";
    } else if (
      typeof product.del_price !== "number" ||
      isNaN(product.del_price) ||
      product.del_price < 0
    ) {
      errors.del_price = "del price must be a positive number";
    }

    if (product.saleStart) {
      if (product.price === undefined || product.price === null) {
        errors.price = "Sale price is required when sale dates are set";
      } else if (
        typeof product.price !== "number" ||
        isNaN(product.price) ||
        product.price < 0
      ) {
        errors.price = "Sale price must be a positive number";
      } else if (product.price >= (product.price || 0)) {
        errors.price = "Sale price must be less than regular price";
      }

      if (!product.saleEnd) {
        errors.saleEnd = "Sale end date is required when sale start is set";
      } else if (product.saleStart > product.saleEnd) {
        errors.saleEnd = "Sale end date must be after start date";
      }
    }

    if (!product.description) {
      errors.description = "Description is required";
    } else if (product.description.length < 20) {
      errors.description = "Description must be at least 20 characters";
    }

    if (product.weightKg !== undefined && product.weightKg < 0) {
      errors.weightKg = "Weight must be a positive number";
    }

    if (product.stock !== undefined && product.stock < 0) {
      errors.stock = "Stock must be a positive number";
    }

    return errors;
  };

  const handleImageUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newImages = Array.from(files).slice(
        0,
        10 -
          (product.images?.length || 0) -
          (product.existingImages?.length || 0),
      );
      setProduct((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImages],
      }));
    },
    [product.images, product.existingImages],
  );

  const handleRemoveImage = useCallback(
    (index: number, isExisting: boolean) => {
      if (isExisting) {
        setProduct((prev) => ({
          ...prev,
          existingImages: prev.existingImages?.filter((_, i) => i !== index),
        }));
      } else {
        setProduct((prev) => ({
          ...prev,
          images: prev.images?.filter((_, i) => i !== index),
        }));
      }
    },
    [],
  );
  const handleAddSpecification = useCallback(() => {
    if (newSpec.key && newSpec.value) {
      setProduct((prev) => ({
        ...prev,
        specifications: [...(prev.specifications || []), newSpec],
      }));
      setNewSpec({ key: "", value: "" });
    }
  }, [newSpec]);

  const handleRemoveSpecification = useCallback((index: number) => {
    setProduct((prev) => ({
      ...prev,
      specifications: prev.specifications?.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddFeature = useCallback(() => {
    if (newFeature.trim()) {
      setProduct((prev) => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()],
      }));
      setNewFeature("");
    }
  }, [newFeature]);

  const handleRemoveFeature = useCallback((index: number) => {
    setProduct((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index),
    }));
  }, []);

  const handleAddHighlight = useCallback(() => {
    if (newHighlight.trim()) {
      setProduct((prev) => ({
        ...prev,
        highlights: [...(prev.highlights || []), newHighlight.trim()],
      }));
      setNewHighlight("");
    }
  }, [newHighlight]);

  const handleRemoveHighlight = useCallback((index: number) => {
    setProduct((prev) => ({
      ...prev,
      highlights: prev.highlights?.filter((_, i) => i !== index),
    }));
  }, []);

  const toggleSize = useCallback((size: string) => {
    setProduct((prev) => {
      const newSizes = prev.sizes?.includes(size)
        ? prev.sizes?.filter((s) => s !== size)
        : [...(prev.sizes || []), size];
      return { ...prev, sizes: newSizes };
    });
  }, []);

  const toggleColor = useCallback((color: string) => {
    setProduct((prev) => {
      const newColors = prev.colors?.includes(color)
        ? prev.colors?.filter((c) => c !== color)
        : [...(prev.colors || []), color];
      return { ...prev, colors: newColors };
    });
  }, []);

  const handleSave = useCallback(() => {
    const currentErrors = validateDetails(product);
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length === 0) {
      console.log("Product updated:", product);
      alert(t.productUpdated);
    }
  }, [product, t.productUpdated]);

  return (
    <div className={language === "ar" ? "text-right" : "text-left"}>
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">{t.editProduct}</h1>

      <div className="mb-4 flex flex-col justify-between gap-3 rounded-lg border border-gray-200 bg-white p-2 lg:flex-row">
        <div className="flex gap-2">
          <div>
            {product.existingImages?.[0] ? (
              <Image
                src={product.existingImages[0]}
                alt="Product image"
                width={100}
                height={100}
                className="h-16 w-16 rounded-md object-cover"
              />
            ) : product.images?.[0] ? (
              <Image
                src={URL.createObjectURL(product.images[0])}
                alt="Product image"
                width={100}
                height={100}
                className="h-16 w-16 rounded-md object-cover"
              />
            ) : (
              <Image
                src={"/images/placeholder.jpg"}
                alt="Product image"
                width={100}
                height={100}
                className="h-16 w-16 rounded-md object-cover"
              />
            )}
          </div>
          <div>
            <h2 className="font-semibold">
              {product.brand?.name[language] || t.product}
            </h2>
            <span className="text-sm">
              {product.category?.title[language] || t.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DynamicButton
            variant="outlineSussces"
            size="sm"
            icon={<Eye size={15} />}
            label={t.viewOnStore}
          />
          <DynamicButton
            variant="success"
            size="sm"
            icon={<Save size={15} />}
            onClick={handleSave}
            label={t.saveProduct}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-9">
        <div className="col-span-1 rounded-xl border border-gray-200 bg-white p-6 lg:col-span-6">
          <h1 className="mb-4 text-2xl font-bold">{t.productDetails}</h1>
          <div className="mb-6 rounded-md border border-gray-200 p-3">
            <div className="font-mono text-sm font-medium">
              {product.sku ?? t.notFoundSku}
            </div>
          </div>

          <h2 className="mb-4 text-xl font-semibold">{t.productTitle}</h2>
          {errors.title && (
            <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
              {errors.title}
            </div>
          )}
          <input
            type="text"
            className="mb-6 w-full rounded-md border border-gray-300 p-3 focus:outline-none"
            placeholder={t.enterProductTitle}
            value={product.title || ""}
            onChange={(e) => setProduct({ ...product, title: e.target.value })}
            aria-label={t.productTitle}
            dir={language === "ar" ? "rtl" : "ltr"}
          />

          <h2 className="mb-4 text-xl font-semibold">{t.productDescription}</h2>
          {errors.description && (
            <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
              {errors.description}
            </div>
          )}
          <textarea
            className="mb-6 w-full resize-none rounded-md border border-gray-300 p-3 focus:outline-none"
            rows={5}
            placeholder={t.enterDescription}
            value={product.description || ""}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            aria-label={t.productDescription}
            dir={language === "ar" ? "rtl" : "ltr"}
          />

          <h2 className="mb-4 text-xl font-semibold">{t.keyFeatures}</h2>
          <div className="mb-6">
            <div className="mb-2 flex">
              <input
                type="text"
                className={`flex-grow border border-gray-300 p-2 focus:outline-none ${language === "ar" ? "rounded-r-md" : "rounded-l-md"}`}
                placeholder={t.addFeature}
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                aria-label={t.addFeature}
                dir={language === "ar" ? "rtl" : "ltr"}
              />
              <button
                type="button"
                className={`rounded-md bg-green-600 px-3 text-white hover:bg-green-700 ${language === "ar" ? "rounded-l-md" : "rounded-r-md"}`}
                onClick={handleAddFeature}
                disabled={!newFeature.trim()}
              >
                {t.add}
              </button>
            </div>
            {product.features?.map((feature, index) => (
              <div
                key={index}
                className="mb-2 flex items-center rounded-md border border-gray-200 p-2"
              >
                <div className="flex-grow">{feature}</div>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveFeature(index)}
                  aria-label={t.remove}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <h2 className="mb-4 text-xl font-semibold">{t.deliveryInfo}</h2>
          <div className="mb-6">
            <label htmlFor="deliveryTime" className="mb-1 block text-gray-700">
              {t.deliveryTime}
            </label>
            <input
              type="text"
              id="deliveryTime"
              className="focus:ring-500 w-full rounded-md border border-gray-300 p-2 focus:outline-none"
              placeholder={t.deliveryPlaceholder}
              value={product.deliveryTime || ""}
              onChange={(e) =>
                setProduct({ ...product, deliveryTime: e.target.value })
              }
              aria-label={t.deliveryTime}
              dir={language === "ar" ? "rtl" : "ltr"}
            />
          </div>

          <h2 className="mb-4 text-xl font-semibold">{t.productHighlights}</h2>
          <div className="mb-6">
            <div className="mb-2 flex">
              <input
                type="text"
                className={`flex-grow border border-gray-300 p-2 focus:outline-none ${language === "ar" ? "rounded-r-md" : "rounded-l-md"}`}
                placeholder={t.addHighlight}
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                aria-label={t.addHighlight}
                dir={language === "ar" ? "rtl" : "ltr"}
              />
              <button
                type="button"
                className={`rounded-md bg-green-600 px-3 text-white hover:bg-green-700 ${language === "ar" ? "rounded-l-md" : "rounded-r-md"}`}
                onClick={handleAddHighlight}
                disabled={!newHighlight.trim()}
              >
                {t.add}
              </button>
            </div>
            {product.highlights?.map((highlight, index) => (
              <div
                key={index}
                className="mb-2 flex items-center rounded-md border border-gray-200 p-2"
              >
                <div className="flex-grow">{highlight}</div>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveHighlight(index)}
                  aria-label={t.remove}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <h2 className="mb-4 text-xl font-semibold">{t.pricing}</h2>
          {errors.price && (
            <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
              {errors.price}
            </div>
          )}
          {errors.salePrice && (
            <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
              {errors.salePrice}
            </div>
          )}
          {errors.saleEnd && (
            <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
              {errors.saleEnd}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="price" className="mb-1 block text-gray-700">
              {t.price}
            </label>
            <input
              type="number"
              id="price"
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none"
              placeholder="e.g. 99.99"
              value={product.del_price ?? ""}
              onChange={(e) =>
                setProduct({
                  ...product,
                  del_price: parseFloat(e.target.value),
                })
              }
              step="0.01"
              aria-label={t.price}
              dir={language === "ar" ? "rtl" : "ltr"}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="salePrice" className="mb-1 block text-gray-700">
              {t.salePrice}
            </label>
            <input
              type="number"
              id="salePrice"
              className="w-full rounded-md border border-gray-300 p-2 focus:outline-none"
              placeholder="e.g. 79.99"
              value={product.price ?? ""}
              onChange={(e) =>
                setProduct({
                  ...product,
                  price: parseFloat(e.target.value),
                })
              }
              step="0.01"
              aria-label={t.salePrice}
              dir={language === "ar" ? "rtl" : "ltr"}
            />
          </div>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="saleStart" className="mb-1 block text-gray-700">
                {t.saleStart}
              </label>
              <input
                type="date"
                id="saleStart"
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none"
                value={product.saleStart || ""}
                onChange={(e) =>
                  setProduct({ ...product, saleStart: e.target.value })
                }
                aria-label={t.saleStart}
              />
            </div>
            <div>
              <label htmlFor="saleEnd" className="mb-1 block text-gray-700">
                {t.saleEnd}
              </label>
              <input
                type="date"
                id="saleEnd"
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none"
                value={product.saleEnd || ""}
                onChange={(e) =>
                  setProduct({ ...product, saleEnd: e.target.value })
                }
                aria-label={t.saleEnd}
              />
            </div>
          </div>

          <h2 className="mb-4 text-xl font-semibold">{t.inventoryWeight}</h2>
          {errors.stock && (
            <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
              {errors.stock}
            </div>
          )}
          {errors.weightKg && (
            <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
              {errors.weightKg}
            </div>
          )}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stock" className="mb-1 block text-gray-700">
                {t.stockQuantity}
              </label>
              <input
                type="number"
                id="stock"
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none"
                placeholder="e.g. 100"
                value={product.stock ?? ""}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    stock: parseInt(e.target.value, 10),
                  })
                }
                aria-label={t.stockQuantity}
                dir={language === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <label htmlFor="weightKg" className="mb-1 block text-gray-700">
                {t.weight}
              </label>
              <input
                type="number"
                id="weightKg"
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none"
                placeholder="e.g. 1.5"
                value={product.weightKg ?? ""}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    weightKg: parseFloat(e.target.value),
                  })
                }
                step="0.01"
                aria-label={t.weight}
                dir={language === "ar" ? "rtl" : "ltr"}
              />
            </div>
          </div>

          <h2 className="mb-4 text-xl font-semibold">{t.sizes}</h2>
          <div className="mb-6 flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button
                type="button"
                key={size}
                className={`rounded-md px-3 py-1 text-sm font-medium ${
                  product.sizes?.includes(size)
                    ? "bg-green-600 text-white"
                    : "border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => toggleSize(size)}
                aria-pressed={product.sizes?.includes(size)}
              >
                {size}
              </button>
            ))}
          </div>

          <h2 className="mb-4 text-xl font-semibold">{t.colors}</h2>
          <div className="mb-6 flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                type="button"
                key={color}
                style={{ backgroundColor: color }}
                className={`relative h-8 w-8 overflow-hidden rounded-full border border-gray-300 px-3 py-1 text-sm font-medium text-white sm:h-10 sm:w-10`}
                onClick={() => toggleColor(color)}
                aria-pressed={product.colors?.includes(color)}
              >
                {product.colors?.includes(color) && (
                  <span className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/25">
                    <Check size={15} />
                  </span>
                )}
              </button>
            ))}
          </div>

          <h2 className="mb-4 text-xl font-semibold">{t.specifications}</h2>
          <div className="mb-6">
            <div className="mb-2 flex flex-wrap gap-2">
              <input
                type="text"
                className={`flex-grow rounded-md border border-gray-300 p-2 focus:outline-none ${language === "ar" ? "rounded-r-md" : "rounded-l-md"}`}
                placeholder={t.specKeyPlaceholder}
                value={newSpec.key}
                onChange={(e) =>
                  setNewSpec({ ...newSpec, key: e.target.value })
                }
                aria-label={t.specKeyPlaceholder}
                dir={language === "ar" ? "rtl" : "ltr"}
              />
              <input
                type="text"
                className={`flex-grow rounded-md border border-gray-300 p-2 focus:outline-none ${language === "ar" ? "rounded-l-md" : "rounded-r-md"}`}
                placeholder={t.specValuePlaceholder}
                value={newSpec.value}
                onChange={(e) =>
                  setNewSpec({ ...newSpec, value: e.target.value })
                }
                aria-label={t.specValuePlaceholder}
                dir={language === "ar" ? "rtl" : "ltr"}
              />
              <button
                type="button"
                className="rounded-md bg-green-600 px-3 text-white hover:bg-green-700"
                onClick={handleAddSpecification}
                disabled={!newSpec.key || !newSpec.value}
              >
                {t.add}
              </button>
            </div>
            {product.specifications?.map((spec, index) => (
              <div
                key={index}
                className="mb-2 flex items-center rounded-md border border-gray-200 p-2"
              >
                <div className="flex-grow">
                  <strong>{spec.key}:</strong> {spec.value}
                </div>
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveSpecification(index)}
                  aria-label={t.remove}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <h2 className="mb-4 text-xl font-semibold">{t.productImages}</h2>
          {errors.images && (
            <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
              {errors.images}
            </div>
          )}
          <div className="group mb-6 rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center transition-colors hover:border-green-500 hover:bg-green-50">
            <input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files)}
              aria-label={t.productImages}
            />
            <label
              htmlFor="image-upload"
              className="flex cursor-pointer flex-col items-center justify-center text-gray-500 transition hover:text-green-600"
            >
              <ImageIcon
                className="mb-3 text-gray-400 transition-transform group-hover:scale-110"
                size={32}
              />
              <p className="text-base font-medium">{t.clickToUpload}</p>
              <span className="text-sm text-gray-400">{t.maxImages}</span>
            </label>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {product.existingImages?.map((imageSrc, index) => (
              <div key={`existing-${index}`} className="relative">
                <Image
                  src={imageSrc}
                  alt={`Product existing image ${index + 1}`}
                  width={150}
                  height={150}
                  className="h-full w-full rounded-md object-cover"
                />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1 text-white hover:bg-opacity-75"
                  onClick={() => handleRemoveImage(index, true)}
                  aria-label={`${t.remove} ${index + 1}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {product.images?.map((file, index) => (
              <div key={`new-${index}`} className="relative">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`New product image ${index + 1}`}
                  width={150}
                  height={150}
                  className="h-full w-full rounded-md object-cover"
                />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded-full bg-black bg-opacity-50 p-1 text-white hover:bg-opacity-75"
                  onClick={() => handleRemoveImage(index, false)}
                  aria-label={`${t.remove} ${index + 1}`}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-1 h-fit rounded-xl border border-gray-200 bg-white p-3 lg:col-span-3">
          <HealthStatus product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductEditPage;
