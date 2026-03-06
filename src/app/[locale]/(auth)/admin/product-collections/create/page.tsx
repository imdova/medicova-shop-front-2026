"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, CheckCircle2, ImageIcon, Search, Upload, X } from "lucide-react";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Textarea } from "@/components/shared/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shared/form";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Switch } from "@/components/shared/switch";
import Image from "next/image";
import { Product } from "@/types/product";
import { products as allProducts } from "@/data";

function formatCurrency(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ---------------- Schema & Types ----------------
const messages = {
  name_en_required: {
    en: "Name in English is required",
    ar: "الاسم بالإنجليزية مطلوب",
  },
  name_ar_required: {
    en: "Name in Arabic is required",
    ar: "الاسم بالعربية مطلوب",
  },
  slug_required: {
    en: "Slug is required",
    ar: "الرابط مطلوب",
  },
  slug_invalid: {
    en: "Slug must contain only lowercase letters, numbers, and hyphens",
    ar: "يجب أن يحتوي الرابط على أحرف صغيرة وأرقام وشرطات فقط",
  },
};

const collectionSchema = z.object({
  name: z.object({
    en: z.string().min(1, messages.name_en_required.en),
    ar: z.string().min(1, messages.name_ar_required.ar),
  }),
  slug: z
    .string()
    .min(1, messages.slug_required.en)
    .regex(/^[a-z0-9-]+$/, messages.slug_invalid.en),
  description: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }),
  short_description: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }),
  status: z.enum(["published", "draft", "pending"]),
  is_featured: z.boolean(),
  image: z.string().optional(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

// ---------------- Component ----------------
export default function CreateCollectionPage() {
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const [productQuery, setProductQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      slug: "",
      description: { en: "", ar: "" },
      short_description: { en: "", ar: "" },
      status: "published",
      is_featured: false,
      image: "",
    },
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Simulate image upload
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert(
        locale === "en"
          ? "Please select an image file"
          : "يرجى اختيار ملف صورة",
      );
      return;
    }

    setIsUploading(true);

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      form.setValue("image", imageUrl);

      // In a real app, you would upload to your server here:
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // setSelectedImage(data.imageUrl);
      // form.setValue("image", data.imageUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(locale === "en" ? "Upload failed" : "فشل التحميل");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle URL image
  const handleImageSelect = (imageUrl: string) => {
    if (imageUrl.trim()) {
      setSelectedImage(imageUrl);
      form.setValue("image", imageUrl);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setSelectedImage("");
    form.setValue("image", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (lang: "en" | "ar", value: string) => {
    form.setValue(`name.${lang}`, value);

    // Auto-generate slug from English name
    if (lang === "en" && value.trim()) {
      const generatedSlug = generateSlug(value);
      form.setValue("slug", generatedSlug);
    }
  };

  const onSubmit = async (data: CollectionFormData) => {
    try {
      console.log("Collection Data:", { ...data, products: selectedProducts, scheduleDate });
      // Add your API call here
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  const t = {
    en: {
      title: "Create Product Collection",
      name: "Name",
      slug: "Slug",
      description: "Description",
      short_description: "Short description",
      publish: "Publish",
      save: "Save",
      saveExit: "Save & Exit",
      status: "Status",
      published: "Published",
      draft: "Draft",
      pending: "Pending",
      is_featured: "Is featured?",
      image: "Image",
      choose_image: "Choose Image or Add from URL",
      browse: "Browse",
      add_url: "Add from URL",
      url_placeholder: "Enter image URL",
      select_image: "Select Image",
      change_image: "Change Image",
      remove_image: "Remove Image",
      upload_image: "Upload Image",
      drop_image: "Drop image here or click to browse",
      uploading: "Uploading...",
      english: "English",
      arabic: "Arabic",
      required: "Required",
      optional: "Optional",
      or: "OR",
    },
    ar: {
      title: "إنشاء مجموعة منتجات",
      name: "الاسم",
      slug: "الرابط",
      description: "الوصف",
      short_description: "وصف مختصر",
      publish: "نشر",
      save: "حفظ",
      saveExit: "حفظ وخروج",
      status: "الحالة",
      published: "منشور",
      draft: "مسودة",
      pending: "قيد الانتظار",
      is_featured: "مميز؟",
      image: "الصورة",
      choose_image: "اختر صورة أو أضف من رابط",
      browse: "تصفح",
      add_url: "إضافة من رابط",
      url_placeholder: "أدخل رابط الصورة",
      select_image: "اختر صورة",
      change_image: "تغيير الصورة",
      remove_image: "إزالة الصورة",
      upload_image: "رفع صورة",
      drop_image: "أسقط الصورة هنا أو انقر للتصفح",
      uploading: "جاري الرفع...",
      english: "الإنجليزية",
      arabic: "العربية",
      required: "مطلوب",
      optional: "اختياري",
      or: "أو",
    },
  }[locale];

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return [];
    const selectedIds = new Set(selectedProducts.map((p) => p.id));
    return allProducts
      .filter((p) => !selectedIds.has(p.id))
      .filter((p) => {
        const title = p.title?.[locale] || p.title?.en || "";
        const sku = p.sku || "";
        const cat = p.category?.title?.[locale] || p.category?.title?.en || "";
        return (
          title.toLowerCase().includes(q) ||
          sku.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [locale, productQuery, selectedProducts]);

  const totalInventoryValue = useMemo(() => {
    return selectedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
  }, [selectedProducts]);

  const addProduct = (p: Product) => {
    setSelectedProducts((prev) => [...prev, p]);
    setProductQuery("");
  };

  const removeProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#F6F7F6]" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1200px] p-4 md:p-8">
        <Link
          href="/admin/product-collections"
          className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {isAr ? "العودة إلى الكتالوج" : "Back to catalog"}
        </Link>

        <div className="mt-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {isAr ? "إنشاء مجموعة جديدة" : "Create New Collection"}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            {isAr
              ? "نظّم منتجاتك في مجموعات منسّقة. المجموعات عالية الجودة تعزز من ظهور متجرك وتزيد متوسط قيمة الطلب."
              : "Organize your medical supplies into curated sets. High-quality collections improve the professional appearance of your shop and increase average order value."}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
            {/* keep required fields populated while matching the design */}
            <input type="hidden" value={form.watch("slug") || ""} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left */}
              <div className="space-y-6 lg:col-span-7">
                {/* Collection Details */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      {isAr ? "تفاصيل المجموعة" : "Collection Details"}
                    </h2>
                  </div>

                  <div className="mt-5 space-y-5">
                    <FormField
                      name="name.en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            {isAr ? "اسم المجموعة" : "Collection Name"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                isAr
                                  ? "مثال: مجموعة مستلزمات طبية"
                                  : "e.g., Premium Antibacterial Surgical Scrubs 2024"
                              }
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleNameChange("en", e.target.value);
                                // auto-fill arabic name for validation if empty
                                if (!form.getValues("name.ar")) {
                                  form.setValue("name.ar", e.target.value, {
                                    shouldValidate: false,
                                  });
                                }
                              }}
                              className="h-11 rounded-xl border-slate-200/80 bg-slate-50/40 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="description.en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            {isAr ? "الوصف" : "Description"}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder={
                                isAr
                                  ? "أخبر عملاءك عن هذه المجموعة..."
                                  : "Tell your customers about this collection. Describe the fabric quality, medical standards, or specific use cases..."
                              }
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (!form.getValues("description.ar")) {
                                  form.setValue("description.ar", e.target.value, {
                                    shouldValidate: false,
                                  });
                                }
                              }}
                              className="rounded-xl border-slate-200/80 bg-slate-50/40 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Add Products */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Search className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      {isAr ? "إضافة منتجات" : "Add Products"}
                    </h2>
                  </div>

                  <div className="mt-5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={productQuery}
                        onChange={(e) => setProductQuery(e.target.value)}
                        placeholder={
                          isAr
                            ? "ابحث في مخزونك بواسطة SKU أو الاسم أو الفئة..."
                            : "Search your inventory by SKU, name or category..."
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/40 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />

                      {filteredProducts.length > 0 ? (
                        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                          {filteredProducts.map((p) => {
                            const title = p.title?.[locale] || p.title?.en || "—";
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => addProduct(p)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                              >
                                <div className="h-9 w-9 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200">
                                  {p.images?.[0] ? (
                                    <Image
                                      src={p.images[0]}
                                      alt={title}
                                      width={36}
                                      height={36}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : null}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {title}
                                  </p>
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {p.sku || "—"} • {formatCurrency(p.price || 0, locale)}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>

                    {selectedProducts.length > 0 ? (
                      <>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedProducts.map((p) => {
                            const title = p.title?.[locale] || p.title?.en || "—";
                            return (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100"
                              >
                                {title}
                                <button
                                  type="button"
                                  onClick={() => removeProduct(p.id)}
                                  className="rounded-full p-0.5 text-emerald-700/80 hover:bg-emerald-100 hover:text-emerald-900"
                                  aria-label={isAr ? "إزالة" : "Remove"}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>

                        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-5 text-center">
                          <p className="text-sm font-semibold text-slate-700">
                            {isAr
                              ? `${selectedProducts.length} منتجات محددة. إجمالي قيمة المخزون: ${formatCurrency(
                                  totalInventoryValue,
                                  locale,
                                )}`
                              : `${selectedProducts.length} products selected. Total inventory value: ${formatCurrency(
                                  totalInventoryValue,
                                  locale,
                                )}`}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-5 text-center text-sm font-medium text-slate-500">
                        {isAr
                          ? "لم يتم تحديد أي منتجات بعد."
                          : "No products selected yet."}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="space-y-6 lg:col-span-5">
                {/* Cover Image */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      {isAr ? "صورة الغلاف" : "Cover Image"}
                    </h2>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="mt-5">
                    {selectedImage ? (
                      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        <div className="relative h-40 w-full">
                          <Image
                            src={selectedImage}
                            alt="Cover"
                            fill
                            sizes="(min-width: 1024px) 420px, 100vw"
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                          aria-label={isAr ? "إزالة" : "Remove"}
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleBrowseClick}
                          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          {isAr ? "تغيير الصورة" : "Change image"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleBrowseClick}
                        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/40 px-6 py-10 text-center transition hover:border-emerald-300 hover:bg-white"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                          <Upload className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                          {isAr ? "انقر للرفع" : "Click to upload"}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {isAr
                            ? "المقاس الموصى به: 1200×630px (حتى 5MB)"
                            : "Recommended: 1200×630px (Max 5MB)"}
                        </p>
                      </button>
                    )}

                    {isUploading ? (
                      <p className="mt-3 text-center text-xs font-semibold text-emerald-700">
                        {t.uploading}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Publishing */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      {isAr ? "النشر" : "Publishing"}
                    </h2>
                  </div>

                  <div className="mt-5 space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {isAr ? "الظهور" : "Visibility"}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {isAr ? "عام على السوق" : "Public on marketplace"}
                        </p>
                      </div>

                      <FormField
                        name="status"
                        render={({ field }) => {
                          const isOn = field.value === "published";
                          return (
                            <FormItem>
                              <FormControl>
                                <Switch
                                  checked={isOn}
                                  onCheckedChange={(checked) =>
                                    field.onChange(checked ? "published" : "draft")
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {isAr ? "جدولة النشر" : "Schedule Publication"}
                      </p>
                      <div className="mt-2">
                        <Input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="h-11 rounded-xl border-slate-200/80 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <p className="mt-1 text-xs font-medium italic text-slate-400">
                          {isAr
                            ? "اتركه فارغاً للنشر فوراً."
                            : "Leave empty to publish immediately."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isAr ? "إنشاء المجموعة" : "Create Collection"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      form.setValue("status", "draft");
                      form.handleSubmit(onSubmit)();
                    }}
                  >
                    {isAr ? "حفظ كمسودة" : "Save as Draft"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
