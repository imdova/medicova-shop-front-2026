"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/UI/form";
import { Card } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import {
  BilingualInput,
  BilingualTextEditor,
} from "@/components/PageEditor/BilingualInput";
import { Testimonial } from "@/types";
import { dummyTestimonials } from "@/constants/testimonials";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";
import { useLanguage } from "@/contexts/LanguageContext";

//
// ------------- ZOD Schema -------------
//
const bilingualTextSchema = z.object({
  en: z.string().min(1, "English text is required"),
  ar: z.string().min(1, "Arabic text is required"),
});

const formSchema = z.object({
  title: bilingualTextSchema,
  description: bilingualTextSchema,
  content: bilingualTextSchema,
  status: z.enum(["draft", "published", "archived"]),
});

type FormSchema = z.infer<typeof formSchema>;

//
// ------------- Component -------------
//
export default function EditTestimonialForm() {
  const params = useParams();
  const { language } = useLanguage();
  const slug = params.slug as string;
  const [isLoading, setIsLoading] = useState(true);
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);

  // Find testimonial by slug
  useEffect(() => {
    const foundTestimonial = dummyTestimonials.find((t) => t.id === slug);

    if (foundTestimonial) {
      setTestimonial(foundTestimonial);
      // Set form values when testimonial is found
      form.reset({
        title: foundTestimonial.title,
        description: foundTestimonial.description,
        content: foundTestimonial.content,
        status: foundTestimonial.status.en,
      });
    }

    setIsLoading(false);
  }, [slug]);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: { en: "", ar: "" },
      description: { en: "", ar: "" },
      content: { en: "", ar: "" },
      status: "draft",
    },
  });

  const onSubmit = (data: FormSchema) => {
    console.log("✅ Updated Testimonial Data:", {
      ...data,
      id: testimonial?.id,
      slug: testimonial?.slug,
    });
    // Here you would typically make an API call to update the testimonial
    alert(`Testimonial "${data.title.en}" updated successfully!`);
  };

  const t = {
    en: {
      title: `Edit Testimonial${testimonial ? `: ${testimonial.title.en}` : ""}`,
      description: "Update customer testimonial details",
      form_title: "Title",
      form_description: "Description",
      form_content: "Content",
      form_status: "Status",
      placeholder_title_en: "Enter title in English",
      placeholder_title_ar: "Enter title in Arabic",
      placeholder_description_en: "Enter description in English",
      placeholder_description_ar: "Enter description in Arabic",
      status_draft: "Draft",
      status_published: "Published",
      status_archived: "Archived",
      status_select: "Select status",
      submit: "Update Testimonial",
      english: "English",
      arabic: "العربية",
      switch_language: "Switch language",
      loading: "Loading testimonial...",
      not_found: "Testimonial not found",
    },
    ar: {
      title: `تعديل الرأي${testimonial ? `: ${testimonial.title.ar}` : ""}`,
      description: "تحديث تفاصيل رأي العميل",
      form_title: "العنوان",
      form_description: "الوصف",
      form_content: "المحتوى",
      form_status: "الحالة",
      placeholder_title_en: "أدخل العنوان بالإنجليزية",
      placeholder_title_ar: "أدخل العنوان بالعربية",
      placeholder_description_en: "أدخل الوصف بالإنجليزية",
      placeholder_description_ar: "أدخل الوصف بالعربية",
      status_draft: "مسودة",
      status_published: "منشور",
      status_archived: "مؤرشف",
      status_select: "اختر الحالة",
      submit: "تحديث الرأي",
      english: "English",
      arabic: "العربية",
      switch_language: "تبديل اللغة",
      loading: "جاري تحميل الرأي...",
      not_found: "الرأي غير موجود",
    },
  }[language];

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  // Not found state
  if (!testimonial) {
    return <NotFound />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-600">{t.description}</p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-6">
            {/* LEFT: Main content */}
            <div className="space-y-6 lg:col-span-4">
              {/* Title + Description */}
              <Card className="space-y-6 p-6">
                <FormField
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <BilingualInput
                          value={field.value}
                          onChange={field.onChange}
                          label={t.form_title}
                          placeholder={{
                            en: t.placeholder_title_en,
                            ar: t.placeholder_title_ar,
                          }}
                          language={language}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <BilingualInput
                          value={field.value}
                          onChange={field.onChange}
                          label={t.form_description}
                          placeholder={{
                            en: t.placeholder_description_en,
                            ar: t.placeholder_description_ar,
                          }}
                          language={language}
                          type="textarea"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Content */}
              <Card className="p-6">
                <FormLabel className="text-lg font-semibold">
                  {t.form_content}
                </FormLabel>
                <FormField
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <BilingualTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          language={language}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            </div>

            {/* RIGHT: Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              {/* Status */}
              <Card className="p-6">
                <FormField
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        {t.form_status}
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.status_select} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">
                              {t.status_draft}
                            </SelectItem>
                            <SelectItem value="published">
                              {t.status_published}
                            </SelectItem>
                            <SelectItem value="archived">
                              {t.status_archived}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Submit */}
              <Card className="p-6">
                <Button type="submit" className="w-full">
                  {t.submit}
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
