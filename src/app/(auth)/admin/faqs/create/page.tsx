"use client";
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
import { useLanguage } from "@/contexts/LanguageContext";

//
// ------------- ZOD Schema -------------
//
const bilingualTextSchema = z.object({
  en: z.string().min(1, "English text is required"),
  ar: z.string().min(1, "Arabic text is required"),
});

const formSchema = z.object({
  question: bilingualTextSchema,
  category: bilingualTextSchema,
  answer: bilingualTextSchema,
  status: z.enum(["draft", "published"]),
});

type FormSchema = z.infer<typeof formSchema>;

//
// ------------- Component -------------
//
export default function FAQCreateForm() {
  const { language } = useLanguage();
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: { en: "", ar: "" },
      category: { en: "", ar: "" },
      answer: { en: "", ar: "" },
      status: "draft",
    },
  });

  const onSubmit = (data: FormSchema) => {
    console.log("✅ Submitted FAQ Data:", data);
  };

  const t = {
    en: {
      title: "Create New FAQ",
      description: "Add a new frequently asked question to your website",
      form_question: "Question",
      form_category: "Category",
      form_answer: "Answer",
      form_status: "Status",
      placeholder_question: "Enter the question",
      placeholder_category: "Select a category",
      placeholder_answer_en: "Enter answer in English",
      placeholder_answer_ar: "Enter answer in Arabic",
      status_draft: "Draft",
      status_published: "Published",
      status_select: "Select status",
      category_select: "Select category",
      submit: "Create FAQ",
      english: "English",
      arabic: "العربية",
      switch_language: "Switch language",
      // Category options
      category_account: "Account",
      category_payments: "Payments",
      category_shipping: "Shipping",
      category_orders: "Orders",
      category_returns: "Returns",
      category_pricing: "Pricing",
      category_general: "General",
    },
    ar: {
      title: "إنشاء سؤال جديد",
      description: "إضافة سؤال شائع جديد إلى موقعك الإلكتروني",
      form_question: "السؤال",
      form_category: "الفئة",
      form_answer: "الإجابة",
      form_status: "الحالة",
      placeholder_question: "أدخل السؤال",
      placeholder_category: "اختر الفئة",
      placeholder_answer_en: "أدخل الإجابة بالإنجليزية",
      placeholder_answer_ar: "أدخل الإجابة بالعربية",
      status_draft: "مسودة",
      status_published: "منشور",
      status_select: "اختر الحالة",
      category_select: "اختر الفئة",
      submit: "إنشاء السؤال",
      english: "English",
      arabic: "العربية",
      switch_language: "تبديل اللغة",
      // Category options
      category_account: "الحساب",
      category_payments: "المدفوعات",
      category_shipping: "الشحن",
      category_orders: "الطلبات",
      category_returns: "الإرجاع",
      category_pricing: "التسعير",
      category_general: "عام",
    },
  }[language];

  const categoryOptions = [
    { value: "account", label: t.category_account },
    { value: "payments", label: t.category_payments },
    { value: "shipping", label: t.category_shipping },
    { value: "orders", label: t.category_orders },
    { value: "returns", label: t.category_returns },
    { value: "pricing", label: t.category_pricing },
    { value: "general", label: t.category_general },
  ];

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
              {/* Question + Category */}
              <Card className="space-y-6 p-6">
                {/* Category - Select */}
                <FormField
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        {t.form_category}
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.category_select} />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Question - Textarea */}
                <FormField
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <BilingualInput
                          value={field.value}
                          onChange={field.onChange}
                          label={t.form_question}
                          placeholder={{
                            en: t.placeholder_question,
                            ar: t.placeholder_question,
                          }}
                          language={language}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Answer - Bilingual Text Editor */}
              <Card className="p-6">
                <FormField
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        {t.form_answer}
                      </FormLabel>
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
