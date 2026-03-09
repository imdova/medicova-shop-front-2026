"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
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
import { Card, CardContent } from "@/components/shared/card";
import { Textarea } from "@/components/shared/textarea";
import { dummyCustomers } from "@/constants/customers";
import { createReview } from "@/services/reviewService";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ApiProduct, getProducts } from "@/services/productService";

// ---------------- Schema & Types ----------------
const messages = {
  comment_en_required: {
    en: "Comment in English is required",
    ar: "التعليق بالإنجليزية مطلوب",
  },
  comment_ar_required: {
    en: "Comment in Arabic is required",
    ar: "التعليق بالعربية مطلوب",
  },
  customer_name_en_required: {
    en: "Customer name in English is required",
    ar: "اسم العميل بالإنجليزية مطلوب",
  },
  customer_name_ar_required: {
    en: "Customer name in Arabic is required",
    ar: "اسم العميل بالعربية مطلوب",
  },
  customer_email_required: {
    en: "Customer email is required",
    ar: "البريد الإلكتروني للعميل مطلوب",
  },
  invalid_email: {
    en: "Invalid email address",
    ar: "بريد إلكتروني غير صالح",
  },
  created_at_required: {
    en: "Created date is required",
    ar: "تاريخ الإنشاء مطلوب",
  },
};

const reviewSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  customer_id: z.string().optional(),
  customer_name_en: z.string().optional(),
  customer_name_ar: z.string().optional(),
  customer_email: z
    .string()
    .email(messages.invalid_email.en)
    .min(1, messages.customer_email_required.en),
  rating: z.number().min(1).max(5),
  comment_en: z.string().min(1, messages.comment_en_required.en),
  comment_ar: z.string().min(1, messages.comment_ar_required.en),
  status: z.enum(["published", "draft"]),
  created_at: z.string().min(1, messages.created_at_required.en),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const ratingOptions = [
  { value: 1, label: { en: "1 Star", ar: "1 نجمة" }, stars: "⭐" },
  { value: 2, label: { en: "2 Stars", ar: "2 نجمات" }, stars: "⭐⭐" },
  { value: 3, label: { en: "3 Stars", ar: "3 نجمات" }, stars: "⭐⭐⭐" },
  { value: 4, label: { en: "4 Stars", ar: "4 نجمات" }, stars: "⭐⭐⭐⭐" },
  { value: 5, label: { en: "5 Stars", ar: "5 نجمات" }, stars: "⭐⭐⭐⭐⭐" },
];

