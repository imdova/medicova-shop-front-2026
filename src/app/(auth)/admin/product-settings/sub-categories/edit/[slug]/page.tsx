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
const subCategorySchema = z.object({
  name: z.string().min(1, "Sub category name is required"),
  name_ar: z.string().min(1, "Sub category name in Arabic is required"),
  slug_en: z.string().min(1, "Slug in English is required"),
  slug_ar: z.string().min(1, "Slug in Arabic is required"),
  priority: z.number().optional(),
  parentCategory: z.string().min(1, "Parent category is required"),
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

type SubCategoryFormData = z.infer<typeof subCategorySchema>;
type FAQ = { question: string; answer: string };

// Translations
const translations = {
  en: {
    title: "Edit Sub Category",
    back: "Back to Sub Categories",
    subCategoryName: "Sub Category Name",
    subCategoryNameAr: "Sub Category Name (Arabic)",
    slugEn: "Slug (English)",
    slugAr: "Slug (Arabic)",
    slugNote: "Auto-generated from name (editable).",
    priority: "Priority",
    priorityNote: "Optional: Display order for the subcategory (defaults to 0).",
    parentCategory: "Parent Category",
    chooseParent: "Choose Parent Category",
    icon: "Icon",
    uploadIcon: "Upload Icon",
    iconNote: "Optional: Upload an icon file (JPEG, PNG, or WebP).",
    seoTitle: "SEO Meta Information (Optional)",
    seoDescription: "Improve search engine visibility for this subcategory.",
    metaTitle: "Meta Title",
    metaTitlePlaceholder: "Enter meta title.",
    metaTitleNote: "Recommended: 50-60 characters.",
    metaDescription: "Meta Description",
    metaDescriptionPlaceholder: "Enter meta description for search engines.",
    metaDescriptionNote: "Recommended: 150-160 characters.",
    metaKeywords: "Meta Keywords",
    metaKeywordsPlaceholder: "Enter a keyword.",
    metaKeywordsNote: "Press Enter or click + to add a keyword.",
    faqTitle: "Frequently Asked Questions (Optional)",
    faqDescription: "Add common questions and answers about this subcategory.",
    addFaq: "+ Add FAQ",
    subCategoryImage: "Sub Category Image",
    dragDrop: "Drag and drop an image here",
    orClick: "or click to browse",
    fileTypes: "JPEG, PNG, WebP • Max 5MB",
    headline: "Sub Category Headline",
    headlinePlaceholder: "Enter a catchy headline.",
    headlineNote: "Optional: A short, catchy headline for the subcategory.",
    description: "Description",
    descriptionNote: "Required: Add a detailed description with formatting.",
    submit: "Update",
    cancel: "Cancel",
    required: "*",
    loading: "Loading...",
  },
  ar: {
    title: "تعديل الفئة الفرعية",
    back: "العودة إلى الفئات الفرعية",
    subCategoryName: "اسم الفئة الفرعية",
    subCategoryNameAr: "اسم الفئة الفرعية (العربية)",
    slugEn: "الرابط (الإنجليزية)",
    slugAr: "الرابط (العربية)",
    slugNote: "يتم إنشاؤه تلقائيًا من الاسم (قابل للتعديل).",
    priority: "الأولوية",
    priorityNote: "اختياري: ترتيب العرض للفئة الفرعية (افتراضي 0).",
    parentCategory: "الفئة الرئيسية",
    chooseParent: "اختر الفئة الرئيسية",
    icon: "الأيقونة",
    uploadIcon: "تحميل الأيقونة",
    iconNote: "اختياري: قم بتحميل ملف أيقونة (JPEG أو PNG أو WebP).",
    seoTitle: "معلومات SEO (اختياري)",
    seoDescription: "تحسين ظهور محرك البحث لهذه الفئة الفرعية.",
    metaTitle: "عنوان Meta",
    metaTitlePlaceholder: "أدخل عنوان meta.",
    metaTitleNote: "موصى به: 50-60 حرفًا.",
    metaDescription: "وصف Meta",
    metaDescriptionPlaceholder: "أدخل وصف meta لمحركات البحث.",
    metaDescriptionNote: "موصى به: 150-160 حرفًا.",
    metaKeywords: "كلمات Meta الرئيسية",
    metaKeywordsPlaceholder: "أدخل كلمة رئيسية.",
    metaKeywordsNote: "اضغط Enter أو انقر + لإضافة كلمة رئيسية.",
    faqTitle: "الأسئلة الشائعة (اختياري)",
    faqDescription: "أضف أسئلة وإجابات شائعة حول هذه الفئة الفرعية.",
    addFaq: "+ إضافة سؤال",
    subCategoryImage: "صورة الفئة الفرعية",
    dragDrop: "اسحب وأفلت صورة هنا",
    orClick: "أو انقر للتصفح",
    fileTypes: "JPEG, PNG, WebP • الحد الأقصى 5 ميجابايت",
    headline: "عنوان الفئة الفرعية",
    headlinePlaceholder: "أدخل عنوانًا جذابًا.",
    headlineNote: "اختياري: عنوان قصير وجذاب للفئة الفرعية.",
    description: "الوصف",
    descriptionNote: "مطلوب: أضف وصفًا تفصيليًا مع التنسيق.",
    submit: "تحديث",
    cancel: "إلغاء",
    required: "*",
    loading: "جاري التحميل...",
  },
};

// Mock categories - replace with actual API call
const mockCategories = [
  { id: "1", name: { en: "Electronics", ar: "إلكترونيات" } },
  { id: "2", name: { en: "Clothing", ar: "ملابس" } },
  { id: "3", name: { en: "Home & Garden", ar: "المنزل والحديقة" } },
];

// Mock data - replace with actual API call
const getSubCategoryData = (slug: string) => {
  return {
    name: "Sample Sub Category",
    name_ar: "فئة فرعية نموذجية",
    slug_en: slug,
    slug_ar: "فئة-فرعية-نموذجية",
    priority: 1,
    parentCategory: "1",
    metaTitle: "Sample Meta Title",
    metaDescription: "Sample meta description for SEO",
    metaKeywords: ["keyword1", "keyword2", "keyword3"],
    headline: "Catchy Headline",
    description: "<p>Sample description with formatting</p>",
    imageUrl: "/images/landau.jpg",
    iconUrl: "/images/icon.png",
    faqs: [
      { question: "What is this subcategory?", answer: "This is a sample subcategory." },
      { question: "How to use it?", answer: "You can use it for organizing products." },
    ],
  };
};

export default function EditSubCategoryPage() {
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

  const form = useForm<SubCategoryFormData>({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      name: "",
      name_ar: "",
      slug_en: "",
      slug_ar: "",
      priority: 0,
      parentCategory: "",
      metaKeywords: [],
      faqs: [],
    },
  });

  // Load subcategory data
  useEffect(() => {
    const loadSubCategoryData = async () => {
      setIsLoading(true);
      setTimeout(() => {
        const subCategoryData = getSubCategoryData(slug);
        form.reset({
          name: subCategoryData.name,
          name_ar: subCategoryData.name_ar,
          slug_en: subCategoryData.slug_en,
          slug_ar: subCategoryData.slug_ar,
          priority: subCategoryData.priority,
          parentCategory: subCategoryData.parentCategory,
          metaTitle: subCategoryData.metaTitle,
          metaDescription: subCategoryData.metaDescription,
          metaKeywords: subCategoryData.metaKeywords,
          headline: subCategoryData.headline,
          description: subCategoryData.description,
          faqs: subCategoryData.faqs,
        });
        setKeywords(subCategoryData.metaKeywords);
        setFaqs(subCategoryData.faqs);
        if (subCategoryData.imageUrl) {
          setImagePreview(subCategoryData.imageUrl);
        }
        if (subCategoryData.iconUrl) {
          setIconPreview(subCategoryData.iconUrl);
        }
        setIsLoading(false);
      }, 500);
    };

    if (slug) {
      loadSubCategoryData();
    }
  }, [slug, form]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
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

  const onSubmit = (data: SubCategoryFormData) => {
    console.log("Sub Category data:", data);
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
            {/* Left Column - Same structure as create page */}
            <div className="space-y-6">
              {/* Sub Category Setup */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Sub Category Setup</h2>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {t.subCategoryName} <span className="text-red-500">{t.required}</span>
                    </label>
                    <input
                      type="text"
                      {...form.register("name")}
                      onChange={handleNameChange}
                      placeholder="Enter subcategory name"
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
                      {t.subCategoryNameAr} <span className="text-red-500">{t.required}</span>
                    </label>
                    <input
                      type="text"
                      {...form.register("name_ar")}
                      onChange={handleNameArChange}
                      placeholder="Enter subcategory name in Arabic"
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
                      placeholder="subcategory-slug"
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
                      placeholder="رابط-الفئة-الفرعية"
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
                    <label className="mb-2 block text-sm font-medium">{t.priority}</label>
                    <input
                      type="number"
                      {...form.register("priority", { valueAsNumber: true })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t.priorityNote}</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {t.parentCategory} <span className="text-red-500">{t.required}</span>
                    </label>
                    <select
                      {...form.register("parentCategory")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">{t.chooseParent}</option>
                      {mockCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name[language]}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.parentCategory && (
                      <p className="mt-1 text-xs text-red-600">
                        {form.formState.errors.parentCategory.message}
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

            {/* Right Column - Same structure as create page */}
            <div className="space-y-6">
              {/* Sub Category Image */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">{t.subCategoryImage}</h2>
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
                        alt="Sub Category preview"
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

              {/* Sub Category Headline */}
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

