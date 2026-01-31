"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Upload, Undo } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import TextEditor from "@/components/UI/CustomTextEditor";
import Image from "next/image";

// Schema
const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  name_ar: z.string().min(1, "Category name in Arabic is required"),
  slug_en: z.string().min(1, "Slug in English is required"),
  slug_ar: z.string().min(1, "Slug in Arabic is required"),
  icon: z.any().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  headline: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  image: z.any().optional(),
  faqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type FAQ = { question: string; answer: string };

// Translations
const translations = {
  en: {
    title: "Edit Category",
    back: "Back to Categories",
    categoryName: "Category Name",
    categoryNameAr: "Category Name (Arabic)",
    slugEn: "Slug (English)",
    slugAr: "Slug (Arabic)",
    slugNote: "Auto-generated from category name (editable).",
    icon: "Icon",
    uploadIcon: "Upload Icon",
    iconNote: "Optional: Upload an icon file (JPEG, PNG, or WebP).",
    seoTitle: "SEO Meta Information (Optional)",
    seoDescription: "Improve search engine visibility for this category.",
    metaTitle: "Meta Title",
    metaTitlePlaceholder: "Enter meta title.",
    metaTitleNote: "Recommended: 25-40 characters.",
    metaDescription: "Meta Description",
    metaDescriptionPlaceholder: "Enter meta description for search engines.",
    metaDescriptionNote: "Recommended: 150-160 characters.",
    metaKeywords: "Meta Keywords",
    metaKeywordsPlaceholder: "Enter a keyword.",
    metaKeywordsNote: "Press Enter or click + to add a keyword.",
    faqTitle: "Frequently Asked Questions (Optional)",
    faqDescription: "Add common questions and answers about this category.",
    addFaq: "+ Add FAQ",
    categoryImage: "Category Image",
    dragDrop: "Drag and drop an image here",
    orClick: "or click to browse",
    fileTypes: "JPEG, PNG, WebP • Max 5MB",
    headline: "Category Headline",
    headlinePlaceholder: "Enter a catchy headline.",
    headlineNote: "Optional: A short, catchy headline for the category.",
    description: "Description",
    descriptionNote: "Required: Add a detailed description with formatting.",
    submit: "Update",
    cancel: "Cancel",
    required: "*",
    loading: "Loading...",
  },
  ar: {
    title: "تعديل الفئة",
    back: "العودة إلى الفئات",
    categoryName: "اسم الفئة",
    categoryNameAr: "اسم الفئة (العربية)",
    slugEn: "الرابط (الإنجليزية)",
    slugAr: "الرابط (العربية)",
    slugNote: "يتم إنشاؤه تلقائيًا من اسم الفئة (قابل للتعديل).",
    icon: "الأيقونة",
    uploadIcon: "تحميل الأيقونة",
    iconNote: "اختياري: قم بتحميل ملف أيقونة (JPEG أو PNG أو WebP).",
    seoTitle: "معلومات SEO (اختياري)",
    seoDescription: "تحسين ظهور محرك البحث لهذه الفئة.",
    metaTitle: "عنوان Meta",
    metaTitlePlaceholder: "أدخل عنوان meta.",
    metaTitleNote: "موصى به: 25-40 حرفًا.",
    metaDescription: "وصف Meta",
    metaDescriptionPlaceholder: "أدخل وصف meta لمحركات البحث.",
    metaDescriptionNote: "موصى به: 150-160 حرفًا.",
    metaKeywords: "كلمات Meta الرئيسية",
    metaKeywordsPlaceholder: "أدخل كلمة رئيسية.",
    metaKeywordsNote: "اضغط Enter أو انقر + لإضافة كلمة رئيسية.",
    faqTitle: "الأسئلة الشائعة (اختياري)",
    faqDescription: "أضف أسئلة وإجابات شائعة حول هذه الفئة.",
    addFaq: "+ إضافة سؤال",
    categoryImage: "صورة الفئة",
    dragDrop: "اسحب وأفلت صورة هنا",
    orClick: "أو انقر للتصفح",
    fileTypes: "JPEG, PNG, WebP • الحد الأقصى 5 ميجابايت",
    headline: "عنوان الفئة",
    headlinePlaceholder: "أدخل عنوانًا جذابًا.",
    headlineNote: "اختياري: عنوان قصير وجذاب للفئة.",
    description: "الوصف",
    descriptionNote: "مطلوب: أضف وصفًا تفصيليًا مع التنسيق.",
    submit: "تحديث",
    cancel: "إلغاء",
    required: "*",
    loading: "جاري التحميل...",
  },
};

