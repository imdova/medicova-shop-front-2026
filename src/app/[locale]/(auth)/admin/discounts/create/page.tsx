"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useEffect, useMemo, useState } from "react";
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
import { Switch } from "@/components/shared/switch";
import { getProducts, ApiProduct } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import {
  createDiscount,
  CreateDiscountPayload,
} from "@/services/discountService";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loading from "@/app/[locale]/loading";
import { Product } from "@/types/product";
import { CategoryType } from "@/types";
import { Checkbox } from "@/components/shared/Check-Box";
import { Link } from "@/i18n/navigation";
import { CalendarDays, ChevronDown, Plus, Search, Tag } from "lucide-react";

// ---------------- Schema & Types ----------------
const messages = {
  coupon_code_required: {
    en: "Coupon code is required",
    ar: "كود الخصم مطلوب",
  },
  value_required: {
    en: "Discount value is required",
    ar: "قيمة الخصم مطلوبة",
  },
  start_date_required: {
    en: "Start date is required",
    ar: "تاريخ البدء مطلوب",
  },
  end_date_required: {
    en: "End date is required",
    ar: "تاريخ الانتهاء مطلوب",
  },
  minimum_amount_required: {
    en: "Minimum amount is required",
    ar: "المبلغ الأدنى مطلوب",
  },
  products_required: {
    en: "At least one product must be selected",
    ar: "يجب اختيار منتج واحد على الأقل",
  },
  categories_required: {
    en: "At least one category must be selected",
    ar: "يجب اختيار فئة واحدة على الأقل",
  },
};

const discountSchema = z
  .object({
    type: z.enum(["coupon", "promotion"]),
    coupon_code: z.string().min(1, messages.coupon_code_required.en),
    discount_type: z.enum(["fixed", "percentage", "shipping"]),
    value: z.number().min(0.01, messages.value_required.en),
    apply_for: z.enum([
      "all_orders",
      "specific_products",
      "specific_categories",
      "minimum_amount",
    ]),
    start_date: z.string().min(1, messages.start_date_required.en),
    end_date: z.string().min(1, messages.end_date_required.en),
    can_use_with_promotion: z.boolean(),
    can_use_with_flash_sale: z.boolean(),
    is_unlimited: z.boolean(),
    apply_via_url: z.boolean(),
    display_at_checkout: z.boolean(),
    never_expired: z.boolean(),
    minimum_amount: z.number().min(0).optional(),
    selected_products: z.array(z.string()).optional(),
    selected_categories: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.apply_for === "minimum_amount") {
        return data.minimum_amount !== undefined && data.minimum_amount > 0;
      }
      return true;
    },
    {
      message: messages.minimum_amount_required.en,
      path: ["minimum_amount"],
    },
  )
  .refine(
    (data) => {
      if (data.apply_for === "specific_products") {
        return data.selected_products && data.selected_products.length > 0;
      }
      return true;
    },
    {
      message: messages.products_required.en,
      path: ["selected_products"],
    },
  )
  .refine(
    (data) => {
      if (data.apply_for === "specific_categories") {
        return data.selected_categories && data.selected_categories.length > 0;
      }
      return true;
    },
    {
      message: messages.categories_required.en,
      path: ["selected_categories"],
    },
  );

type DiscountFormData = z.infer<typeof discountSchema>;

