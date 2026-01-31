"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/UI/button";
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
import { Card } from "@/components/UI/card";
import { dummyPages } from "@/constants/pages";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";
import {
  BilingualInput,
  BilingualTextEditor,
} from "@/components/PageEditor/BilingualInput";
import ImageUpload from "@/components/PageEditor/ImageUpload";
import { useParams } from "next/navigation";
import { FAQManager } from "@/components/PageEditor/FAQManager";
import SEOManager from "@/components/PageEditor/SEOManager";
import {
  faqSchema,
  pageSchema,
  seoSchema,
} from "@/constants/schemas/BuildPage";

type FAQItem = z.infer<typeof faqSchema>;
type SEOData = z.infer<typeof seoSchema>;
type PageFormData = z.infer<typeof pageSchema>;

// ---------------- Main Component ----------------
export default function EditPage() {
  const { language } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;
  const [activeEditorLang, setActiveEditorLang] = useState<"en" | "ar">(
    language,
  );
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      description: { en: "", ar: "" },
      content: { en: "", ar: "" },
      template: "custom",
      breadcrumb_style: "start",
      breadcrumb_background: "",
      status: "published",
      featured_image: "",
      faqs: [],
      seo: {
        meta_title: { en: "", ar: "" },
        meta_description: { en: "", ar: "" },
        meta_image: "",
      },
      languages: [],
    },
  });
  const dummyPage = dummyPages.find((page) => slug === page.id);
  // Simulate loading page data
  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset the form with dummy data
      form.reset(dummyPage);
      setIsLoading(false);
    };

    loadPageData();
  }, [slug, form]);

  const onSubmit = async (data: PageFormData) => {
    try {
      console.log("Updated Page Data:", data);
      // Here you would typically send to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Handle successful submission
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const handleFaqsChange = (faqs: FAQItem[]) => {
    form.setValue("faqs", faqs);
  };

  const handleSeoChange = (seo: SEOData) => {
    form.setValue("seo", seo);
  };

  const handleFeaturedImageChange = (imageUrl: string) => {
    form.setValue("featured_image", imageUrl);
  };

  const handleBreadcrumbBackgroundChange = (imageUrl: string) => {
    form.setValue("breadcrumb_background", imageUrl);
  };
  const t = {
    en: {
      title: "Edit Page",
      breadcrumb: 'DASHBOARD / PAGES / EDIT "COMING SOON"',
      language_version: 'You are editing "English" version',
      revision_history: "Revision History",
      name: "Name *",
      name_required: "Name is required",
      permalink: "Permalink *",
      preview: "Preview",
      description: "Description",
      short_description: "Short description",
      content: "Content",
      show_hide_editor: "Show/Hide Editor",
      add_media: "Add media",
      ui_blocks: "UI Blocks",
      templates: "Template *",
      default: "Default",
      without_layout: "Without layout",
      coming_soon: "Coming Soon",
      breadcrumb_style: "Breadcrumb style",
      align_start: "Align start",
      align_center: "Align center",
      align_end: "Align end",
      breadcrumb_background: "Breadcrumb background",
      faq_schema: "FAQ schema configuration",
      learn_more: "Learn more",
      add_new: "Add new",
      select_existing: "or Select from existing FAQs",
      seo: "Search Engine Optimize",
      seo_description:
        "Setup meta title & description to make your site easy to discover on search engines such as Google",
      edit_seo_meta: "Edit SEO meta",
      choose_image: "Choose Image or Add from URL",
      save: "Save",
      save_exit: "Save & Exit",
      cancel: "Cancel",
      published: "Published",
      draft: "Draft",
      pending: "Pending",
      status: "Status *",
      languages: "Languages",
      featured_image: "Image",
      image_url: "Image URL",
      add_url: "Add URL",
    },
    ar: {
      title: "تحرير الصفحة",
      breadcrumb: 'لوحة التحكم / الصفحات / تحرير "قريباً"',
      language_version: "أنت تقوم بتحرير النسخة الإنجليزية",
      revision_history: "سجل المراجعات",
      name: "الاسم *",
      name_required: "الاسم مطلوب",
      permalink: "الرابط الدائم *",
      preview: "معاينة",
      description: "الوصف",
      short_description: "وصف قصير",
      content: "المحتوى",
      show_hide_editor: "إظهار/إخفاء المحرر",
      add_media: "إضافة وسائط",
      ui_blocks: "كتل واجهة المستخدم",
      templates: "القالب *",
      default: "افتراضي",
      without_layout: "بدون تخطيط",
      coming_soon: "قريباً",
      breadcrumb_style: "نمط مسار التنقل",
      align_start: "محاذاة لليسار",
      align_center: "محاذاة للوسط",
      align_end: "محاذاة لليمين",
      breadcrumb_background: "خلفية مسار التنقل",
      faq_schema: "تكوين مخطط الأسئلة الشائعة",
      learn_more: "تعلم المزيد",
      add_new: "إضافة جديد",
      select_existing: "أو اختر من الأسئلة الشائعة الموجودة",
      seo: "تحسين محركات البحث",
      seo_description:
        "إعداد العنوان الوصفي والوصف لجعل موقعك سهل الاكتشاف على محركات البحث مثل جوجل",
      edit_seo_meta: "تحرير البيانات الوصفية",
      choose_image: "اختر صورة أو أضف من رابط",
      save: "حفظ",
      save_exit: "حفظ وخروج",
      cancel: "إلغاء",
      published: "منشور",
      draft: "مسودة",
      pending: "قيد الانتظار",
      status: "الحالة *",
      languages: "اللغات",
      featured_image: "الصورة",
      image_url: "رابط الصورة",
      add_url: "إضافة الرابط",
    },
  }[language];

  const featuredImage = form.watch("featured_image");
  const breadcrumbBackground = form.watch("breadcrumb_background");
  const faqs = form.watch("faqs") || [];
  const seoData = form.watch("seo") || {};
  const pageName = form.watch("name");

  if (isLoading) {
    return <Loading />;
  }
  if (!dummyPage) {
    return <NotFound />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.title}</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
            {/* Left Column - Main Content */}
            <div className="space-y-6 lg:col-span-4">
              {/* Detail Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Detail</h3>
                </div>

                <div className="space-y-4">
                  <FormField
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <BilingualInput
                            value={field.value}
                            onChange={field.onChange}
                            label={t.name}
                            placeholder={{
                              en: "Enter page name in English",
                              ar: "أدخل اسم الصفحة بالعربية",
                            }}
                            language={language}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Permalink */}
                  <div className="space-y-2">
                    <FormLabel className="text-base font-medium">
                      {t.permalink}
                    </FormLabel>
                    <div className="rounded border bg-gray-50 p-2 text-sm text-gray-600">
                      https://medicova-store.com/
                      {(pageName?.en || pageName?.ar || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}
                    </div>
                    <div className="text-sm text-gray-500">
                      <strong>{t.preview}:</strong> https://medicova-store.com/
                      {(pageName?.en || pageName?.ar || "")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}
                    </div>
                  </div>

                  <FormField
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <BilingualInput
                            value={field.value || { en: "", ar: "" }}
                            onChange={field.onChange}
                            label={t.description}
                            placeholder={{
                              en: "Enter short description in English",
                              ar: "أدخل وصف قصير بالعربية",
                            }}
                            language={language}
                            type="textarea"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Content Editor Section */}
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold">{t.content}</h3>
                    <div className="flex rounded-lg border border-gray-200 p-1">
                      <Button
                        type="button"
                        variant={
                          activeEditorLang === "en" ? "default" : "ghost"
                        }
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => setActiveEditorLang("en")}
                      >
                        EN
                      </Button>
                      <Button
                        type="button"
                        variant={
                          activeEditorLang === "ar" ? "default" : "ghost"
                        }
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => setActiveEditorLang("ar")}
                      >
                        AR
                      </Button>
                    </div>
                  </div>
                </div>
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
                          forPage={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* FAQ Schema Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.faq_schema} </h3>
                </div>
                <FAQManager
                  faqs={faqs}
                  onFaqsChange={handleFaqsChange}
                  language={language}
                />
              </Card>

              {/* SEO Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.seo}</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-medium">{t.edit_seo_meta}</h4>
                    <SEOManager
                      seoData={seoData}
                      onSeoChange={handleSeoChange}
                      language={language}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              {/* Publish Settings */}
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex gap-2">
                    <Button type="submit" variant="outline" className="flex-1">
                      {t.save}
                    </Button>
                    <Button type="submit" className="flex-1">
                      {t.save_exit}
                    </Button>
                  </div>

                  {/* Status as Select */}
                  <div>
                    <h4 className="mb-2 font-medium">{t.status}</h4>
                    <FormField
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="published">
                                {t.published}
                              </SelectItem>
                              <SelectItem value="draft">{t.draft}</SelectItem>
                              <SelectItem value="pending">
                                {t.pending}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Template */}
                  <div>
                    <h4 className="mb-2 font-medium">{t.templates}</h4>
                    <FormField
                      name="template"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="default">
                                {t.default}
                              </SelectItem>
                              <SelectItem value="without-layout">
                                {t.without_layout}
                              </SelectItem>
                              <SelectItem value="coming-soon">
                                {t.coming_soon}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>

              {/* Image */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.featured_image}</h3>
                </div>
                <ImageUpload
                  value={featuredImage ?? "/images/placolder.png"}
                  onChange={handleFeaturedImageChange}
                  language={language}
                  type="featured"
                />
              </Card>

              {/* Breadcrumb Settings */}
              <Card className="p-6">
                <div className="space-y-4">
                  <FormField
                    name="breadcrumb_style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          {t.breadcrumb_style}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="start">
                              {t.align_start}
                            </SelectItem>
                            <SelectItem value="center">
                              {t.align_center}
                            </SelectItem>
                            <SelectItem value="end">{t.align_end}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="text-base font-medium">
                      {t.breadcrumb_background}
                    </FormLabel>
                    <ImageUpload
                      value={breadcrumbBackground ?? "/images/placolder.png"}
                      onChange={handleBreadcrumbBackgroundChange}
                      language={language}
                      type="breadcrumb"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
