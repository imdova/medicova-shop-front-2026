"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Check } from "lucide-react";
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
import { Card, CardContent, CardHeader } from "@/components/UI/card";
import { Switch } from "@/components/UI/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/Tabs";
import { Textarea } from "@/components/UI/textarea";
import { Feature } from "@/types";
import { defaultFeatures, dummyPlans } from "@/constants/plans";
import Loading from "@/app/loading";

// ---------------- Schema & Types ----------------
const messages = {
  name_required: {
    en: "Plan name is required",
    ar: "اسم الخطة مطلوب",
  },
  description_required: {
    en: "Description is required",
    ar: "الوصف مطلوب",
  },
  duration_required: {
    en: "Duration is required",
    ar: "المدة مطلوبة",
  },
  price_required: {
    en: "Price is required",
    ar: "السعر مطلوب",
  },
  vat_required: {
    en: "VAT is required",
    ar: "ضريبة القيمة المضافة مطلوبة",
  },
  feature_name_required: {
    en: "Feature name is required",
    ar: "اسم الميزة مطلوب",
  },
  feature_tag_required: {
    en: "Feature tag is required",
    ar: "وسم الميزة مطلوب",
  },
};

const planSchema = z.object({
  name: z.object({
    en: z.string().min(1, messages.name_required.en),
    ar: z.string().min(1, messages.name_required.ar),
  }),
  description: z.object({
    en: z.string().min(1, messages.description_required.en),
    ar: z.string().min(1, messages.description_required.ar),
  }),
  duration: z.string().min(1, messages.duration_required.en),
  currency: z.string().min(1, "Currency is required"),
  price: z.string().min(1, messages.price_required.en),
  discountedPrice: z.string().optional(),
  vat: z.string().min(1, messages.vat_required.en),
  vatDescription: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }),
  status: z.boolean(),
});
type PlanFormData = z.infer<typeof planSchema>;

