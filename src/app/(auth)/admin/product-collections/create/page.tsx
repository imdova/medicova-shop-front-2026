"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef } from "react";
import { LogOutIcon, X, Upload } from "lucide-react";
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
import Image from "next/image";

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
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

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
        language === "en"
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

    // Auto-generate slug from English name
    if (lang === "en" && value.trim()) {
      const generatedSlug = generateSlug(value);
      form.setValue("slug", generatedSlug);
    }
  };

  const onSubmit = async (data: CollectionFormData) => {
    try {
      console.log("Collection Data:", data);
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
  }[language];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
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
                  {/* Hidden file input */}
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
                      {/* Upload Area */}
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

                      {/* OR separator */}
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

                      {/* URL Input */}
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

                  {/* Uploading indicator */}
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
