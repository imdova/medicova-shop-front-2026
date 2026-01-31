"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
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
import { Switch } from "@/components/UI/switch";
import { products } from "@/constants/products";
import { medicalCategories } from "@/constants/categouries";
import { Checkbox } from "@/components/UI/Check-Box";

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
  const { language } = useLanguage();
  const [discountType, setDiscountType] = useState<
    "fixed" | "percentage" | "shipping"
  >("fixed");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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

  useEffect(() => {
    // Update form values when selections change
    form.setValue("selected_products", selectedProducts);
    form.setValue("selected_categories", selectedCategories);
  }, [selectedProducts, selectedCategories, form]);

  const onSubmit = async (data: DiscountFormData) => {
    try {
      console.log("Discount Data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Handle successful submission
    } catch (error) {
      console.error("Submission failed", error);
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
              {/* Select type of discount */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.select_type}</h3>
                </div>

                <div className="space-y-4">
                  {/* Coupon Code Section */}
                  <div className="space-y-4">
                    <FormField
                      name="coupon_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            {t.coupon_code} *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t.create_coupon_code}
                              {...field}
                            />
                          </FormControl>
                          <p className="text-sm text-gray-600">
                            {t.coupon_description}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Settings Switches */}
                    <div className="space-y-4 border-t pt-4">
                      <FormField
                        name="can_use_with_promotion"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
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
                        name="can_use_with_flash_sale"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                {t.can_use_with_flash_sale}
                              </FormLabel>
                              <p className="text-sm text-gray-600">
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
                        name="is_unlimited"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
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

                      <FormField
                        name="apply_via_url"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                {t.apply_via_url}
                              </FormLabel>
                              <p className="text-sm text-gray-600">
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

                      <FormField
                        name="display_at_checkout"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-y-0">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                {t.display_at_checkout}
                              </FormLabel>
                              <p className="text-sm text-gray-600">
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
              </Card>

              {/* Coupon Type */}
              <Card className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.coupon_type}</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {/* Discount Type */}
                  <FormField
                    name="discount_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
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
                            <SelectTrigger>
                              <SelectValue placeholder={t.discount} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">
                              <div className="flex items-center gap-2">
                                <span>$</span>
                                <span>{t.fixed_amount}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="percentage">
                              <div className="flex items-center gap-2">
                                <span>%</span>
                                <span>{t.percentage}</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="shipping">
                              <div className="flex items-center gap-2">
                                <span>🚚</span>
                                <span>{t.free_shipping}</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Value Input */}
                  <FormField
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {discountType === "fixed" && "$"}
                          {discountType === "percentage" && "%"}
                          {discountType === "shipping" && "$"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                            min="0"
                            step={discountType === "percentage" ? "1" : "0.01"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Apply For */}
                  <FormField
                    name="apply_for"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {t.apply_for}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
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

                {/* Conditional Fields Based on Apply For Selection */}
                <div className="mt-4 space-y-4">
                  {/* Specific Products Dropdown */}
                  {applyFor === "specific_products" && (
                    <div className="space-y-3">
                      <FormLabel className="text-base font-medium">
                        {t.select_products} *
                      </FormLabel>
                      <div className="space-y-2">
                        <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 p-2">
                          {products.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center space-x-2 rounded p-2 hover:bg-gray-50"
                            >
                              <Checkbox
                                id={`product-${product.id}`}
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={() =>
                                  handleProductSelect(product.id)
                                }
                              />
                              <label
                                htmlFor={`product-${product.id}`}
                                className="flex-1 cursor-pointer text-sm font-medium text-gray-700"
                              >
                                {product.title[language]}
                              </label>
                            </div>
                          ))}
                        </div>
                        {selectedProducts.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {t.selected_items}: {selectedProducts.length}
                          </div>
                        )}
                        {form.formState.errors.selected_products && (
                          <p className="text-sm text-red-600">
                            {form.formState.errors.selected_products.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Specific Categories Dropdown */}
                  {applyFor === "specific_categories" && (
                    <div className="space-y-3">
                      <FormLabel className="text-base font-medium">
                        {t.select_categories} *
                      </FormLabel>
                      <div className="space-y-2">
                        <div className="max-h-40 overflow-y-auto rounded-md border border-gray-200 p-2">
                          {medicalCategories.map((category) => (
                            <div
                              key={category.id}
                              className="flex items-center space-x-2 rounded p-2 hover:bg-gray-50"
                            >
                              <Checkbox
                                id={`category-${category.id}`}
                                checked={selectedCategories.includes(
                                  category.id,
                                )}
                                onCheckedChange={() =>
                                  handleCategorySelect(category.id)
                                }
                              />
                              <label
                                htmlFor={`category-${category.id}`}
                                className="flex-1 cursor-pointer text-sm font-medium text-gray-700"
                              >
                                {category.title[language]}
                              </label>
                            </div>
                          ))}
                        </div>
                        {selectedCategories.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {t.selected_items}: {selectedCategories.length}
                          </div>
                        )}
                        {form.formState.errors.selected_categories && (
                          <p className="text-sm text-red-600">
                            {form.formState.errors.selected_categories.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Minimum Amount Input */}
                  {applyFor === "minimum_amount" && (
                    <div className="space-y-3">
                      <FormLabel className="text-base font-medium">
                        {t.minimum_amount_label} *
                      </FormLabel>
                      <p className="text-sm text-gray-600">
                        {t.minimum_amount_description}
                      </p>
                      <FormField
                        name="minimum_amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder={t.enter_minimum_amount}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseFloat(e.target.value))
                                }
                                min="0"
                                step="0.01"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              {/* Time Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.time}</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            {t.start_date} *
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">
                            {t.end_date} *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              disabled={form.watch("never_expired")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    name="never_expired"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-base">
                          {t.never_expired}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
              {/* Save Button */}
              <Card className="p-4">
                <CardContent className="p-0">
                  <Button type="submit">{t.save}</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
