"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ImageIcon,
  Search,
  Upload,
  X,
} from "lucide-react";
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
import { products as mockProducts } from "@/data";
import toast from "react-hot-toast";
import {
  createProductCollection,
  CreateProductCollectionPayload,
} from "@/services/productCollectionService";
import { getProducts, ApiProduct } from "@/services/productService";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { uploadImage } from "@/lib/uploadService";

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
  link_required: {
    en: "Link is required",
    ar: "الرابط مطلوب",
  },
  link_invalid: {
    en: "Link must contain only lowercase letters, numbers, and hyphens",
    ar: "يجب أن يحتوي الرابط على أحرف صغيرة وأرقام وشرطات فقط",
  },
};

const collectionSchema = z.object({
  nameEn: z.string().min(1, messages.name_en_required.en),
  nameAr: z.string().min(1, messages.name_ar_required.ar),
  link: z
    .string()
    .min(1, messages.link_required.en)
    .regex(/^[a-z0-9-]+$/, messages.link_invalid.en),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  status: z.enum(["published", "draft"]),
  isFeatures: z.boolean(),
  image: z.string().optional(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

// ---------------- Component ----------------
export default function CreateCollectionPage() {
  const locale = useAppLocale();
  const router = useRouter();
  const isAr = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const user = (session as any)?.user;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [productQuery, setProductQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);

  // Fetch live products
  useEffect(() => {
    if (!token) return;

    const fetchProducts = async () => {
      setIsFetchingProducts(true);
      try {
        const apiProducts = await getProducts(token);
        // Map ApiProduct to frontend Product type
        const mapped: Product[] = apiProducts.map((p) => ({
          id: p._id,
          sku: p.sku || "",
          brand: { id: "", name: { en: "", ar: "" }, image: "", slug: "" }, // Added slug
          model: { en: "", ar: "" },
          category: { id: "", title: { en: "", ar: "" }, image: "", slug: "" }, // Added slug
          title: { en: p.nameEn, ar: p.nameAr },
          price: p.price || p.pricing?.originalPrice || 0,
          images:
            p.media?.galleryImages ||
            (p.media?.featuredImages ? [p.media.featuredImages] : []),
          rating: 0,
          isBestSaller: false,
          reviewCount: 0,
          description: { en: "", ar: "" },
          features: { en: [], ar: [] },
          overview_desc: { en: "", ar: "" },
          highlights: { en: [], ar: [] },
          specifications: [],
          shipping_fee: 0,
          shippingMethod: { en: "standard", ar: "قياسي" },
          weightKg: 0,
          sellers: {
            id: "",
            name: "",
            rating: 0,
            isActive: true,
            returnPolicy: { en: "", ar: "" },
            itemShown: 0,
            status: { en: "", ar: "" },
          },
        }));
        setAllProducts(mapped);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsFetchingProducts(false);
      }
    };

    fetchProducts();
  }, [token]);

  const form = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      nameEn: "",
      nameAr: "",
      link: "",
      descriptionEn: "",
      descriptionAr: "",
      status: "published",
      isFeatures: false,
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
      toast.error(
        locale === "en"
          ? "Please select an image file"
          : "يرجى اختيار ملف صورة",
      );
      return;
    }

    setIsUploading(true);

    try {
      const imageUrl = await uploadImage(file, "product-collections", token);
      setSelectedImage(imageUrl);
      form.setValue("image", imageUrl);
      toast.success(locale === "en" ? "Image uploaded" : "تم رفع الصورة");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(locale === "en" ? "Upload failed" : "فشل التحميل");
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
    const field = lang === "en" ? "nameEn" : "nameAr";
    form.setValue(field, value);

    // Auto-generate link from English name
    if (lang === "en" && value.trim()) {
      const generatedLink = generateSlug(value);
      form.setValue("link", generatedLink);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = async (data: CollectionFormData) => {
    setIsUploading(true);
    try {
      const payload: CreateProductCollectionPayload = {
        sellerId:
          user?.role === "admin"
            ? (user as any)?.id || "507f1f77bcf86cd799439011" // Use real user ID if admin, or a valid BSON dummy
            : (user as any)?.storeId || (user as any)?.id || null,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        link: data.link.startsWith("http")
          ? data.link
          : `https://medicova.net/collections/${data.link}`,
        descriptionAr: data.descriptionAr || "",
        descriptionEn: data.descriptionEn || "",
        products: selectedProducts.map((p) => p.id),
        descriptiveData: selectedProducts[0]?.id || "",
        status: data.status === "published",
        images: data.image ? [data.image] : [],
        isFeatures: data.isFeatures,
      };

      await createProductCollection(payload, token);

      toast.success(
        isAr ? "تم إنشاء المجموعة بنجاح" : "Collection created successfully",
      );

      router.push("/admin/product-collections");
    } catch (error: any) {
      console.error("Submission failed", error);
      toast.error(
        error.message ||
          (isAr ? "فشل إنشاء المجموعة" : "Failed to create collection"),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const t = {
    en: {
      name: "Name",
      link: "Link",
      description: "Description",
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
      link: "الرابط",
      description: "الوصف",
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
    const selectedIds = new Set(selectedProducts.map((p) => p.id));

    if (!q) {
      // Show first 8 unselected products if no query
      return allProducts.filter((p) => !selectedIds.has(p.id)).slice(0, 8);
    }

    return allProducts
      .filter((p) => !selectedIds.has(p.id))
      .filter((p) => {
        const title = (p.title?.[locale] || p.title?.en || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const cat = (
          p.category?.title?.[locale] ||
          p.category?.title?.en ||
          ""
        ).toLowerCase();
        return title.includes(q) || sku.includes(q) || cat.includes(q);
      })
      .slice(0, 8);
  }, [locale, productQuery, selectedProducts, allProducts]);

  const totalInventoryValue = useMemo(() => {
    return selectedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
  }, [selectedProducts]);

  const addProduct = (p: Product) => {
    setSelectedProducts((prev) => [...prev, p]);
    setProductQuery("");
    setIsDropdownOpen(false);
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
            <input type="hidden" value={form.watch("link") || ""} />

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
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Name (En)
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
                                if (!form.getValues("nameAr")) {
                                  form.setValue("nameAr", e.target.value, {
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
                      name="nameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Name (Ar)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                isAr
                                  ? "مثال: مجموعة مستلزمات طبية"
                                  : "e.g., Premium Antibacterial Surgical Scrubs 2024"
                              }
                              {...field}
                              className="h-11 rounded-xl border-slate-200/80 bg-slate-50/40 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            link *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="summer-collection"
                              {...field}
                              className="h-11 rounded-xl border-slate-200/80 bg-slate-50/40 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="descriptionEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Description (En)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Tell your customers about this collection in English..."
                              {...field}
                              className="rounded-xl border-slate-200/80 bg-slate-50/40 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="descriptionAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Description (Ar)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="أخبر عملاءك عن هذه المجموعة بالعربية..."
                              {...field}
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
                    <div className="relative" ref={wrapperRef}>
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={productQuery}
                        onChange={(e) => setProductQuery(e.target.value)}
                        onFocus={() => setIsDropdownOpen(true)}
                        placeholder={
                          isAr
                            ? "ابحث في مخزونك بواسطة SKU أو الاسم أو الفئة..."
                            : "Search your inventory by SKU, name or category..."
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/40 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />

                      {isDropdownOpen && filteredProducts.length > 0 && (
                        <div className="scroll-bar-minimal absolute z-10 mt-1 max-h-[400px] w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                          {filteredProducts.map((product, idx) => {
                            const title = isAr
                              ? (product as any).nameAr ||
                                (product as any).title?.ar ||
                                (product as any).name ||
                                (product as any).title?.en ||
                                "—"
                              : (product as any).nameEn ||
                                (product as any).title?.en ||
                                (product as any).name ||
                                (product as any).title?.ar ||
                                "—";
                            const imageUrl =
                              (product as any).media?.featuredImages ||
                              (product as any).media?.galleryImages?.[0] ||
                              (product as any).images?.[0] ||
                              "/images/placeholder.png";

                            return (
                              <div
                                key={product.id || `prod-${idx}`}
                                className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                onClick={() => addProduct(product)}
                              >
                                <Image
                                  src={imageUrl}
                                  width={100}
                                  height={100}
                                  alt={title}
                                  className="h-8 w-8 rounded-md object-cover"
                                />
                                <div>
                                  <div className="text-sm font-medium">
                                    {title}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    SKU: {product.sku || "—"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isDropdownOpen &&
                        productQuery.length >= 2 &&
                        filteredProducts.length === 0 && (
                          <div className="scroll-bar-minimal absolute z-10 mt-1 w-full rounded-md border bg-white p-4 text-center text-gray-500 shadow-lg">
                            {isAr
                              ? "لم يتم العثور على منتجات"
                              : "No products found"}
                          </div>
                        )}
                    </div>

                    {selectedProducts.length > 0 ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {selectedProducts.map((p: any) => {
                            const title = isAr
                              ? p.nameAr ||
                                p.title?.ar ||
                                p.name ||
                                p.title?.en ||
                                "—"
                              : p.nameEn ||
                                p.title?.en ||
                                p.name ||
                                p.title?.ar ||
                                "—";
                            const imageUrl =
                              p.media?.featuredImages ||
                              p.media?.galleryImages?.[0] ||
                              p.images?.[0] ||
                              "";
                            return (
                              <div
                                key={p.id}
                                className="group relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                              >
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">
                                  {imageUrl ? (
                                    <Image
                                      src={imageUrl}
                                      alt={title}
                                      width={64}
                                      height={64}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-50">
                                      <ImageIcon className="h-6 w-6 text-slate-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-slate-900">
                                    {title}
                                  </p>
                                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                                    SKU: {p.sku || "—"}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeProduct(p.id)}
                                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-red-50 hover:text-red-500 hover:ring-red-200"
                                  aria-label={isAr ? "إزالة" : "Remove"}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-5 text-center">
                          <p className="text-sm font-semibold text-slate-700">
                            {isAr
                              ? `${selectedProducts.length} منتجات محددة.`
                              : `${selectedProducts.length} products selected.`}
                          </p>
                        </div>
                      </div>
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
                    <h3 className="text-lg font-semibold text-slate-800">
                      images
                    </h3>
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
                          status
                        </p>
                      </div>

                      <FormField
                        name="status"
                        render={({ field }) => {
                          const isOn = field.value === "published";
                          return (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Switch
                                  checked={isOn}
                                  onCheckedChange={(checked) =>
                                    field.onChange(
                                      checked ? "published" : "draft",
                                    )
                                  }
                                />
                              </FormControl>
                              <FormLabel className="!mt-0 text-sm font-semibold text-slate-800">
                                {isAr
                                  ? "عام على السوق"
                                  : "Public on marketplace"}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />

                      <FormField
                        name="isFeatures"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="!mt-0 text-sm font-semibold text-slate-800">
                              isFeatures
                            </FormLabel>
                          </FormItem>
                        )}
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