// Mock data - replace with actual API call
const getCategoryData = (slug: string) => {
  // This would be an API call in a real app
  return {
    name: "Sample Category",
    name_ar: "فئة نموذجية",
    slug_en: slug,
    slug_ar: "فئة-نموذجية",
    metaTitle: "Sample Meta Title",
    metaDescription: "Sample meta description for SEO",
    metaKeywords: ["keyword1", "keyword2", "keyword3"],
    headline: "Catchy Headline",
    description: "<p>Sample description with formatting</p>",
    imageUrl: "/images/landau.jpg",
    iconUrl: "/images/icon.png",
    faqs: [
      { question: "What is this category?", answer: "This is a sample category." },
      { question: "How to use it?", answer: "You can use it for organizing products." },
    ],
  };
};

export default function EditCategoryPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const t = translations[language];
  const isRTL = language === "ar";
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      name_ar: "",
      slug_en: "",
      slug_ar: "",
      metaKeywords: [],
      faqs: [],
    },
  });

  // Load category data
  useEffect(() => {
    const loadCategoryData = async () => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const categoryData = getCategoryData(slug);
        form.reset({
          name: categoryData.name,
          name_ar: categoryData.name_ar,
          slug_en: categoryData.slug_en,
          slug_ar: categoryData.slug_ar,
          metaTitle: categoryData.metaTitle,
          metaDescription: categoryData.metaDescription,
          metaKeywords: categoryData.metaKeywords,
          headline: categoryData.headline,
          description: categoryData.description,
          faqs: categoryData.faqs,
        });
        setKeywords(categoryData.metaKeywords);
        setFaqs(categoryData.faqs);
        if (categoryData.imageUrl) {
          setImagePreview(categoryData.imageUrl);
        }
        if (categoryData.iconUrl) {
          setIconPreview(categoryData.iconUrl);
        }
        setIsLoading(false);
      }, 500);
    };

    if (slug) {
      loadCategoryData();
    }
  }, [slug, form]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    // Auto-generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    form.setValue("slug_en", slug);
  };

  const handleNameArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameAr = e.target.value;
    form.setValue("name_ar", nameAr);
    // Auto-generate Arabic slug from Arabic name
    const slugAr = nameAr
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/(^-|-$)/g, "");
    form.setValue("slug_ar", slugAr);
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()];
      setKeywords(newKeywords);
      form.setValue("metaKeywords", newKeywords);
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    form.setValue("metaKeywords", newKeywords);
  };

  const addFAQ = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
    form.setValue("faqs", newFaqs);
  };

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      form.setValue("image", e.target.files as FileList);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("icon", e.target.files as FileList);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      form.setValue("image", dataTransfer.files);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data: CategoryFormData) => {
    console.log("Category data:", data);
    // Handle form submission
    router.push("/admin/product-settings");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
        <p className="text-lg">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <Link
            href="/admin/product-settings"
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            {t.back}
          </Link>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Category Setup */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Category Setup</h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {t.categoryName} <span className="text-red-500">{t.required}</span>
                    </label>
                    <input
                      type="text"
                      {...form.register("name")}
                      onChange={handleNameChange}
                      placeholder="Enter category name"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {form.formState.errors.name && (
                      <p className="mt-1 text-xs text-red-600">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {t.categoryNameAr} <span className="text-red-500">{t.required}</span>
                    </label>
                    <input
                      type="text"
                      {...form.register("name_ar")}
                      onChange={handleNameArChange}
                      placeholder="Enter category name in Arabic"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {form.formState.errors.name_ar && (
                      <p className="mt-1 text-xs text-red-600">
                        {form.formState.errors.name_ar.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {t.slugEn} <span className="text-red-500">{t.required}</span>
                    </label>
                    <input
                      type="text"
                      {...form.register("slug_en")}
                      placeholder="category-slug"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t.slugNote}</p>
                    {form.formState.errors.slug_en && (
                      <p className="mt-1 text-xs text-red-600">
                        {form.formState.errors.slug_en.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {t.slugAr} <span className="text-red-500">{t.required}</span>
                    </label>
                    <input
                      type="text"
                      {...form.register("slug_ar")}
                      placeholder="رابط-الفئة"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t.slugNote}</p>
                    {form.formState.errors.slug_ar && (
                      <p className="mt-1 text-xs text-red-600">
                        {form.formState.errors.slug_ar.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">{t.icon}</label>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Upload size={16} />
                        {t.uploadIcon}
                      </button>
                      <input
                        ref={iconInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleIconChange}
                        className="hidden"
                      />
                      {iconPreview && (
                        <div className="relative inline-block">
                          <Image
                            src={iconPreview}
                            alt="Icon preview"
                            width={64}
                            height={64}
                            className="rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIconPreview(null);
                              form.setValue("icon", undefined);
                            }}
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">{t.iconNote}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Meta Information */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-1 text-lg font-semibold">{t.seoTitle}</h2>
                <p className="mb-4 text-sm text-gray-600">{t.seoDescription}</p>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t.metaTitle}</label>
                    <input
                      type="text"
                      {...form.register("metaTitle")}
                      placeholder={t.metaTitlePlaceholder}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t.metaTitleNote}</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {t.metaDescription}
                    </label>
                    <textarea
                      {...form.register("metaDescription")}
                      placeholder={t.metaDescriptionPlaceholder}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t.metaDescriptionNote}</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">{t.metaKeywords}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={handleKeywordKeyPress}
                        placeholder={t.metaKeywordsPlaceholder}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{t.metaKeywordsNote}</p>
                    {keywords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeKeyword(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-1 text-lg font-semibold">{t.faqTitle}</h2>
                <p className="mb-4 text-sm text-gray-600">{t.faqDescription}</p>

                <button
                  type="button"
                  onClick={addFAQ}
                  className="mb-4 flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Plus size={16} />
                  {t.addFaq}
                </button>

                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">FAQ {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeFAQ(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFAQ(index, "question", e.target.value)}
                          placeholder="Question"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                          placeholder="Answer"
                          rows={2}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Category Image */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">{t.categoryImage}</h2>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-primary"
                >
                  {imagePreview ? (
                    <div className="relative w-full">
                      <Image
                        src={imagePreview}
                        alt="Category preview"
                        width={400}
                        height={200}
                        className="mx-auto rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                          form.setValue("image", undefined);
                        }}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={48} className="mb-4 text-gray-400" />
                      <p className="mb-2 text-sm font-medium text-gray-700">
                        {t.dragDrop}
                      </p>
                      <p className="text-sm text-gray-500">{t.orClick}</p>
                      <p className="mt-2 text-xs text-gray-400">{t.fileTypes}</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Category Headline */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <label className="mb-2 block text-sm font-medium">{t.headline}</label>
                <input
                  type="text"
                  {...form.register("headline")}
                  placeholder={t.headlinePlaceholder}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-xs text-gray-500">{t.headlineNote}</p>
              </div>

              {/* Description */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <label className="mb-2 block text-sm font-medium">
                  {t.description} <span className="text-red-500">{t.required}</span>
                </label>
                <div className="relative">
                  <TextEditor
                    value={form.watch("description") || ""}
                    onChange={(value) => form.setValue("description", value)}
                    language={language}
                    showEditor={true}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-md border border-gray-300 bg-white p-1.5 hover:bg-gray-50"
                    title="Undo"
                  >
                    <Undo size={14} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">{t.descriptionNote}</p>
                {form.formState.errors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              {t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

