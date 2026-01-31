"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Save, Languages } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/UI/form";
import { Textarea } from "@/components/UI/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/UI/card";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ProductTags } from "@/constants/productTags";
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
    ar: "المعرف مطلوب",
  },
};

const tagSchema = z.object({
  name: z.object({
    en: z.string().min(1, messages.name_en_required.en),
    ar: z.string().min(1, messages.name_ar_required.ar),
  }),
  slug: z.string().min(1, messages.slug_required.en),
  description: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),
  meta_title: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),
  meta_description: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),
  status: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }),
  noindex: z.enum(["true", "false"]),
  image: z.any().optional(),
});

type TagFormData = z.infer<typeof tagSchema>;

// Mock function to fetch tag data by slug - replace with your actual API call
const fetchTagBySlug = async (slug: string): Promise<TagFormData | null> => {
  // This is a mock implementation - replace with your actual API call
  try {
    const response = await fetch(`/api/tags/${slug}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching tag:", error);
    return null;
  }
};

// Mock function to update tag - replace with your actual API call
const updateTag = async (slug: string, data: TagFormData): Promise<boolean> => {
  try {
    const response = await fetch(`/api/tags/${slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error("Error updating tag:", error);
    return false;
  }
};

// ---------------- Component ----------------
export default function EditTagPage() {
  const { language } = useLanguage();
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();
  const slug = params.slug as string;
  const tag = ProductTags.find((tag) => tag.id === slug);

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: tag?.name,
      slug: tag?.slug,
      description: tag?.description,
      meta_title: tag?.meta_title,
      meta_description: tag?.meta_description,
      status: tag?.status,
      noindex: tag?.noindex,
    },
  });

  // Fetch tag data when component mounts or slug changes
  useEffect(() => {
    const loadTagData = async () => {
      if (!slug) return;

      setIsLoading(true);
      try {
        const tagData = await fetchTagBySlug(slug);
        if (tagData) {
          form.reset(tagData);
          // If there's an existing image, you might want to set the preview here
          // setPreview(tagData.imageUrl);
        }
      } catch (error) {
        console.error("Failed to load tag data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTagData();
  }, [slug, form]);

  const onSubmit = async (data: TagFormData) => {
    if (!slug) return;

    setIsSubmitting(true);
    try {
      const success = await updateTag(slug, data);
      if (success) {
        console.log("Tag updated successfully");
        // You might want to add a success message or redirect here
      } else {
        console.error("Failed to update tag");
        // Handle error state
      }
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = {
    en: {
      name: "Name",
      slug: "Permalink",
      description: "Description",
      meta_title: "SEO Title",
      meta_description: "SEO description",
      status: "Status",
      noindex: "Index",
      image: "SEO Image",
      save: "Save & Exit",
      published: "Published",
      draft: "Draft",
      allow_index: "Index",
      no_index: "No index",
      language_version: "You are editing 'English' version",
      seo_optimize: "Search Engine Optimize",
      edit_tag: "Edit Tag",
      loading: "Loading...",
      update: "Update",
    },
    ar: {
      name: "الاسم",
      slug: "الرابط الدائم",
      description: "الوصف",
      meta_title: "عنوان SEO",
      meta_description: "وصف SEO",
      status: "الحالة",
      noindex: "الفهرسة",
      image: "صورة SEO",
      save: "حفظ والخروج",
      published: "منشور",
      draft: "مسودة",
      allow_index: "فهرسة",
      no_index: "عدم الفهرسة",
      language_version: "أنت تقوم بتحرير النسخة 'العربية'",
      seo_optimize: "تحسين محركات البحث",
      edit_tag: "تحرير الوسم",
      loading: "جاري التحميل...",
      update: "تحديث",
    },
  }[language];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Languages className="h-6 w-6" />
          {t.edit_tag}
        </h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="space-y-6 md:col-span-3">
              <Card className="p-4">
                {/* Name EN & AR */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.name} (English)</FormLabel>
                        <FormControl>
                          <Input placeholder={t.name} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.name} (Arabic)</FormLabel>
                        <FormControl>
                          <Input placeholder={t.name} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Slug */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.slug}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.slug} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description EN & AR */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="description.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.description} (English)</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t.description} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.description} (Arabic)</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t.description} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
              <Card className="space-y-4 p-4">
                <h2 className="text-xl font-semibold">{t.seo_optimize}</h2>
                {/* Meta Title EN & AR */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="meta_title.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.meta_title} (English)</FormLabel>
                        <FormControl>
                          <Input placeholder={t.meta_title} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meta_title.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.meta_title} (Arabic)</FormLabel>
                        <FormControl>
                          <Input placeholder={t.meta_title} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Meta Description EN & AR */}
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="meta_description.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.meta_description} (English)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.meta_description}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meta_description.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.meta_description} (Arabic)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.meta_description}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* SEO Image */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.image}</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPreview(URL.createObjectURL(file));
                              field.onChange(e.target.files);
                            } else {
                              setPreview(null);
                              field.onChange(null);
                            }
                          }}
                        />
                      </FormControl>
                      {preview && (
                        <Image
                          width={200}
                          height={200}
                          src={preview}
                          alt="Preview"
                          className="mt-2 h-32 w-32 rounded object-cover"
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Noindex */}
                <FormField
                  control={form.control}
                  name="noindex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.noindex}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.noindex} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="false">{t.allow_index}</SelectItem>
                          <SelectItem value="true">{t.no_index}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </Card>
            </div>

            <div className="space-y-6 md:col-span-2">
              <Card className="p-4">
                <CardHeader className="text-xl font-semibold">
                  {t.published}
                </CardHeader>
                <CardContent className="flex gap-2 p-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {t.save}
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t.loading : t.update}
                  </Button>
                </CardContent>
              </Card>
              {/* Status */}
              <Card className="p-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.status}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.en ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.status} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">{t.draft}</SelectItem>
                          <SelectItem value="published">
                            {t.published}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
