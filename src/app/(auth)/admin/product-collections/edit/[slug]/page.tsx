"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import { LogOutIcon, X, Upload, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/UI/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/UI/card";
import { Switch } from "@/components/UI/switch";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Product } from "@/types/product";
import { ProductCollections } from "@/constants/productCollection";
import NotFound from "@/app/not-found";
import { products } from "@/constants/products";
import Loading from "@/app/loading";

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
export default function EditCollectionPage() {
  const { language } = useLanguage();
  const params = useParams();
  const collectionSlug = params.slug as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Find collection by slug
  const collection = ProductCollections.find((c) => c.id === collectionSlug);

  // Initialize form with collection data
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

  // Load collection data based on slug
  useEffect(() => {
    if (collection) {
      // Set form values
      form.reset({
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        short_description: collection.short_description,
        status: collection.status,
        is_featured: collection.is_featured,
        image: collection.image,
      });

      setSelectedImage(collection.image);
      setSelectedProducts(collection.products || []);
    }
  }, [collection, form]);

  // Filter products based on search
  const filteredProducts = products
    .filter(
      (product) =>
        product.title[language]
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.title.en.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter(
      (product) =>
        !selectedProducts.some((selected) => selected.id === product.id),
    );

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
      alert(
        language === "en"
          ? "Please select an image file"
          : "يرجى اختيار ملف صورة",
      );
      return;
    }

    setIsUploading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      form.setValue("image", imageUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(language === "en" ? "Upload failed" : "فشل التحميل");
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

    if (lang === "en" && value.trim()) {
      const generatedSlug = generateSlug(value);
      form.setValue("slug", generatedSlug);
    }
  };

  const onSubmit = async (data: CollectionFormData) => {
    try {
      const collectionData = {
        ...data,
        products: selectedProducts,
        id: collection?.id,
      };

      console.log("Updated Collection Data:", collectionData);
      // Add your API update call here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(
        language === "en"
          ? "Collection updated successfully!"
          : "تم تحديث المجموعة بنجاح!",
      );
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const t = {
    en: {
      title: "Edit Product Collection",
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
      products: "المنتجات",
      search_products: "بحث في المنتجات...",
      selected_products: "المنتجات المختارة",
      no_products_found: "لم يتم العثور على منتجات",
      remove: "إزالة",
      no_products_selected: "لا توجد منتجات مختارة",
    },
  }[language];

  if (isUploading) {
    return <Loading />;
  }

  if (!collection) {
    return <NotFound />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="mt-1 text-sm text-gray-600">
          {language === "en" ? "Editing:" : "جاري تحرير:"}{" "}
          {collection.name[language]}
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
                    name="name.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.name} ({t.english})
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`${t.name} (${t.english})`}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleNameChange("en", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="name.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.name} ({t.arabic})
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`${t.name} (${t.arabic})`}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleNameChange("ar", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Slug Section */}
              <Card className="p-6">
                <FormField
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">{t.slug} *</FormLabel>
                      <FormControl>
                        <Input placeholder="collection-slug" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100"
                            onClick={() => addProduct(product)}
                          >
                            <Image
                              src={
                                product.images?.[0] ?? "/images/placeholder.png"
                              }
                              width={100}
                              height={100}
                              alt={product.title[language] ?? "Product Desc"}
                              className="h-8 w-8 rounded-md object-cover"
                            />
                            <div>
                              <div className="text-sm font-medium">
                                {product.title[language]}
                              </div>
                              <div className="text-sm text-gray-600">
                                ${product.price}
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
                    <div className="space-y-2">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex justify-between rounded-md border p-3 sm:items-center"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Image
                              src={
                                product.images?.[0] ?? "/images/placeholder.png"
                              }
                              width={100}
                              height={100}
                              alt={product.title[language]}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                            <div>
                              <div className="font-medium">
                                {product.title[language]}
                              </div>
                              <div className="text-sm text-gray-600">
                                ${product.price} • {product.sku}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                  name="description.en"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>
                        {t.description} ({t.english})
                      </FormLabel>
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
                  name="description.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t.description} ({t.arabic})
                      </FormLabel>
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

              {/* Short Description Section - Bilingual */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">
                    {t.short_description}
                  </h3>
                </div>
                <FormField
                  name="short_description.en"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>
                        {t.short_description} ({t.english})
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`${t.short_description} (${t.english})`}
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="short_description.ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t.short_description} ({t.arabic})
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`${t.short_description} (${t.arabic})`}
                          rows={2}
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

              {/* Status */}
              <Card className="p-4">
                <FormField
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">{t.status} *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.status} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="published">
                            {t.published}
                          </SelectItem>
                          <SelectItem value="draft">{t.draft}</SelectItem>
                          <SelectItem value="pending">{t.pending}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Featured Switch */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">{t.is_featured}</FormLabel>
                  <FormField
                    name="is_featured"
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
                  {t.image}
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