// ---------------- Main Component ----------------
export default function CreateReviewPage() {
  const locale = useAppLocale();
  const params = useParams();
  const productSlug = params.slug as string;

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const router = useRouter();

  const [productsList, setProductsList] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      product_id: "",
      customer_id: "",
      customer_name_en: "",
      customer_name_ar: "",
      customer_email: "",
      rating: 5,
      comment_en: "",
      comment_ar: "",
      status: "published",
      created_at: new Date().toISOString().split("T")[0],
    },
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setInitialLoading(true);
      try {
        const prods = await getProducts(token);
        setProductsList(prods);

        // Pre-select product if slug matches
        if (productSlug) {
          const product = prods.find(
            (p: any) =>
              (p as any).slugEn === productSlug ||
              (p as any).slugAr === productSlug ||
              p._id === productSlug,
          );
          if (product) {
            form.setValue("product_id", product._id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
        toast.error(
          locale === "ar" ? "فشل تحميل البيانات" : "Failed to load data",
        );
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [token, productSlug]);

  const onSubmit = async (data: ReviewFormData) => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Prepare final payload as per schema
      const payload = {
        productId: data.product_id,
        rate: data.rating,
        descriptionEn: data.comment_en,
        descriptionAr: data.comment_ar,
        status: "system", // As per user requirement: "لو من الادمن بتكون system"

        // Manual/User fields
        userName: data.customer_name_en,
        UserEmail: data.customer_email,
        nameEn: data.customer_name_en,
        nameAr: data.customer_name_ar,
        date: data.created_at,
      };

      console.log(
        "Creating review with payload:",
        JSON.stringify(payload, null, 2),
      );
      await createReview(payload, token);
      toast.success(
        locale === "ar"
          ? "تم إنشاء التقييم بنجاح"
          : "Review created successfully",
      );
      router.push(`/${locale}/admin/reviews`);
    } catch (error: any) {
      console.error("Submission failed", error);
      toast.error(
        error.message ||
          (locale === "ar" ? "فشل إنشاء التقييم" : "Failed to create review"),
      );
    } finally {
      setLoading(false);
    }
  };

  const t = (
    {
      en: {
        title: "Create Review",
        product: "Product",
        select_product: "Select product",
        customer_name: "Customer name",
        customer_name_en: "Customer name (English)",
        customer_name_ar: "Customer name (Arabic)",
        customer_email: "Customer email",
        email_placeholder: "e.g: example@domain.com",
        star: "Star",
        comment: "Comment",
        comment_en: "Comment (English)",
        comment_ar: "Comment (Arabic)",
        comment_required: "Comment is required",
        status: "Status",
        published: "Published",
        draft: "Draft",
        save: "Save",
        saveExit: "Save & Exit",
        created_at: "Created At",
        images: "Images",
        rating: "Rating",
        select_rating: "Select rating",
        customer_image: "Customer Image",
      },
      ar: {
        title: "إنشاء تقييم",
        product: "المنتج",
        select_product: "اختر المنتج",
        customer_name: "اسم العميل",
        customer_name_en: "اسم العميل (الإنجليزية)",
        customer_name_ar: "اسم العميل (العربية)",
        customer_email: "البريد الإلكتروني للعميل",
        email_placeholder: "مثال: example@domain.com",
        star: "نجمة",
        comment: "التعليق",
        comment_en: "التعليق (الإنجليزية)",
        comment_ar: "التعليق (العربية)",
        comment_required: "التعليق مطلوب",
        status: "الحالة",
        published: "منشور",
        draft: "مسودة",
        save: "حفظ",
        saveExit: "حفظ وخروج",
        created_at: "تاريخ الإنشاء",
        images: "الصور",
        rating: "التقييم",
        select_rating: "اختر التقييم",
        customer_image: "صورة العميل",
      },
    } as any
  )[locale];

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
              {/* Product Selection */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.product} *</h3>
                </div>
                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.select_product} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productsList.map((product) => (
                            <SelectItem key={product._id} value={product._id}>
                              {locale === "ar"
                                ? product.nameAr
                                : product.nameEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Manual Customer Details */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.customer_name} *</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="customer_name_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {t.customer_name_en} *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t.customer_name_en} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customer_name_ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {t.customer_name_ar} *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t.customer_name_ar} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="customer_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {t.customer_email} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.email_placeholder}
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Rating and Comment */}
              <Card className="p-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Rating */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <FormLabel className="text-base">{t.rating} *</FormLabel>
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              value={field.value?.toString() ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t.select_rating} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ratingOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value.toString()}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-yellow-400">
                                        {option.stars}
                                      </span>
                                      <span>{option.label[locale]}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="comment_en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            {t.comment_en} *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t.comment_en}
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="comment_ar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            {t.comment_ar} *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t.comment_ar}
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              {/* Save Buttons */}
              <Card className="p-4">
                <CardContent className="space-y-2 p-0">
                  <Button
                    type="submit"
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t.save}
                  </Button>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {t.saveExit}
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
                      <FormLabel className="text-base">{t.status}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? ""}
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
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Created At */}
              <Card className="p-4">
                <FormField
                  control={form.control}
                  name="created_at"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        {t.created_at} *
                      </FormLabel>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <FormControl>
                          <Input type="date" className="pl-10" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
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