// ---------------- Component ----------------
export default function EditPlanPage() {
  const { language } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;

  const [activeTab, setActiveTab] = useState("general");
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures);
  const [isLoading, setIsLoading] = useState(true);

  const [newFeature, setNewFeature] = useState({
    name: { en: "", ar: "" },
    tag: { en: "", ar: "" },
    value: "",
  });

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      description: { en: "", ar: "" },
      duration: "",
      currency: "",
      price: "",
      discountedPrice: "",
      vat: "",
      vatDescription: { en: "", ar: "" },
      status: true,
    },
  });

  // Load plan data based on slug
  useEffect(() => {
    const loadPlanData = async () => {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const planData = dummyPlans.find((plan) => slug === plan.id);

      if (planData) {
        form.reset(planData);
      } else {
        // Plan not found - you might want to handle this case differently
        console.warn(`Plan with slug "${slug}" not found`);
      }

      setIsLoading(false);
    };

    if (slug) {
      loadPlanData();
    }
  }, [slug, form]);

  const watchPrice = form.watch("price");
  const watchDiscountedPrice = form.watch("discountedPrice");
  const watchVat = form.watch("vat");
  const watchName = form.watch("name");
  const watchCurrency = form.watch("currency");

  const calculateTotalPrice = () => {
    const price = parseFloat(watchDiscountedPrice || watchPrice) || 0;
    const vat = parseFloat(watchVat) || 0;
    const vatAmount = (price * vat) / 100;
    return price + vatAmount;
  };

  const calculateVatAmount = () => {
    const price = parseFloat(watchDiscountedPrice || watchPrice) || 0;
    const vat = parseFloat(watchVat) || 0;
    return (price * vat) / 100;
  };

  const addFeature = () => {
    if (
      newFeature.name.en.trim() &&
      newFeature.name.ar.trim() &&
      newFeature.tag.en.trim() &&
      newFeature.tag.ar.trim()
    ) {
      const newFeatureItem: Feature = {
        id: Date.now().toString(),
        name: {
          en: newFeature.name.en.trim(),
          ar: newFeature.name.ar.trim(),
        },
        tag: {
          en: newFeature.tag.en.trim(),
          ar: newFeature.tag.ar.trim(),
        },
        included: true,
        value: newFeature.value,
      };
      setFeatures([...features, newFeatureItem]);
      setNewFeature({
        name: { en: "", ar: "" },
        tag: { en: "", ar: "" },
        value: "",
      });
    }
  };

  const toggleFeature = (id: string) => {
    setFeatures(
      features.map((feature) =>
        feature.id === id
          ? { ...feature, included: !feature.included }
          : feature,
      ),
    );
  };

  const removeFeature = (id: string) => {
    setFeatures(features.filter((feature) => feature.id !== id));
  };

  const updateNewFeature = (
    field: "name" | "tag",
    lang: "en" | "ar",
    value: string,
  ) => {
    setNewFeature((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const updateFeatureValue = (id: string, value: string) => {
    setFeatures(
      features.map((feature) =>
        feature.id === id ? { ...feature, value } : feature,
      ),
    );
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      const planData = {
        ...data,
        slug, // Include the slug in the submission
        features: features.filter((f) => f.included),
        totalPrice: calculateTotalPrice(),
      };
      console.log("Updating plan:", planData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Plan updated successfully");
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const t = {
    en: {
      title: "Edit Plan",
      general: "General",
      featuresList: "Features List",
      featuresData: "Features Data",
      featureTags: "Feature Tags",
      preview: "Live Preview",
      planName: "Plan Name",
      enterPlanName: "Enter Plan name",
      descriptionLabel: "Description",
      enterDescription: "Enter plan description",
      duration: "Duration (months)",
      currencyPrice: "Currency Price",
      discountedPrice: "Discounted Price",
      selectCurrency: "Select Currency",
      vat: "VAT (%)",
      vatDescription: "VAT Description",
      enterVatDetails: "Enter VAT details",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      save: "Save",
      saveExit: "Save and Exit",
      published: "UPDATE PLAN",
      generalFeatures: "General Features List",
      addFeature: "ADD FEATURE",
      featureName: "Feature Name",
      featureTag: "Feature Tag",
      featureValue: "Value",
      livePreview: "Live Preview",
      getStarted: "GET STARTED",
      featuresIncluded: "Features Included:",
      bestFor: "Best for",
      free: "Free",
      perMonth: "/month",
      total: "Total",
      includesVat: "Includes VAT",
      previewTitle: "Plan Preview",
      addNewFeature: "Add New Feature",
      remove: "Remove",
      included: "Included",
      notIncluded: "Not Included",
      toggleFeature: "Toggle Feature",
      english: "English",
      arabic: "Arabic",
      name: "Name",
      tag: "Tag",
      mostPopular: "Most Popular",
      subtotal: "Subtotal",
      vatAmount: "VAT",
      loading: "Loading plan...",
      planNotFound: "Plan not found",
    },
    ar: {
      title: "تعديل الخطة",
      general: "عام",
      featuresList: "قائمة الميزات",
      featuresData: "بيانات الميزات",
      featureTags: "وسوم الميزات",
      preview: "معاينة مباشرة",
      planName: "اسم الخطة",
      enterPlanName: "أدخل اسم الخطة",
      descriptionLabel: "الوصف",
      enterDescription: "أدخل وصف الخطة",
      duration: "المدة (أشهر)",
      currencyPrice: "سعر العملة",
      discountedPrice: "السعر المخفض",
      selectCurrency: "اختر العملة",
      vat: "ضريبة القيمة المضافة (%)",
      vatDescription: "وصف ضريبة القيمة المضافة",
      enterVatDetails: "أدخل تفاصيل ضريبة القيمة المضافة",
      status: "الحالة",
      active: "نشط",
      inactive: "غير نشط",
      save: "حفظ",
      saveExit: "حفظ وخروج",
      published: "تحديث الخطة",
      generalFeatures: "قائمة الميزات العامة",
      addFeature: "إضافة ميزة",
      featureName: "اسم الميزة",
      featureTag: "وسم الميزة",
      featureValue: "القيمة",
      livePreview: "معاينة مباشرة",
      getStarted: "ابدأ الآن",
      featuresIncluded: "الميزات المتضمنة:",
      bestFor: "الأفضل ل",
      free: "مجاني",
      perMonth: "/شهر",
      total: "الإجمالي",
      includesVat: "يشمل ضريبة القيمة المضافة",
      previewTitle: "معاينة الخطة",
      addNewFeature: "إضافة ميزة جديدة",
      remove: "إزالة",
      included: "مضمن",
      notIncluded: "غير مضمن",
      toggleFeature: "تبديل الميزة",
      english: "الإنجليزية",
      arabic: "العربية",
      name: "الاسم",
      tag: "الوسم",
      mostPopular: "الأكثر شيوعاً",
      subtotal: "المجموع الفرعي",
      vatAmount: "ضريبة القيمة المضافة",
      loading: "جاري تحميل الخطة...",
      planNotFound: "الخطة غير موجودة",
    },
  }[language];

  const isRTL = language === "ar";

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "د.إ",
    SAR: "ر.س",
    EGP: "EGP",
  };

  if (isLoading) {
    return <Loading />;
  }

  // Check if plan data was loaded successfully
  if (!form.watch("name.en") && !form.watch("name.ar")) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            {t.planNotFound}
          </h1>
          <p className="text-gray-600">
            {language === "en"
              ? `Plan with slug "${slug}" was not found.`
              : `الخطة ذات المعرف "${slug}" غير موجودة.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="mt-2 text-gray-600">
          {language === "en" ? `Editing: ${slug}` : `جاري التعديل: ${slug}`}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="general" className="flex-1">
            {t.general}
          </TabsTrigger>
          <TabsTrigger value="featuresList" className="flex-1">
            {t.featuresList}
          </TabsTrigger>
          <TabsTrigger value="featuresData" className="flex-1">
            {t.featuresData}
          </TabsTrigger>
          <TabsTrigger value="featureTags" className="flex-1">
            {t.featureTags}
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column - Forms */}
              <div className="space-y-6 lg:col-span-2">
                {/* General Tab */}
                <TabsContent value="general" className="m-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">{t.general}</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Bilingual Plan Name */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          name="name.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t.planName} ({t.english}) *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={`${t.enterPlanName} (${t.english})`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="name.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t.planName} ({t.arabic}) *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={`${t.enterPlanName} (${t.arabic})`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Bilingual Description */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          name="description.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t.descriptionLabel} ({t.english}) *
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={`${t.enterDescription} (${t.english})`}
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="description.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t.descriptionLabel} ({t.arabic}) *
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder={`${t.enterDescription} (${t.arabic})`}
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormField
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.duration} *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.currencyPrice} *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={t.selectCurrency}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="USD">USD ($)</SelectItem>
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                  <SelectItem value="GBP">GBP (£)</SelectItem>
                                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                                  <SelectItem value="SAR">SAR (ر.س)</SelectItem>
                                  <SelectItem value="EGP">EGP</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.currencyPrice} *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          name="discountedPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.discountedPrice}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="vat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t.vat} *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Bilingual VAT Description */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          name="vatDescription.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t.vatDescription} ({t.english})
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={`${t.enterVatDetails} (${t.english})`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="vatDescription.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t.vatDescription} ({t.arabic})
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={`${t.enterVatDetails} (${t.arabic})`}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Features List Tab */}
                <TabsContent value="featuresList" className="m-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">
                        {t.generalFeatures}
                      </h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Features List Display */}
                      <div className="space-y-3">
                        {features.map((feature) => (
                          <div
                            key={feature.id}
                            className="flex items-center justify-between rounded-lg border p-4"
                          >
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={feature.included}
                                onCheckedChange={() =>
                                  toggleFeature(feature.id)
                                }
                                className="data-[state=checked]:bg-green-600"
                              />
                              <div>
                                <div className="font-medium">
                                  {feature.name[language]}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {feature.tag[language]}
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFeature(feature.id)}
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Features Data Tab */}
                <TabsContent value="featuresData" className="m-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">
                        {t.featuresData}
                      </h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Features Data List */}
                      <div className="space-y-3">
                        {features.map((feature) => (
                          <div
                            key={feature.id}
                            className="rounded-lg border p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                  {/* Feature Name */}
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-600">
                                      {t.featureName}
                                    </label>
                                    <div className="space-y-2">
                                      <Input
                                        value={feature.name.en}
                                        onChange={(e) => {
                                          const updatedFeatures = features.map(
                                            (f) =>
                                              f.id === feature.id
                                                ? {
                                                    ...f,
                                                    name: {
                                                      ...f.name,
                                                      en: e.target.value,
                                                    },
                                                  }
                                                : f,
                                          );
                                          setFeatures(updatedFeatures);
                                        }}
                                        placeholder={`${t.featureName} (${t.english})`}
                                        className="text-sm"
                                      />
                                      <Input
                                        value={feature.name.ar}
                                        onChange={(e) => {
                                          const updatedFeatures = features.map(
                                            (f) =>
                                              f.id === feature.id
                                                ? {
                                                    ...f,
                                                    name: {
                                                      ...f.name,
                                                      ar: e.target.value,
                                                    },
                                                  }
                                                : f,
                                          );
                                          setFeatures(updatedFeatures);
                                        }}
                                        placeholder={`${t.featureName} (${t.arabic})`}
                                        className="text-sm"
                                      />
                                    </div>
                                  </div>

                                  {/* Feature Value */}
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-600">
                                      {t.featureValue}
                                    </label>
                                    <Input
                                      value={feature.value || ""}
                                      onChange={(e) =>
                                        updateFeatureValue(
                                          feature.id,
                                          e.target.value,
                                        )
                                      }
                                      placeholder={t.featureValue}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="ml-4 flex flex-col items-center gap-2">
                                <Switch
                                  checked={feature.included}
                                  onCheckedChange={() =>
                                    toggleFeature(feature.id)
                                  }
                                  className="data-[state=checked]:bg-green-600"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFeature(feature.id)}
                                  className="h-8 w-8 p-0 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Feature Tags Tab */}
                <TabsContent value="featureTags" className="m-0 space-y-6">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">{t.featureTags}</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Add New Feature - Bilingual */}
                      <div className="space-y-4 rounded-lg border p-4">
                        <h4 className="font-semibold">{t.addNewFeature}</h4>

                        {/* Feature Name - Bilingual */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              {t.featureName} ({t.english}) *
                            </label>
                            <Input
                              placeholder={`${t.featureName} (${t.english})`}
                              value={newFeature.name.en}
                              onChange={(e) =>
                                updateNewFeature("name", "en", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              {t.featureName} ({t.arabic}) *
                            </label>
                            <Input
                              placeholder={`${t.featureName} (${t.arabic})`}
                              value={newFeature.name.ar}
                              onChange={(e) =>
                                updateNewFeature("name", "ar", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Feature Tag - Bilingual */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              {t.featureTag} ({t.english}) *
                            </label>
                            <Input
                              placeholder={`${t.featureTag} (${t.english})`}
                              value={newFeature.tag.en}
                              onChange={(e) =>
                                updateNewFeature("tag", "en", e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium">
                              {t.featureTag} ({t.arabic}) *
                            </label>
                            <Input
                              placeholder={`${t.featureTag} (${t.arabic})`}
                              value={newFeature.tag.ar}
                              onChange={(e) =>
                                updateNewFeature("tag", "ar", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={addFeature}
                          className="flex items-center gap-2"
                          disabled={
                            !newFeature.name.en.trim() ||
                            !newFeature.name.ar.trim() ||
                            !newFeature.tag.en.trim() ||
                            !newFeature.tag.ar.trim()
                          }
                        >
                          <Plus className="h-4 w-4" />
                          {t.addFeature}
                        </Button>
                      </div>

                      {/* Feature Tags List */}
                      <div className="space-y-3">
                        {features.map((feature) => (
                          <div
                            key={feature.id}
                            className="rounded-lg border p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                  {/* Feature Tag - Bilingual */}
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-600">
                                      {t.featureTag}
                                    </label>
                                    <div className="space-y-2">
                                      <Input
                                        value={feature.tag.en}
                                        onChange={(e) => {
                                          const updatedFeatures = features.map(
                                            (f) =>
                                              f.id === feature.id
                                                ? {
                                                    ...f,
                                                    tag: {
                                                      ...f.tag,
                                                      en: e.target.value,
                                                    },
                                                  }
                                                : f,
                                          );
                                          setFeatures(updatedFeatures);
                                        }}
                                        placeholder={`${t.featureTag} (${t.english})`}
                                        className="text-sm"
                                      />
                                      <Input
                                        value={feature.tag.ar}
                                        onChange={(e) => {
                                          const updatedFeatures = features.map(
                                            (f) =>
                                              f.id === feature.id
                                                ? {
                                                    ...f,
                                                    tag: {
                                                      ...f.tag,
                                                      ar: e.target.value,
                                                    },
                                                  }
                                                : f,
                                          );
                                          setFeatures(updatedFeatures);
                                        }}
                                        placeholder={`${t.featureTag} (${t.arabic})`}
                                        className="text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="ml-4 flex flex-col items-center gap-2">
                                <Switch
                                  checked={feature.included}
                                  onCheckedChange={() =>
                                    toggleFeature(feature.id)
                                  }
                                  className="data-[state=checked]:bg-green-600"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFeature(feature.id)}
                                  className="h-8 w-8 p-0 text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>

              {/* Right Column - Sidebar & Preview */}
              <div>
                <h3 className="p-3 text-lg font-semibold">{t.livePreview}</h3>
                {/* Live Preview Card */}

                <Card className="relative mb-4 overflow-hidden rounded-lg border border-gray-200 py-0 shadow-sm">
                  {/* Header */}
                  <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white">
                    <h3 className="py-2 text-3xl font-bold drop-shadow-md">
                      {
                        // Safe fallback: prefer current language → fallback to other → fallback to t.free
                        watchName?.[language] ||
                          watchName?.[language === "ar" ? "en" : "ar"] ||
                          t.free
                      }
                    </h3>
                  </CardHeader>

                  {/* Body */}
                  <CardContent className="space-y-5 p-6">
                    {/* Price Section */}
                    <div className="text-center">
                      <div className="inline-flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-extrabold text-gray-900">
                          {
                            currencySymbols[
                              watchCurrency as keyof typeof currencySymbols
                            ]
                          }
                          {watchDiscountedPrice || watchPrice}
                        </span>
                        {watchDiscountedPrice &&
                          watchDiscountedPrice !== watchPrice && (
                            <span className="text-lg text-gray-400 line-through">
                              {
                                currencySymbols[
                                  watchCurrency as keyof typeof currencySymbols
                                ]
                              }
                              {watchPrice}
                            </span>
                          )}
                      </div>
                      <div className="text-sm text-gray-600">
                        / {form.watch("duration")}{" "}
                        {language === "en" ? "months" : "أشهر"}
                      </div>
                    </div>

                    {/* Summary Box */}
                    <div className="rounded-xl bg-gray-50 p-4 shadow-inner">
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>{t.subtotal}:</span>
                        <span className="font-medium">
                          {
                            currencySymbols[
                              watchCurrency as keyof typeof currencySymbols
                            ]
                          }
                          {watchDiscountedPrice || watchPrice}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>
                          {t.vatAmount} ({watchVat}%):
                        </span>
                        <span className="font-medium">
                          {
                            currencySymbols[
                              watchCurrency as keyof typeof currencySymbols
                            ]
                          }
                          {calculateVatAmount().toFixed(0)}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold text-gray-900">
                        <span>{t.total}:</span>
                        <span>
                          {
                            currencySymbols[
                              watchCurrency as keyof typeof currencySymbols
                            ]
                          }
                          {calculateTotalPrice().toFixed(0)}
                        </span>
                      </div>
                      <p className="mt-1 text-right text-xs text-gray-500">
                        {language === "en"
                          ? "Includes all taxes"
                          : "يشمل جميع الضرائب"}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Button className="w-full bg-gradient-to-r from-primary to-secondary py-2 text-base font-semibold text-white shadow-md transition-all hover:brightness-110">
                      {t.getStarted}
                    </Button>

                    {/* Features */}
                    <div>
                      <h5 className="mb-2 text-sm font-semibold text-gray-800">
                        {t.featuresIncluded}
                      </h5>
                      <div className="space-y-2">
                        {features
                          .filter((feature) => feature.included)
                          .map((feature) => (
                            <div
                              key={feature.id}
                              className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 text-sm hover:bg-gray-100"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-gray-700">
                                {
                                  // Safe fallback for feature name too
                                  feature.name?.[language] ||
                                    feature.name?.[
                                      language === "ar" ? "en" : "ar"
                                    ] ||
                                    "-"
                                }{" "}
                                {feature.value && `- ${feature.value}`}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <Button type="submit" className="w-full">
                      {t.published}
                    </Button>
                  </CardContent>
                </Card>

                {/* Status Switch */}
                <Card>
                  <CardHeader className="pb-3">
                    <h4 className="font-semibold">{t.status}</h4>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-base">
                              {field.value ? t.active : t.inactive}
                            </FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-green-600"
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
