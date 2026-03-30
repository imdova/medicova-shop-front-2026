"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Tag, CalendarDays, ChevronDown, Search, Plus, Loader2 } from "lucide-react";
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
import { Discount } from "@/types/product";
import { Checkbox } from "@/components/shared/Check-Box";
import { Link } from "@/i18n/navigation";
import Loading from "@/app/[locale]/loading";
import { getProducts } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { getDiscount, updateDiscount, CreateDiscountPayload } from "@/services/discountService";

// ---------------- Schema & Types ----------------
const discountSchema = z
  .object({
    type: z.enum(["coupon", "promotion"]),
    coupon_code: z.string().min(1, "Coupon code is required"),
    discount_type: z.enum(["fixed", "percentage", "shipping"]),
    value: z.number().min(0.01, "Discount value is required"),
    apply_for: z.enum([
      "all_orders",
      "specific_products",
      "specific_categories",
      "minimum_amount",
    ]),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
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
      message: "Minimum amount is required",
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
      message: "At least one product must be selected",
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
      message: "At least one category must be selected",
      path: ["selected_categories"],
    },
  );

type DiscountFormData = z.infer<typeof discountSchema>;


// ---------------- Component ----------------
export default function EditDiscountPage() {
  const locale = useAppLocale();
  const isRTL = locale === "ar";
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const user = (session as any)?.user;

  const [discount, setDiscount] = useState<Discount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");

  const formId = "edit-discount-form";

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

  // Fetch products and categories
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [prodData, catData, discData] = await Promise.all([
          getProducts(token),
          getCategories(token),
          getDiscount(slug, token),
        ]);
        setProducts(prodData as any);
        setCategories(catData as any);
        setDiscount(discData);

        // Map the discount data to form values
        const formData = {
          type: discData.type || (discData.method === "automatic_discount" ? "promotion" : "coupon"),
          coupon_code: discData.couponCode || discData.discountCode || "",
          discount_type: discData.discountType as any || "fixed",
          value: discData.value ?? discData.discountValue ?? 0,
          apply_for: (discData.applyFor ?? discData.appliesTo ?? "all_orders") as any,
          start_date: discData.startDate ? discData.startDate.split("T")[0] : "",
          end_date: discData.endDate ? discData.endDate.split("T")[0] : "",
          can_use_with_promotion: (discData as any).canUseWithPromotion ?? false,
          can_use_with_flash_sale: (discData as any).canUseWithFlashSale ?? false,
          is_unlimited: (discData as any).isUnlimited ?? true,
          apply_via_url: (discData as any).applyViaUrl ?? false,
          display_at_checkout: (discData as any).displayAtCheckout ?? false,
          never_expired: (discData as any).neverExpired ?? false,
          minimum_amount: (discData as any).minimumAmount ?? 0,
          selected_products: discData.selectedProducts || discData.productIds || [],
          selected_categories: discData.selectedCategories || discData.categoryIds || [],
        };

        form.reset(formData);
        setSelectedProducts(discData.selectedProducts || discData.productIds || []);
        setSelectedCategories(discData.selectedCategories || discData.categoryIds || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error(isRTL ? "فشل تحميل البيانات" : "Failed to load discount data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, slug, isRTL, form]);

  useEffect(() => {
    // Update form values when selections change
    form.setValue("selected_products", selectedProducts);
    form.setValue("selected_categories", selectedCategories);
  }, [selectedProducts, selectedCategories, form]);

  const onSubmit = async (data: DiscountFormData) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const payload: Partial<CreateDiscountPayload> = {
        sellerId:
          user?.role === "admin"
            ? (user as any)?.id || "507f1f77bcf86cd799439011"
            : (user as any)?.storeId || (user as any)?.id,
        discountName: data.coupon_code,
        method: data.type === "promotion" ? "automatic_discount" : "discount_code",
        discountCode: data.coupon_code,
        discountType: data.discount_type,
        discountValue: data.value,
        appliesTo: data.apply_for === "all_orders" ? "all_products" : data.apply_for,
        productIds: data.selected_products || [],
        categoryIds: data.selected_categories || [],
        startDate: data.start_date, // YYYY-MM-DD
        startTime: "00:00",
        endDate: data.never_expired ? "2099-12-31" : data.end_date, // YYYY-MM-DD
        endTime: "23:59",
        active: true,
        status: computedStatus || "active",
      };


      console.log("Edit Discount Payload:", payload);
      await updateDiscount(slug, payload, token);

      toast.success(isRTL ? "تم تحديث الخصم بنجاح" : "Discount updated successfully");
      router.push("/admin/discounts");
    } catch (error: any) {
      console.error("Update failed", error);
      toast.error(error.message || (isRTL ? "فشل تحديث الخصم" : "Failed to update discount"));
    } finally {
      setIsSubmitting(false);
    }
  };

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
      title: "Edit Discount",
      edit_coupon: "Edit Coupon Code",
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
      start_date: "Start date",
      end_date: "End date",
      never_expired: "Never expired?",
      save: "Save Changes",
      discount: "Discount",
      apply_for: "apply for",
      all_orders: "All orders",
      specific_products: "Specific products",
      specific_categories: "Specific categories",
      minimum_amount: "Minimum amount",
      fixed_amount: "Fixed amount",
      percentage: "Percentage",
      free_shipping: "Free shipping",
      loading: "Loading discount...",
      not_found: "Discount not found",
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
      title: "تعديل الخصم",
      edit_coupon: "تعديل كود الخصم",
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
      start_date: "تاريخ البدء",
      end_date: "تاريخ الانتهاء",
      never_expired: "لا ينتهي أبدًا؟",
      save: "حفظ التغييرات",
      discount: "خصم",
      apply_for: "يطبق على",
      all_orders: "جميع الطلبات",
      specific_products: "منتجات محددة",
      specific_categories: "فئات محددة",
      minimum_amount: "حد أدنى للمبلغ",
      fixed_amount: "مبلغ ثابت",
      percentage: "نسبة مئوية",
      free_shipping: "شحن مجاني",
      loading: "جاري تحميل الخصم...",
      not_found: "الخصم غير موجود",
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

  if (isLoading || isSubmitting) return <Loading />;
  if (!discount) return <div className="text-center py-20 font-bold">{t.not_found}</div>;

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
            {t.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {isRTL
              ? "تحديث تفاصيل الكوبون أو الحملة الترويجية."
              : "Update your coupon or promotion details and rules."}
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
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            {t.save}
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
            {/* Left Column - Main Content */}
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
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {isRTL ? "نوع الخصم" : "Discount Kind"}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20">
                              <SelectValue placeholder={isRTL ? "اختر" : "Select"} />
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
                    control={form.control}
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
                    control={form.control}
                    name="discount_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {t.discount}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20">
                              <SelectValue placeholder={t.discount} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">{t.fixed_amount}</SelectItem>
                            <SelectItem value="percentage">{t.percentage}</SelectItem>
                            <SelectItem value="shipping">{t.free_shipping}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {isRTL ? "القيمة" : "Value"}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
                              {watchDiscountType === "percentage" ? "%" : "$"}
                            </span>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value || "0"))
                              }
                              min="0"
                              step={watchDiscountType === "percentage" ? "1" : "0.01"}
                              className="h-11 rounded-xl border-slate-200 bg-white pl-8 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apply_for"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {t.apply_for}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20">
                              <SelectValue placeholder={t.apply_for} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all_orders">{t.all_orders}</SelectItem>
                            <SelectItem value="specific_products">{t.specific_products}</SelectItem>
                            <SelectItem value="specific_categories">{t.specific_categories}</SelectItem>
                            <SelectItem value="minimum_amount">{t.minimum_amount}</SelectItem>
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

                <div className="mt-4 space-y-6">
                  {/* Specific Products Selection */}
                  {applyFor === "specific_products" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-700">
                          {t.select_products} *
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

                      {form.formState.errors.selected_products && (
                        <p className="text-sm font-semibold text-rose-600">
                          {form.formState.errors.selected_products.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Specific Categories Selection */}
                  {applyFor === "specific_categories" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-700">
                          {t.select_categories} *
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
                        {filteredCategories.map((category: any) => (
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
                              {category.title?.[locale] || category.title?.en}
                            </label>
                          </div>
                        ))}
                      </div>

                      {form.formState.errors.selected_categories && (
                        <p className="text-sm font-semibold text-rose-600">
                          {form.formState.errors.selected_categories.message}
                        </p>
                      )}
                    </div>
                  )}

                  {applyFor === "minimum_amount" && (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-slate-700">
                        {t.minimum_amount_label} *
                      </div>
                      <div className="text-sm font-medium text-slate-500">
                        {t.minimum_amount_description}
                      </div>
                      <FormField
                        control={form.control}
                        name="minimum_amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t.enter_minimum_amount}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value || "0"))
                                }
                                min="0"
                                className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Additional Settings */}
                <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                  <FormField
                    control={form.control}
                    name="can_use_with_promotion"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-bold text-slate-800">
                            {t.can_use_with_promotion}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="can_use_with_flash_sale"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-bold text-slate-800">
                            {t.can_use_with_flash_sale}
                          </FormLabel>
                          <p className="max-w-[400px] text-xs font-semibold text-slate-500">
                            {t.flash_sale_description}
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_unlimited"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-bold text-slate-800">
                            {t.unlimited_coupon}
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {watchCoupon && (
                    <FormField
                      control={form.control}
                      name="apply_via_url"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between space-y-0 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-bold text-slate-800">
                              {t.apply_via_url}
                            </FormLabel>
                            <p className="max-w-[400px] text-xs font-semibold text-slate-500">
                              {t.url_description}
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="display_at_checkout"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between space-y-0 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/50">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-bold text-slate-800">
                            {t.display_at_checkout}
                          </FormLabel>
                          <p className="max-w-[400px] text-xs font-semibold text-slate-500">
                            {t.checkout_description}
                          </p>
                        </div>
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
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 lg:col-span-4">
              {/* Status Section */}
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {isRTL ? "الحالة" : "Status"}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-wider ${statusChip}`}
                  >
                    {computedStatus}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-600">
                            {t.start_date} *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <Input
                                type="date"
                                {...field}
                                className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-600">
                            {t.end_date} *
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <Input
                                type="date"
                                {...field}
                                disabled={watchNever}
                                className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="never_expired"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-black uppercase tracking-tight text-slate-500">
                          {t.never_expired}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Summary Section */}
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-extrabold text-slate-900">
                  {isRTL ? "الملخص" : "Summary"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      {isRTL ? "الكود" : "Code"}
                    </div>
                    <div className="mt-1 font-black text-slate-900">
                      {watchCoupon || (isRTL ? "لا يوجد" : "No code yet")}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">
                        {isRTL ? "القيمة" : "Value"}
                      </div>
                      <div className="mt-1 font-black text-emerald-600">
                        {watchDiscountType === "percentage" ? "%" : "$"}
                        {watchValue || "0"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500">
                        {isRTL ? "يطبق على" : "Applies to"}
                      </div>
                      <div className="mt-1 text-sm font-black text-slate-900">
                        {t[applyFor as keyof typeof t] || applyFor}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {isRTL ? "الجدول الزمني" : "Schedule"}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-700">
                      <CalendarDays className="h-3 w-3" />
                      {watchStart || (isRTL ? "لم يحدد" : "Not set")}
                      {" → "}
                      {watchNever
                        ? isRTL
                          ? "لا ينتهي"
                          : "Never"
                        : watchEnd || (isRTL ? "لم يحدد" : "Not set")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
