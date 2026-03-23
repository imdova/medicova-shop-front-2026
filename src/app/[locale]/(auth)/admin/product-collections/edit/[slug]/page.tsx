"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useEffect, useMemo } from "react";
import { uploadImage } from "@/lib/uploadService";
import { LogOutIcon, X, Upload, Search, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/select";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Card, CardContent, CardHeader } from "@/components/shared/card";
import { Switch } from "@/components/shared/switch";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Product } from "@/types/product";
import Loading from "@/app/[locale]/loading";
import toast from "react-hot-toast";
import {
  getProductCollectionById,
  updateProductCollection,
  CreateProductCollectionPayload,
} from "@/services/productCollectionService";
import { getProducts, ApiProduct } from "@/services/productService";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
export default function EditCollectionPage() {
  const locale = useAppLocale();
  const params = useParams();
  const router = useRouter();
  const isAr = locale === "ar";
  const collectionId = params.slug as string;
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const user = (session as any)?.user;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
          brand: { id: "", name: { en: "", ar: "" }, image: "", slug: "" }, // Placeholder
          model: { en: "", ar: "" },
          category: { id: "", title: { en: "", ar: "" }, image: "", slug: "" }, // Placeholder
          title: { en: p.nameEn, ar: p.nameAr },
          slug: { en: p.slugEn || "", ar: p.slugAr || "" },
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

  // Initialize form with collection data
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
  // Load collection data based on ID
  useEffect(() => {
    if (!token) return;
    const fetchCollection = async () => {
      setIsFetching(true);
      try {
        const data = await getProductCollectionById(collectionId, token);
        if (data) {
          form.reset({
            nameEn: data.nameEn || data.name.en || "",
            nameAr: data.nameAr || data.name.ar || "",
            link: data.link || data.slug || "",
            descriptionEn: data.descriptionEn || data.description.en || "",
            descriptionAr: data.descriptionAr || data.description.ar || "",
            status: data.status === "published" ? "published" : "draft",
            isFeatures: data.isFeatures || data.is_featured || false,
            image: data.image || "",
          });
          setSelectedImage(data.image || "");
          setSelectedProducts(data.products || []);
          console.log("DEBUG: Collection products loaded:", data.products);
        } else {
          toast.error(
            isAr ? "لم يتم العثور على المجموعة" : "Collection not found",
          );
          router.push("/admin/product-collections");
        }
      } catch (error) {
        console.error("Failed to fetch collection:", error);
        toast.error(
          isAr
            ? "فشل في تحميل بيانات المجموعة"
            : "Failed to load collection data",
        );
      } finally {
        setIsFetching(false);
      }
    };

    fetchCollection();
  }, [collectionId, form, router, isAr, token]);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const selectedIds = new Set(selectedProducts.map((p) => p.id));

    if (!q) {
      return allProducts.filter((p) => !selectedIds.has(p.id)).slice(0, 8);
    }

    return allProducts
      .filter((p) => !selectedIds.has(p.id))
      .filter((p) => {
        const title = (p.title?.[locale] || p.title?.en || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        return title.includes(q) || sku.includes(q);
      })
      .slice(0, 8);
  }, [locale, searchTerm, selectedProducts, allProducts]);

  // Add product to collection
  const addProduct = (product: Product) => {
    if (!selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts((prev) => [...prev, product]);
      setSearchTerm("");
      setIsSearchOpen(false);
    }
  };

  // Remove product from collection
  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    // form.setValue(`name.${lang}`, value); // This line is no longer needed due to schema change
    // Removed slug generation logic as per instruction
    // if (lang === "en" && value.trim()) {
    //   const generatedSlug = generateSlug(value);
    //   form.setValue("slug", generatedSlug);
    // }
  };

  const onSubmit = async (data: CollectionFormData) => {
    setIsUploading(true);
    try {
      const payload: Partial<CreateProductCollectionPayload> = {
        sellerId:
          user?.role === "admin"
            ? (user as any)?.id || "507f1f77bcf86cd799439011"
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

      await updateProductCollection(collectionId, payload, token);

      toast.success(
        isAr ? "تم تحديث المجموعة بنجاح" : "Collection updated successfully",
      );

      router.push("/admin/product-collections");
    } catch (error: any) {
      console.error("Update failed", error);
      toast.error(
        error.message ||
          (isAr ? "فشل تحديث المجموعة" : "Failed to update collection"),
      );
    } finally {
      setIsUploading(false);
    }
  };

  const t = {
    en: {
      title: "Edit Product Collection",
      name: "Name",
      link: "Link", // Changed from slug
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
      products: "Products",
      search_products: "Search products...",
      selected_products: "Selected Products",
      no_products_found: "No products found",
      remove: "Remove",
      no_products_selected: "No products selected",
    },
    ar: {
      title: "تحرير مجموعة المنتجات",
      name: "الاسم",
      link: "الرابط", // Changed from slug
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
      products: "المنتجات",
      search_products: "بحث في المنتجات...",
      selected_products: "المنتجات المختارة",
      no_products_found: "لم يتم العثور على منتجات",
      remove: "إزالة",
      no_products_selected: "لا توجد منتجات مختارة",
    },
  }[locale];

  if (isUploading || isFetching) {
    return <Loading />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {t.title}
        </p>
        <Link
          href={`/admin/product-collections/${collectionId}/overview`}
          className="mt-1 block text-2xl font-bold text-gray-900 underline-offset-4 hover:text-primary hover:underline"
        >
          {form.watch("nameEn") || form.watch("nameAr") || "..."}
        </Link>
        <p className="mt-1 text-sm text-gray-600">
          {locale === "en" ? "Editing collection" : "جاري تحرير المجموعة"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
            {/* Left Column - Main Content */}
            <div className="space-y-6 lg:col-span-4">
              {/* Name Section - Bilingual */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    name="nameEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (En)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`${t.name} (${t.english})`}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                            }}
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
                        <FormLabel>Name (Ar)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`${t.name} (${t.arabic})`}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Slug & Link Section */}
              <Card className="p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">link *</FormLabel>
                        <FormControl>
                          <Input placeholder="collection-link" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Products Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.products}</h3>
                </div>

                {/* Search Products */}
                <div className="relative mb-4" ref={wrapperRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t.search_products}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchOpen(true)}
                      className="pl-10"
                    />
                  </div>

                  {isSearchOpen && (
                    <div className="scroll-bar-minimal absolute z-10 mt-1 max-h-[400px] w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, idx) => (
                          <div
                            key={product.id || `prod-${idx}`}
                            className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100"
                            onClick={() => addProduct(product)}
                          >
                            <Image
                              src={
                                (product as any).media?.featuredImages ||
                                (product as any).media?.galleryImages?.[0] ||
                                (product as any).images?.[0] ||
                                "/images/placeholder.png"
                              }
                              width={100}
                              height={100}
                              alt={
                                isAr
                                  ? (product as any).nameAr ||
                                    (product as any).title?.ar ||
                                    (product as any).name ||
                                    (product as any).title?.en ||
                                    "—"
                                  : (product as any).nameEn ||
                                    (product as any).title?.en ||
                                    (product as any).name ||
                                    (product as any).title?.ar ||
                                    "—"
                              }
                              className="h-8 w-8 rounded-md object-cover"
                            />
                            <div>
                              <div className="text-sm font-medium">
                                {isAr
                                  ? (product as any).nameAr ||
                                    (product as any).title?.ar ||
                                    (product as any).name ||
                                    (product as any).title?.en ||
                                    "—"
                                  : (product as any).nameEn ||
                                    (product as any).title?.en ||
                                    (product as any).name ||
                                    (product as any).title?.ar ||
                                    "—"}
                              </div>
                              <div className="text-sm text-gray-600">
                                SKU: {product.sku || "—"}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">
                          {t.no_products_found}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Products */}
                <div>
                  <h4 className="mb-3 font-medium">{t.selected_products}</h4>
                  {selectedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {selectedProducts.map((product, idx) => (
                        <div
                          key={product.id || `sel-${idx}`}
                          className="group relative flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                        >
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100">
                            <Image
                              src={
                                (product as any).media?.featuredImages ||
                                (product as any).media?.galleryImages?.[0] ||
                                (product as any).images?.[0] ||
                                "/images/placeholder.png"
                              }
                              width={64}
                              height={64}
                              alt={
                                isAr
                                  ? (product as any).nameAr ||
                                    (product as any).title?.ar ||
                                    (product as any).name ||
                                    (product as any).title?.en ||
                                    "—"
                                  : (product as any).nameEn ||
                                    (product as any).title?.en ||
                                    (product as any).name ||
                                    (product as any).title?.ar ||
                                    "—"
                              }
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold text-gray-900">
                              {isAr
                                ? (product as any).nameAr ||
                                  (product as any).title?.ar ||
                                  (product as any).name ||
                                  (product as any).title?.en ||
                                  "—"
                                : (product as any).nameEn ||
                                  (product as any).title?.en ||
                                  (product as any).name ||
                                  (product as any).title?.ar ||
                                  "—"}
                            </div>
                            <div className="mt-0.5 text-xs font-medium text-gray-500">
                              SKU: {product.sku || "—"}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-red-50 hover:text-red-500 hover:ring-red-200"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-center text-gray-500">
                      {t.no_products_selected}
                    </div>
                  )}
                </div>
              </Card>

              {/* Description Section - Bilingual */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.description}</h3>
                </div>
                <FormField
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Description (En)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`${t.description} (${t.english})`}
                          rows={4}
                          {...field}
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
                      <FormLabel>Description (Ar)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`${t.description} (${t.arabic})`}
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              {/* Publish Buttons */}
              <Card className="p-4">
                <CardHeader className="p-0 pb-4 font-semibold">
                  {t.publish}
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-0 sm:flex-row">
                  <Button
                    type="submit"
                    variant="outline"
                    className="flex flex-1 items-center gap-2"
                  >
                    <LogOutIcon className="h-4 w-4" />
                    {t.saveExit}
                  </Button>
                  <Button className="flex-1" type="submit">
                    {t.save}
                  </Button>
                </CardContent>
              </Card>

              {/* Featured Switch */}
              <Card className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <FormLabel className="text-base">status</FormLabel>
                  <FormField
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value === "published"}
                            onCheckedChange={(checked) =>
                              field.onChange(checked ? "published" : "draft")
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">isFeatures</FormLabel>
                  <FormField
                    name="isFeatures"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Image Section */}
              <Card className="p-4">
                <CardHeader className="p-0 pb-4 font-semibold">
                  images
                </CardHeader>
                <CardContent className="space-y-4 p-0">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  {selectedImage ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="h-40 w-full overflow-hidden rounded-md border">
                          <Image
                            width={150}
                            height={150}
                            src={selectedImage}
                            alt="Collection"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="absolute right-2 top-2 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleBrowseClick}
                          className="flex-1"
                        >
                          {t.change_image}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div
                        className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-primary"
                        onClick={handleBrowseClick}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">
                              {t.upload_image}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {t.drop_image}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            {t.or}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Input
                          placeholder={t.url_placeholder}
                          value={form.watch("image") || ""}
                          onChange={(e) =>
                            form.setValue("image", e.target.value)
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleImageSelect(form.watch("image") || "")
                          }
                          className="w-full"
                          disabled={!form.watch("image")?.trim()}
                        >
                          {t.add_url}
                        </Button>
                      </div>
                    </div>
                  )}

                  {isUploading && (
                    <div className="text-center text-sm text-blue-600">
                      {t.uploading}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