// ---------------- Component ----------------
export default function CreateDiscountPage() {
  const locale = useAppLocale();
  const isRTL = locale === "ar";
  const formId = "create-discount-form";
  const [discountType, setDiscountType] = useState<
    "fixed" | "percentage" | "shipping"
  >("fixed");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      type: "coupon",
      coupon_code: "",
      discount_type: "fixed",
      value: 0,
      apply_for: "all_orders",
      start_date: "",
      end_date: "",
      can_use_with_promotion: false,
      can_use_with_flash_sale: false,
      is_unlimited: true,
      apply_via_url: false,
      display_at_checkout: false,
      never_expired: false,
      minimum_amount: 0,
      selected_products: [],
      selected_categories: [],
    },
  });

  const applyFor = form.watch("apply_for");
  const watchCoupon = form.watch("coupon_code");
  const watchDiscountType = form.watch("discount_type");
  const watchValue = form.watch("value");
  const watchStart = form.watch("start_date");
  const watchEnd = form.watch("end_date");
  const watchNever = form.watch("never_expired");
  const watchCanPromo = form.watch("can_use_with_promotion");
  const watchCanFlash = form.watch("can_use_with_flash_sale");
  const watchViaUrl = form.watch("apply_via_url");
  const watchAtCheckout = form.watch("display_at_checkout");

  useEffect(() => {
    // Update form values when selections change
    form.setValue("selected_products", selectedProducts);
    form.setValue("selected_categories", selectedCategories);
  }, [selectedProducts, selectedCategories, form]);

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const user = (session as any)?.user;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products and categories
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [prodData, catData] = await Promise.all([
          getProducts(token),
          getCategories(token),
        ]);
        setProducts(prodData as any);
        setCategories(catData as any);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error(
          isRTL ? "فشل تحميل البيانات" : "Failed to load products/categories",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, isRTL]);

  const onSubmit = async (data: DiscountFormData) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const payload: CreateDiscountPayload = {
        sellerId:
          user?.role === "admin"
            ? (user as any)?.id || "507f1f77bcf86cd799439011"
            : (user as any)?.storeId || (user as any)?.id,
        discountName: data.coupon_code,
        method:
          data.type === "promotion" ? "automatic_discount" : "discount_code",
        discountCode: data.coupon_code,
        discountType: data.discount_type,
        discountValue: data.value,
        appliesTo:
          data.apply_for === "all_orders" ? "all_products" : data.apply_for,
        productIds: data.selected_products || [],
        categoryIds: data.selected_categories || [],
        subcategoryIds: [],
        availableOnAllSalesChannels: true,
        eligibility: "all_customers",
        customerSegmentIds: [],
        customerIds: [],
        startDate: data.start_date, // YYYY-MM-DD
        startTime: "00:00",
        endDate: data.never_expired ? "2099-12-31" : data.end_date, // YYYY-MM-DD
        endTime: "23:59",
        active: true,
        status: computedStatus || "active",
      };


      console.log("Discount Payload:", payload);
      await createDiscount(payload, token);

      toast.success(
        isRTL ? "تم إنشاء الخصم بنجاح" : "Discount created successfully",
      );
      router.push("/admin/discounts");
    } catch (error: any) {
      console.error("Submission failed", error);
      toast.error(
        error.message ||
          (isRTL ? "فشل إنشاء الخصم" : "Failed to create discount"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const t = {
    en: {
      title: "Create Discount",
      select_type: "Select type of discount",
      coupon_code: "Coupon code",
      create_coupon_code: "Create coupon code",
      coupon_description:
        "Customers will enter this coupon code when they checkout.",
      can_use_with_promotion: "Can be used with promotion?",
      can_use_with_flash_sale: "Can be used with flash sale?",
      flash_sale_description:
        "Allows customers to apply the coupon to items already on flash sale, enabling combined discounts.",
      unlimited_coupon: "Unlimited coupon?",
      apply_via_url: "Apply via URL?",
      url_description:
        "This setting will apply coupon code when customers access the URL with the parameter 'coupon-code'.",
      display_at_checkout: "Display coupon code at the checkout page?",
      checkout_description:
        "The list of coupon codes will be displayed at the checkout page and customers can choose to apply.",
      time: "Time",
      start_date: "Start date",
      end_date: "End date",
      never_expired: "Never expired?",
      save: "Save",
      coupon_type: "Coupon type",
      discount: "Discount",
      apply_for: "apply for",
      all_orders: "All orders",
      specific_products: "Specific products",
      specific_categories: "Specific categories",
      minimum_amount: "Minimum amount",
      fixed_amount: "Fixed amount",
      percentage: "Percentage",
      free_shipping: "Free shipping",
      required: "Required",
      yes: "Yes",
      no: "No",
      select_products: "Select Products",
      select_categories: "Select Categories",
      selected_items: "Selected items",
      search_placeholder: "Search...",
      minimum_amount_label: "Minimum Order Amount",
      minimum_amount_description:
        "Set the minimum order amount required to apply this discount",
      enter_minimum_amount: "Enter minimum amount",
    },
    ar: {
      title: "إنشاء خصم",
      select_type: "اختر نوع الخصم",
      coupon_code: "كود الخصم",
      create_coupon_code: "إنشاء كود الخصم",
      coupon_description:
        "سيقوم العملاء بإدخال كود الخصم هذا عند إتمام الشراء.",
      can_use_with_promotion: "يمكن استخدامه مع العروض الترويجية؟",
      can_use_with_flash_sale: "يمكن استخدامه مع العروض السريعة؟",
      flash_sale_description:
        "يسمح للعملاء بتطبيق الكوبون على العناصر المعروضة بالفعل في العروض السريعة، مما يتيح الخصومات المجمعة.",
      unlimited_coupon: "كوبون غير محدود؟",
      apply_via_url: "التطبيق عبر الرابط؟",
      url_description:
        "سيتم تطبيق كود الخصم عندما يصل العملاء إلى الرابط مع المعلمة 'coupon-code'.",
      display_at_checkout: "عرض كود الخصم في صفحة الدفع؟",
      checkout_description:
        "سيتم عرض قائمة أكواد الخصم في صفحة الدفع ويمكن للعملاء اختيار التطبيق.",
      time: "الوقت",
      start_date: "تاريخ البدء",
      end_date: "تاريخ الانتهاء",
      never_expired: "لا ينتهي أبدًا؟",
      save: "حفظ",
      coupon_type: "نوع الكوبون",
      discount: "خصم",
      apply_for: "يطبق على",
      all_orders: "جميع الطلبات",
      specific_products: "منتجات محددة",
      specific_categories: "فئات محددة",
      minimum_amount: "حد أدنى للمبلغ",
      fixed_amount: "مبلغ ثابت",
      percentage: "نسبة مئوية",
      free_shipping: "شحن مجاني",
      required: "مطلوب",
      yes: "نعم",
      no: "لا",
      select_products: "اختر المنتجات",
      select_categories: "اختر الفئات",
      selected_items: "العناصر المختارة",
      search_placeholder: "بحث...",
      minimum_amount_label: "الحد الأدنى لمبلغ الطلب",
      minimum_amount_description:
        "حدد الحد الأدنى لمبلغ الطلب المطلوب لتطبيق هذا الخصم",
      enter_minimum_amount: "أدخل الحد الأدنى للمبلغ",
    },
  }[locale];

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p: any) =>
      ((p.nameAr || "") + (p.nameEn || "")).toLowerCase().includes(q),
    );
  }, [productQuery, products]);

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c: any) =>
      ((c.title?.[locale] || c.title?.en || "") as string)
        .toLowerCase()
        .includes(q),
    );
  }, [categoryQuery, categories, locale]);

  const computedStatus = useMemo(() => {
    const now = Date.now();
    const start = watchStart ? new Date(watchStart).getTime() : NaN;
    const end = watchEnd ? new Date(watchEnd).getTime() : NaN;
    if (watchNever) return "active";
    if (!Number.isNaN(start) && start > now) return "scheduled";
    if (!Number.isNaN(end) && end < now) return "expired";
    return "active";
  }, [watchStart, watchEnd, watchNever]);

  const statusChip =
    computedStatus === "active"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
      : computedStatus === "scheduled"
        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200";

  if (isLoading || isSubmitting) return <Loading />;

  return (
    <div
      className="animate-in fade-in space-y-8 duration-700"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Tag className="h-3.5 w-3.5" />
            </span>
            <Link href="/admin/discounts" className="hover:text-slate-700">
              {isRTL ? "الخصومات" : "Discounts"}
            </Link>
            <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
            <span className="truncate">{t.title}</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {isRTL ? "إنشاء خصم جديد" : "Create New Discount"}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {isRTL
              ? "قم بإنشاء كوبون أو حملة ترويجية مع قواعد تطبيق واضحة."
              : "Create a coupon or promotion with clear eligibility and schedule rules."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/discounts"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {isRTL ? "إلغاء" : "Cancel"}
          </Link>
          <button
            type="submit"
            form={formId}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            {isRTL ? "إنشاء" : "Create"}
          </button>
        </div>
      </div>

      <Form {...form}>
        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-8">
              {/* Discount details */}
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      {isRTL ? "تفاصيل الخصم" : "Discount Details"}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-500">
                      {isRTL
                        ? "الكود، النوع، والقيمة"
                        : "Code, type, and value"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {isRTL ? "نوع الخصم" : "Discount Kind"}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20">
                              <SelectValue
                                placeholder={isRTL ? "اختر" : "Select"}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="coupon">
                              {isRTL ? "كوبون" : "Coupon"}
                            </SelectItem>
                            <SelectItem value="promotion">
                              {isRTL ? "حملة" : "Promotion"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="coupon_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {t.coupon_code} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.create_coupon_code}
                            {...field}
                            className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </FormControl>
  
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    name="discount_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {t.discount}
                        </FormLabel>
                        <Select
                          onValueChange={(
                            value: "fixed" | "percentage" | "shipping",
                          ) => {
                            field.onChange(value);
                            setDiscountType(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20">
                              <SelectValue placeholder={t.discount} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">
                              {t.fixed_amount}
                            </SelectItem>
                            <SelectItem value="percentage">
                              {t.percentage}
                            </SelectItem>
                            <SelectItem value="shipping">
                              {t.free_shipping}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {isRTL ? "القيمة" : "Value"}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
                              {discountType === "percentage" ? "%" : "$"}
                            </span>
                            <Input
                              type="number"
                              placeholder="0"
                              value={field.value as any}
                              onChange={(e) =>
                                field.onChange(
                                  parseFloat(e.target.value || "0"),
                                )
                              }
                              min="0"
                              step={
                                discountType === "percentage" ? "1" : "0.01"
                              }
                              className="h-11 rounded-xl border-slate-200 bg-white pl-8 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="apply_for"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {t.apply_for}
                        </FormLabel>
                        <Select
                          onValueChange={(v) => {
                            field.onChange(v);
                            setPageToTop();
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20">
                              <SelectValue placeholder={t.apply_for} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all_orders">
                              {t.all_orders}
                            </SelectItem>
                            <SelectItem value="specific_products">
                              {t.specific_products}
                            </SelectItem>
                            <SelectItem value="specific_categories">
                              {t.specific_categories}
                            </SelectItem>
                            <SelectItem value="minimum_amount">
                              {t.minimum_amount}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Eligibility */}
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <div className="text-sm font-extrabold text-slate-900">
                    {isRTL ? "الأهلية" : "Eligibility"}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {isRTL
                      ? "حدد أين وكيف يمكن تطبيق الخصم."
                      : "Define where and how this discount can be applied."}
                  </div>
                </div>

                {applyFor === "specific_products" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-700">
                        {t.select_products}{" "}
                        <span className="text-rose-600">*</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        {t.selected_items}: {selectedProducts.length}
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={productQuery}
                        onChange={(e) => setProductQuery(e.target.value)}
                        placeholder={t.search_placeholder}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                      {filteredProducts.map((product: any) => (
                        <div
                          key={product._id}
                          className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50"
                        >
                          <Checkbox
                            id={`product-${product._id}`}
                            checked={selectedProducts.includes(product._id)}
                            onCheckedChange={() =>
                              handleProductSelect(product._id)
                            }
                          />
                          <label
                            htmlFor={`product-${product._id}`}
                            className="flex-1 cursor-pointer text-sm font-medium text-slate-700"
                          >
                            {product.nameAr && locale === "ar"
                              ? product.nameAr
                              : product.nameEn || product.nameAr}
                          </label>
                        </div>
                      ))}
                    </div>

                    {form.formState.errors.selected_products ? (
                      <p className="text-sm font-semibold text-rose-600">
                        {form.formState.errors.selected_products.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {applyFor === "specific_categories" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-700">
                        {t.select_categories}{" "}
                        <span className="text-rose-600">*</span>
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        {t.selected_items}: {selectedCategories.length}
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={categoryQuery}
                        onChange={(e) => setCategoryQuery(e.target.value)}
                        placeholder={t.search_placeholder}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                      {filteredCategories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50"
                        >
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() =>
                              handleCategorySelect(category.id)
                            }
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="flex-1 cursor-pointer text-sm font-medium text-slate-700"
                          >
                            {(category as any).title?.[locale] ||
                              (category as any).title?.en}
                          </label>
                        </div>
                      ))}
                    </div>

                    {form.formState.errors.selected_categories ? (
                      <p className="text-sm font-semibold text-rose-600">
                        {form.formState.errors.selected_categories.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {applyFor === "minimum_amount" ? (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-700">
                      {t.minimum_amount_label}{" "}
                      <span className="text-rose-600">*</span>
                    </div>
                    <div className="text-sm font-medium text-slate-500">
                      {t.minimum_amount_description}
                    </div>
                    <FormField
                      name="minimum_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={t.enter_minimum_amount}
                              value={field.value as any}
                              onChange={(e) =>
                                field.onChange(
                                  parseFloat(e.target.value || "0"),
                                )
                              }
                              min="0"
                              step="0.01"
                              className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : null}

                {applyFor === "all_orders" ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-semibold text-slate-700">
                    {isRTL
                      ? "سيتم تطبيق الخصم على جميع الطلبات."
                      : "This discount will apply to all orders."}
                  </div>
                ) : null}
              </div>

              {/* Rules */}
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <div className="text-sm font-extrabold text-slate-900">
                    {isRTL ? "قواعد الاستخدام" : "Usage Rules"}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {isRTL
                      ? "إعدادات توافق العروض وطريقة التطبيق."
                      : "Promotion compatibility and application settings."}
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "can_use_with_promotion" as const,
                      label: t.can_use_with_promotion,
                      desc: "",
                    },
                    {
                      name: "can_use_with_flash_sale" as const,
                      label: t.can_use_with_flash_sale,
                      desc: t.flash_sale_description,
                    },
                    {
                      name: "is_unlimited" as const,
                      label: t.unlimited_coupon,
                      desc: "",
                    },
                    {
                      name: "apply_via_url" as const,
                      label: t.apply_via_url,
                      desc: t.url_description,
                    },
                    {
                      name: "display_at_checkout" as const,
                      label: t.display_at_checkout,
                      desc: t.checkout_description,
                    },
                  ].map((row) => (
                    <FormField
                      key={row.name}
                      name={row.name}
                      render={({ field }) => (
                        <FormItem className="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/30 px-4 py-3">
                          <div className="min-w-0">
                            <FormLabel className="text-sm font-semibold text-slate-800">
                              {row.label}
                            </FormLabel>
                            {row.desc ? (
                              <div className="mt-0.5 text-xs font-medium text-slate-500">
                                {row.desc}
                              </div>
                            ) : null}
                          </div>
                          <FormControl>
                            <Switch
                              checked={Boolean(field.value)}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-emerald-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6 lg:col-span-4">
              {/* Preview */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
                <div className="flex items-center justify-between bg-emerald-600 px-4 py-3">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-white/90">
                    {isRTL ? "معاينة" : "LIVE PREVIEW"}
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${statusChip}`}
                  >
                    {computedStatus === "active"
                      ? isRTL
                        ? "نشط"
                        : "Active"
                      : computedStatus === "scheduled"
                        ? isRTL
                          ? "مجدول"
                          : "Scheduled"
                        : isRTL
                          ? "منتهي"
                          : "Expired"}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-extrabold text-emerald-700">
                      {watchCoupon || "—"}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-extrabold text-slate-700">
                      {watchDiscountType === "percentage"
                        ? isRTL
                          ? "نسبة"
                          : "Percentage"
                        : watchDiscountType === "shipping"
                          ? isRTL
                            ? "شحن"
                            : "Shipping"
                          : isRTL
                            ? "ثابت"
                            : "Fixed"}
                    </span>
                  </div>

                  <div className="mt-5 flex items-end gap-2">
                    <div className="text-4xl font-extrabold tracking-tight text-slate-900">
                      {watchDiscountType === "percentage" ? "" : "$"}
                      {Number.isFinite(watchValue) ? watchValue : 0}
                      {watchDiscountType === "percentage" ? "%" : ""}
                    </div>
                    <div className="pb-1 text-sm font-semibold text-slate-500">
                      {isRTL ? "خصم" : "off"}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {applyFor === "all_orders" ? (
                      <div className="text-sm font-semibold text-slate-700">
                        {isRTL
                          ? "ينطبق على جميع الطلبات"
                          : "Applies to all orders"}
                      </div>
                    ) : applyFor === "specific_products" ? (
                      <div className="text-sm font-semibold text-slate-700">
                        {isRTL ? "منتجات محددة" : "Specific products"}{" "}
                        <span className="text-slate-400">
                          ({selectedProducts.length})
                        </span>
                      </div>
                    ) : applyFor === "specific_categories" ? (
                      <div className="text-sm font-semibold text-slate-700">
                        {isRTL ? "فئات محددة" : "Specific categories"}{" "}
                        <span className="text-slate-400">
                          ({selectedCategories.length})
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-slate-700">
                        {isRTL ? "حد أدنى للطلب" : "Minimum order amount"}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2 text-xs font-semibold text-slate-600">
                      {watchCanPromo ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">
                          {isRTL ? "مع العروض" : "With promotions"}
                        </span>
                      ) : null}
                      {watchCanFlash ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">
                          {isRTL ? "مع فلاش" : "With flash sale"}
                        </span>
                      ) : null}
                      {watchViaUrl ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-slate-200">
                          {isRTL ? "عبر الرابط" : "Via URL"}
                        </span>
                      ) : null}
                      {watchAtCheckout ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 ring-1 ring-slate-200">
                          {isRTL ? "في الدفع" : "At checkout"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {t.time}
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {t.start_date} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {t.end_date} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            disabled={watchNever}
                            className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="never_expired"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/30 px-4 py-3">
                        <FormLabel className="text-sm font-semibold text-slate-800">
                          {t.never_expired}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-emerald-600"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  {isRTL ? "إنشاء الخصم" : "Create Discount"}
                </Button>
                <div className="mt-3 text-center text-xs font-medium text-slate-500">
                  {isRTL
                    ? "يمكنك تعديل الخصم لاحقاً من صفحة الخصومات."
                    : "You can edit this discount later from the Discounts page."}
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

function setPageToTop() {
  // keeps patch minimal; scrolling is optional UX nicety
}
