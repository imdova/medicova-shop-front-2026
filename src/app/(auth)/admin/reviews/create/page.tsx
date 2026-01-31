"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/UI/card";
import { Textarea } from "@/components/UI/textarea";
import { products } from "@/constants/products";
import { dummyCustomers } from "@/constants/customers";
import { formatFullName } from "@/util";
import { ImageUploader, UploadedImage } from "@/components/UI/ImageUploader";

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
  product_id: z.string().optional(),
  customer_id: z.string().optional(),
  customer_name: z.string().optional(),
  customer_email: z
    .string()
    .email(messages.invalid_email.en)
    .min(1, messages.customer_email_required.en),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  status: z.enum(["published", "draft"]),
  created_at: z.string().min(1, messages.created_at_required.en),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const dummyProducts = [
  {
    id: "1",
    name: { en: "Wireless Bluetooth Headphones", ar: "سماعات بلوتوث لاسلكية" },
    slug: "wireless-bluetooth-headphones",
  },
  {
    id: "2",
    name: { en: "Smart Watch Series 5", ar: "ساعة ذكية السلسلة 5" },
    slug: "smart-watch-series-5",
  },
  {
    id: "3",
    name: { en: "Laptop Backpack", ar: "حقيبة كمبيوتر محمول" },
    slug: "laptop-backpack",
  },
  {
    id: "4",
    name: { en: "USB-C Charging Cable", ar: "كابل شحن USB-C" },
    slug: "usb-c-charging-cable",
  },
];

const ratingOptions = [
  { value: 1, label: { en: "1 Star", ar: "1 نجمة" }, stars: "⭐" },
  { value: 2, label: { en: "2 Stars", ar: "2 نجمات" }, stars: "⭐⭐" },
  { value: 3, label: { en: "3 Stars", ar: "3 نجمات" }, stars: "⭐⭐⭐" },
  { value: 4, label: { en: "4 Stars", ar: "4 نجمات" }, stars: "⭐⭐⭐⭐" },
  { value: 5, label: { en: "5 Stars", ar: "5 نجمات" }, stars: "⭐⭐⭐⭐⭐" },
];

// ---------------- Main Component ----------------
export default function CreateReviewPage() {
  const { language } = useLanguage();
  const params = useParams();
  const productSlug = params.slug as string;

  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [customerImages, setCustomerImages] = useState<UploadedImage[]>([]);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      product_id: "",
      customer_id: "",
      customer_name: "",
      customer_email: "",
      rating: 5,
      comment: "",
      status: "published",
      created_at: new Date().toISOString().split("T")[0],
    },
  });

  // Set product if slug is provided
  useEffect(() => {
    if (productSlug) {
      const product = dummyProducts.find((p) => p.slug === productSlug);
      if (product) {
        form.setValue("product_id", product.id);
      }
    }
  }, [productSlug, form]);

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);

    const customer = dummyCustomers.find((c) => c.id === customerId);
    if (customer) {
      form.setValue("customer_id", customer.id);
      form.setValue(
        "customer_name",
        formatFullName(customer.firstName, customer.lastName, language),
      );
      form.setValue("customer_email", customer.email);

      // clear manual image if any
      setCustomerImages([]);
    } else {
      form.setValue("customer_id", "");
      form.setValue("customer_name", "");
      form.setValue("customer_email", "");
    }
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      console.log("Review Data:", data);
      console.log("Uploaded Images:", uploadedImages);
      console.log("Customer Image:", customerImages);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("reviewData", JSON.stringify(data));

      // Attach review images
      uploadedImages.forEach((image) => {
        formData.append("review_images", image.file);
      });

      // Attach manual customer image (if provided)
      if (customerImages.length > 0) {
        formData.append("customer_image", customerImages[0].file);
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Handle successful submission
      console.log("Review submitted successfully!");
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  const t = {
    en: {
      title: "Create Review",
      product: "Product",
      select_product: "Select product",
      choose_customer: "Choose from existing customers",
      select_customer: "Select customer",
      customer_description:
        "Choose a customer to leave a review as them. If you want to enter the customer details manually, leave empty this field and fill the customer name and email fields below.",
      or_enter_manually: "Or enter manually customer details:",
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
      choose_customer: "اختر من العملاء الحاليين",
      select_customer: "اختر العميل",
      customer_description:
        "اختر عميلاً لترك تقييم باسمه. إذا كنت تريد إدخال بيانات العميل يدوياً، اترك هذا الحقل فارغاً واملأ حقلي الاسم والبريد الإلكتروني أدناه.",
      or_enter_manually: "أو أدخل بيانات العميل يدوياً:",
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
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.title[language]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Customer Selection */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.choose_customer}</h3>
                </div>

                <Select
                  value={selectedCustomer}
                  onValueChange={handleCustomerSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.select_customer} />
                  </SelectTrigger>
                  <SelectContent>
                    {dummyCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {formatFullName(
                          customer.firstName,
                          customer.lastName,
                          language,
                        )}{" "}
                        ({customer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="mt-2 text-sm text-gray-600">
                  {t.customer_description}
                </p>

                {/* Manual Customer Details */}
                <Card className="mt-6 p-3">
                  <h4 className="mb-4 text-lg font-semibold">
                    {t.or_enter_manually}
                  </h4>
                  <FormLabel className="text-base">
                    {t.customer_image} *
                  </FormLabel>
                  <ImageUploader
                    images={customerImages}
                    onImagesChange={setCustomerImages}
                    maxFiles={1}
                    maxSize={10}
                    language={language}
                  />
                  {selectedCustomer && (
                    <p className="mt-2 text-xs text-gray-500">
                      {language === "ar"
                        ? "تم اختيار عميل من القائمة — لا يمكن تحميل صورة يدوياً."
                        : "Existing customer selected — manual upload is disabled."}
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            {t.customer_name} *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder={t.customer_name} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                                      <span>{option.label[language]}</span>
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
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            {t.comment} *
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t.comment}
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

              {/* Enhanced Images Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.images}</h3>
                </div>

                <ImageUploader
                  images={uploadedImages}
                  onImagesChange={setUploadedImages}
                  maxFiles={10}
                  maxSize={10}
                  language={language}
                />
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              {/* Save Buttons */}
              <Card className="p-4">
                <CardContent className="space-y-2 p-0">
                  <Button type="submit" variant="outline" className="w-full">
                    {t.save}
                  </Button>
                  <Button type="submit" className="w-full">
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
