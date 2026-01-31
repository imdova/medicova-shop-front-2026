"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Switch } from "@/components/UI/switch";
import {
  BilingualInput,
  BilingualTextEditor,
} from "@/components/PageEditor/BilingualInput";
import { FAQManager } from "@/components/PageEditor/FAQManager";
import SEOManager from "@/components/PageEditor/SEOManager";
import ImageUpload from "@/components/PageEditor/ImageUpload";
import {
  faqSchema,
  pageSchema,
  seoSchema,
} from "@/constants/schemas/BuildPage";

type FAQItem = z.infer<typeof faqSchema>;
type SEOData = z.infer<typeof seoSchema>;
type PageFormData = z.infer<typeof pageSchema>;

// ---------------- Main Component ----------------
export default function CreatePage() {
  const { language } = useLanguage();

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      description: { en: "", ar: "" },
      content: {
        en: "<p>Start writing your content in English...</p>",
        ar: "<p>ابدأ كتابة المحتوى بالعربية...</p>",
      },
      template: "home",
      breadcrumb_style: "start",
      featured_image: "",
      faqs: [],
      seo: {
        meta_title: { en: "", ar: "" },
        meta_description: { en: "", ar: "" },
        meta_image: "",
      },
    },
  });

  const onSubmit = async (data: PageFormData) => {
    try {
      console.log("Page Data with FAQ and SEO:", data);
      // Here you would typically send to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Handle successful submission
    } catch (error) {
      console.error("Submission failed", error);
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

  const t = {
    en: {
      title: "Create New Page",
      name: "Name",
      name_required: "Name is required",
      permalink: "Permalink",
      preview: "Preview",
      description: "Description",
      short_description: "Short description",
      content: "Content",
      show_hide_editor: "Show/Hide Editor",
      add_media: "Add media",
      ui_blocks: "UI Blocks",
      templates: "Templates",
      default: "Default",
      image: "Image",
      breadcrumb_style: "Breadcrumb style",
      align_start: "Align start",
      align_center: "Align center",
      align_end: "Align end",
      show_breadcrumb: "Show breadcrumb",
      faq_schema: "FAQ schema configuration",
      learn_more: "Learn more",
      add_new: "Add new",
      select_existing: "Select from existing FAQs",
      seo: "Search Engine Optimization",
      seo_description:
        "Setup meta title & description to make your site easy to discover on search engines such as Google",
      edit_seo_meta: "Edit SEO meta",
      choose_image: "Choose image",
      add_from_url: "Add from URL",
      save: "Save",
      cancel: "Cancel",
      published: "Published",
      featured_image: "Featured Image",
      image_url: "Image URL",
      add_url: "Add URL",
    },
    ar: {
      title: "إنشاء صفحة جديدة",
      name: "الاسم",
      name_required: "الاسم مطلوب",
      permalink: "الرابط الدائم",
      preview: "معاينة",
      description: "الوصف",
      short_description: "وصف قصير",
      content: "المحتوى",
      show_hide_editor: "إظهار/إخفاء المحرر",
      add_media: "إضافة وسائط",
      ui_blocks: "كتل واجهة المستخدم",
      templates: "القوالب",
      default: "افتراضي",
      image: "صورة",
      breadcrumb_style: "نمط مسار التنقل",
      align_start: "محاذاة لليسار",
      align_center: "محاذاة للوسط",
      align_end: "محاذاة لليمين",
      show_breadcrumb: "إظهار مسار التنقل",
      faq_schema: "تكوين مخطط الأسئلة الشائعة",
      learn_more: "تعلم المزيد",
      add_new: "إضافة جديد",
      select_existing: "اختر من الأسئلة الشائعة الموجودة",
      seo: "تحسين محركات البحث",
      seo_description:
        "إعداد العنوان الوصفي والوصف لجعل موقعك سهل الاكتشاف على محركات البحث مثل جوجل",
      edit_seo_meta: "تحرير البيانات الوصفية",
      choose_image: "اختر صورة",
      add_from_url: "إضافة من رابط",
      save: "حفظ",
      cancel: "إلغاء",
      published: "منشور",
      featured_image: "الصورة الرئيسية",
      image_url: "رابط الصورة",
      add_url: "إضافة الرابط",
    },
  }[language];

  const featuredImage = form.watch("featured_image");
  const faqs = form.watch("faqs") || [];
  const seoData = form.watch("seo") as SEOData;

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
              {/* Name & Description Section */}
              <Card className="p-6">
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

                  {/* Permalink Preview */}
                  <div className="space-y-2">
                    <FormLabel className="text-base font-medium">
                      {t.permalink}
                    </FormLabel>
                    <div className="rounded border bg-gray-50 p-2 text-sm text-gray-600">
                      https://medicova-store.com/
                    </div>
                    <div className="text-sm text-gray-500">
                      <strong>{t.preview}:</strong> https://medicova-store.com/
                    </div>
                  </div>

                  <FormField
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <BilingualInput
                            value={field.value}
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
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.content}</h3>
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
                  <p className="mt-1 text-sm text-gray-600">
                    {t.seo_description}
                  </p>
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
              {/* Template Selection */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.templates}</h3>
                </div>
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
                          <SelectItem value="default">{t.default}</SelectItem>
                          <SelectItem value="image">{t.image}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
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

                  <FormField
                    name="show_breadcrumb"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <FormLabel className="text-base">
                          {t.show_breadcrumb}
                        </FormLabel>
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

              {/* Featured Image */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.featured_image}</h3>
                </div>
                <ImageUpload
                  value={featuredImage ?? "/images/placholder.png"}
                  onChange={handleFeaturedImageChange}
                  language={language}
                  type="featured"
                />
              </Card>

              {/* Publish Settings */}
              <Card className="p-6">
                <div className="space-y-4">
                  <FormField
                    name="is_published"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0">
                        <FormLabel className="text-base">
                          {t.published}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {t.save}
                    </Button>
                    <Button type="button" variant="outline" className="flex-1">
                      {t.cancel}
                    </Button>
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
