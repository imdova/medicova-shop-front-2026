"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Eye,
  FileText,
  GraduationCap,
  LineChart,
  PlaySquare,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Wrench,
} from "lucide-react";

import { useAppLocale } from "@/hooks/useAppLocale";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Switch } from "@/components/shared/switch";

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

// ---------------- Schema & Types ----------------
const messages = {
  name_required: { en: "Plan name is required", ar: "اسم الخطة مطلوب" },
  description_required: { en: "Description is required", ar: "الوصف مطلوب" },
  duration_required: { en: "Duration is required", ar: "المدة مطلوبة" },
  price_required: { en: "Price is required", ar: "السعر مطلوب" },
  vat_required: { en: "Fee is required", ar: "الرسوم مطلوبة" },
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

type SmartFeature = {
  id: string;
  group: "Healthcare Specialized" | "LMS Core" | "Analytics & Marketing";
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  included: boolean;
  iconKey: "cme" | "dicom" | "hipaa" | "live" | "quiz" | "insights";
};

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  SAR: "ر.س",
  EGP: "EGP",
};

export default function CreatePlanePage() {
  const locale = useAppLocale();
  const isRTL = locale === "ar";

  const [featureQuery, setFeatureQuery] = useState("");
  const [features, setFeatures] = useState<SmartFeature[]>([
    {
      id: "cme",
      group: "Healthcare Specialized",
      name: {
        en: "CME Certification Support",
        ar: "دعم شهادات التعليم الطبي المستمر",
      },
      description: {
        en: "Auto-issue Continuing Medical Education credits to students.",
        ar: "إصدار اعتمادات CME تلقائيًا للطلاب.",
      },
      included: true,
      iconKey: "cme",
    },
    {
      id: "dicom",
      group: "Healthcare Specialized",
      name: { en: "Interactive DICOM Viewer", ar: "عارض DICOM تفاعلي" },
      description: {
        en: "Native medical image viewing within the LMS environment.",
        ar: "عرض صور طبية داخل نظام إدارة التعلم.",
      },
      included: false,
      iconKey: "dicom",
    },
    {
      id: "hipaa",
      group: "Healthcare Specialized",
      name: { en: "HIPAA Compliant Messaging", ar: "مراسلة متوافقة مع HIPAA" },
      description: {
        en: "Secure student-to-instructor clinical discussion channels.",
        ar: "قنوات نقاش سريرية آمنة بين الطالب والمدرب.",
      },
      included: true,
      iconKey: "hipaa",
    },
    {
      id: "live",
      group: "LMS Core",
      name: { en: "HD Live Sessions", ar: "جلسات مباشرة بجودة HD" },
      description: {
        en: "Stream high-definition medical procedures or lectures.",
        ar: "بث إجراءات طبية أو محاضرات بجودة عالية.",
      },
      included: true,
      iconKey: "live",
    },
    {
      id: "quiz",
      group: "LMS Core",
      name: { en: "Adaptive Quizzing", ar: "اختبارات تكيفية" },
      description: {
        en: "AI-driven quiz difficulty based on student performance.",
        ar: "تكييف صعوبة الاختبارات حسب أداء الطالب.",
      },
      included: false,
      iconKey: "quiz",
    },
    {
      id: "insights",
      group: "Analytics & Marketing",
      name: { en: "Advanced Learner Insights", ar: "رؤى متقدمة عن المتعلمين" },
      description: {
        en: "Deep behavioral analytics and completion forecasting.",
        ar: "تحليلات سلوكية وتوقعات إكمال الدورات.",
      },
      included: true,
      iconKey: "insights",
    },
  ]);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: { en: "Specialized CME Pro", ar: "Specialized CME Pro" },
      description: {
        en: "Best for specialized medical institutions.",
        ar: "الأفضل للمؤسسات الطبية المتخصصة.",
      },
      duration: "1",
      currency: "USD",
      price: "49",
      discountedPrice: "499",
      vat: "12",
      vatDescription: { en: "", ar: "" },
      status: true,
    },
  });

  const watchCurrency = form.watch("currency");
  const watchPrice = form.watch("price");
  const watchYearly = form.watch("discountedPrice");
  const watchFee = form.watch("vat");
  const watchName = form.watch("name");
  const watchDesc = form.watch("description");

  const selectedCount = useMemo(
    () => features.filter((f) => f.included).length,
    [features],
  );

  const filtered = useMemo(() => {
    const q = featureQuery.trim().toLowerCase();
    if (!q) return features;
    return features.filter((f) => {
      const name = (f.name[locale as "en" | "ar"] || f.name.en).toLowerCase();
      const desc = (f.description[locale as "en" | "ar"] || f.description.en).toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [featureQuery, features, locale]);

  const grouped = useMemo(() => {
    const groups: Record<SmartFeature["group"], SmartFeature[]> = {
      "Healthcare Specialized": [],
      "LMS Core": [],
      "Analytics & Marketing": [],
    };
    filtered.forEach((f) => groups[f.group].push(f));
    return groups;
  }, [filtered]);

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, included: !f.included } : f)),
    );
  };

  const addSuggested = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, included: true } : f)),
    );
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      const planData = {
        ...data,
        features: features.filter((f) => f.included),
        selectedCount,
      };
      console.log(planData);
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>{isRTL ? "المشرف" : "Admin"}</span>
                <ChevronRight className="h-4 w-4" />
                <span>{isRTL ? "منشئ الخطط الذكي" : "Smart Plan Builder"}</span>
              </div>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {isRTL ? "إنشاء خطة ذكية" : "Create Smart Plan"}
              </h1>
              <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
                {isRTL
                  ? "قم بتكوين خطط تلقائية وميزات طبية متخصصة للمدربين."
                  : "Configure automated scaling and specialized medical features for your instructors."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                {isRTL ? "حفظ كمسودة" : "Save Draft"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100"
              >
                <Sparkles className="h-4 w-4" />
                {isRTL ? "محسن الذكاء" : "AI Optimizer"}
              </Button>
              <Button
                type="submit"
                className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                {isRTL ? "نشر الخطة" : "Publish Plan"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-3">
              <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <BadgeCheck className="h-4 w-4" />
                  </span>
                  <div className="text-base font-extrabold text-slate-900">
                    {isRTL ? "الإعدادات" : "Configuration"}
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <FormField
                    name="name.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {isRTL ? "اسم الخطة" : "Plan Name"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={isRTL ? "مثال: خطة طبية متخصصة" : "e.g. Specialized CME Pro"}
                            value={field.value}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v);
                              form.setValue("name.ar", v || form.getValues("name.ar"), {
                                shouldValidate: true,
                              });
                            }}
                            className="h-11 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="description.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-slate-600">
                          {isRTL ? "وصف مختصر" : "Short Description"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={isRTL ? "الأفضل للمؤسسات الطبية المتخصصة" : "Best for specialized medical institutions."}
                            value={field.value}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v);
                              form.setValue("description.ar", v || form.getValues("description.ar"), {
                                shouldValidate: true,
                              });
                            }}
                            className="h-11 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-600">
                            {isRTL ? "شهرياً" : "Monthly ($)"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="discountedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-600">
                            {isRTL ? "سنوياً" : "Yearly ($)"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-600">
                            {isRTL ? "العملة" : "Currency"}
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500/20">
                                <SelectValue placeholder="USD" />
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
                      name="vat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-slate-600">
                            {isRTL ? "عمولة المنصة (%)" : "Platform Commission (%)"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/40 px-3 py-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>{isRTL ? "النطاق" : "Range"}</span>
                      <span className="text-slate-600">
                        {isRTL ? "الحالي" : "CURRENT"}:{" "}
                        <span className="font-extrabold text-emerald-700">
                          {Number.parseFloat(watchFee || "0") || 0}%
                        </span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={25}
                      step={1}
                      value={Number.parseFloat(watchFee || "0") || 0}
                      onChange={(e) =>
                        form.setValue("vat", String(e.target.value), { shouldValidate: true })
                      }
                      className="mt-2 w-full accent-emerald-600"
                    />
                    <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                      <span>0%</span>
                      <span>25%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-900">
                  <Sparkles className="h-4 w-4" />
                  {isRTL ? "اقتراحات ذكية" : "Smart Suggestions"}
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-emerald-100 bg-white p-4">
                    <div className="text-sm font-extrabold text-slate-900">
                      {isRTL ? "أضف أتمتة CME" : "Add 'CME Automation'"}
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {isRTL
                        ? "خطط CME المشابهة تحقق تحسنًا في الاحتفاظ عبر الاعتمادات الآلية."
                        : "Similar healthcare plans see higher retention with automated credits."}
                    </p>
                    <button
                      type="button"
                      onClick={() => addSuggested("cme")}
                      className="mt-2 text-xs font-extrabold text-emerald-700 hover:underline"
                    >
                      {isRTL ? "أضف إلى الخطة" : "Add to Plan"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-white p-4">
                    <div className="text-sm font-extrabold text-slate-900">
                      {isRTL ? "ضمّن عارض DICOM" : "Bundle 'DICOM Viewer'"}
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {isRTL
                        ? "موصى به للدورات التعليمية الإشعاعية."
                        : "Recommended for high-tier radiology educational courses."}
                    </p>
                    <button
                      type="button"
                      onClick={() => addSuggested("dicom")}
                      className="mt-2 text-xs font-extrabold text-emerald-700 hover:underline"
                    >
                      {isRTL ? "أضف إلى الخطة" : "Add to Plan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle column */}
            <div className="space-y-6 lg:col-span-6">
              <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="text-base font-extrabold text-slate-900">
                        {isRTL ? "محدد الميزات" : "Feature Selector"}
                      </div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {isRTL ? "اختر ميزات الخطة" : "Select your plan features"}
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 sm:self-auto">
                    {selectedCount} {isRTL ? "ميزة محددة" : "Features Selected"}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={featureQuery}
                      onChange={(e) => setFeatureQuery(e.target.value)}
                      placeholder={isRTL ? "ابحث في الميزات..." : "Search features..."}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {(
                  [
                    "Healthcare Specialized",
                    "LMS Core",
                    "Analytics & Marketing",
                  ] as const
                ).map((g) => (
                  <div key={g} className="space-y-3">
                    <div className="px-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      {g}
                    </div>
                    <div className="space-y-3">
                      {grouped[g].map((f) => {
                        const Icon =
                          f.iconKey === "cme"
                            ? Stethoscope
                            : f.iconKey === "dicom"
                              ? GraduationCap
                              : f.iconKey === "hipaa"
                                ? ShieldCheck
                                : f.iconKey === "live"
                                  ? PlaySquare
                                  : f.iconKey === "quiz"
                                    ? FileText
                                    : LineChart;

                        return (
                          <div
                            key={f.id}
                            className={[
                              "group rounded-2xl border bg-white p-4 shadow-sm transition",
                              f.included
                                ? "border-emerald-200 ring-1 ring-emerald-100"
                                : "border-slate-200/70 hover:border-slate-300",
                            ].join(" ")}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-start gap-3">
                                <div
                                  className={[
                                    "mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ring-1",
                                    f.included
                                      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                      : "bg-slate-50 text-slate-600 ring-slate-200",
                                  ].join(" ")}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-extrabold text-slate-900">
                                    {f.name[locale as "en" | "ar"] || f.name.en}
                                  </div>
                                  <div className="mt-0.5 text-xs font-medium text-slate-500">
                                    {f.description[locale as "en" | "ar"] || f.description.en}
                                  </div>
                                </div>
                              </div>

                              <Switch
                                checked={f.included}
                                onCheckedChange={() => toggleFeature(f.id)}
                                className="data-[state=checked]:bg-emerald-600"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6 lg:col-span-3">
              <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
                <div className="flex items-center justify-between bg-emerald-600 px-4 py-3">
                  <div className="text-xs font-extrabold uppercase tracking-widest text-white/90">
                    {isRTL ? "معاينة مباشرة" : "LIVE PREVIEW"}
                  </div>
                  <Eye className="h-4 w-4 text-white/90" />
                </div>
                <div className="p-5">
                  <div className="text-xl font-extrabold text-slate-900">
                    {watchName[locale as "en" | "ar"] || watchName.en}
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-500">
                    {watchDesc[locale as "en" | "ar"] || watchDesc.en}
                  </div>

                  <div className="mt-5 flex items-end gap-2">
                    <div className="text-4xl font-extrabold tracking-tight text-slate-900">
                      {currencySymbols[watchCurrency] || "$"}
                      {Number.parseFloat(watchPrice || "0") || 0}
                    </div>
                    <div className="pb-1 text-sm font-semibold text-slate-500">
                      {isRTL ? "/شهر" : "/month"}
                    </div>
                  </div>

                  <Button className="mt-5 h-11 w-full rounded-xl bg-emerald-600 text-sm font-extrabold text-white hover:bg-emerald-700">
                    {isRTL ? "ابدأ الآن" : "Get Started"}
                  </Button>

                  <div className="mt-5 space-y-2">
                    {features
                      .filter((f) => f.included)
                      .slice(0, 4)
                      .map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="truncate">
                            {f.name[locale as "en" | "ar"] || f.name.en}
                          </span>
                        </div>
                      ))}

                    <div className="flex items-center gap-2 pt-1 text-sm font-semibold text-slate-700">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate">
                        {(Number.parseFloat(watchFee || "0") || 0).toFixed(0)}%{" "}
                        {isRTL ? "رسوم المعاملات" : "Transaction Fee"}
                      </span>
                    </div>

                    {selectedCount > 4 ? (
                      <div className="pt-1 text-xs font-semibold text-slate-400">
                        + {selectedCount - 4} {isRTL ? "ميزات أخرى..." : "more features..."}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      <FileText className="h-4 w-4" />
                      {isRTL ? "السعر السنوي" : "Yearly price"}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-700">
                      {currencySymbols[watchCurrency] || "$"}
                      {Number.parseFloat(watchYearly || "0") || 0}{" "}
                      <span className="text-slate-400">
                        {isRTL ? "/سنة" : "/year"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5 shadow-sm">
                <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
                  {isRTL ? "فحص الامتثال" : "COMPLIANCE CHECK"}
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-white">
                      {isRTL
                        ? "هذه الخطة تستوفي متطلبات GDPR و HIPAA."
                        : "This plan meets all current GDPR & HIPAA LMS requirements for medical education."}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-white/60">
                      {isRTL ? "3 شهادات مضمنة" : "3 Certifications Included"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  <Wrench className="h-4 w-4" />
                  {isRTL ? "نصيحة" : "Tip"}
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-700">
                  {isRTL
                    ? "يمكنك البحث في الميزات وتفعيلها أو إيقافها بسرعة."
                    : "Use search to quickly toggle relevant plan features."}
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

