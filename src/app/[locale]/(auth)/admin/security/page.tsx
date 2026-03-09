"use client";

import React, { useMemo, useState } from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  BadgeCheck,
  ChevronRight,
  Globe,
  LayoutGrid,
  Link2,
  Lock,
  Megaphone,
  Settings2,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Switch } from "@/components/shared/switch";
import toast from "react-hot-toast";

type SettingsNavKey =
  | "general"
  | "branding"
  | "integrations"
  | "marketing"
  | "security"
  | "maintenance"
  | "api"
  | "webhooks";

export default function SiteSettingsPage() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  const [active, setActive] = useState<SettingsNavKey>("general");
  const [academyName, setAcademyName] = useState("Medicova");
  const [supportEmail, setSupportEmail] = useState("support@medicova.net");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("GMT (Europe/London)");
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("GBP (£)");
  const [seoTitle, setSeoTitle] = useState(
    "Medicova | Medical Education & Resources",
  );
  const [metaDescription, setMetaDescription] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [studentRegistration, setStudentRegistration] = useState(true);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const faviconLabel = useMemo(() => {
    if (!faviconFile) {
      return isArabic
        ? "انقر للرفع (PNG, ICO حتى 1MB)"
        : "Click to upload (PNG, ICO up to 1MB)";
    }
    return faviconFile.name;
  }, [faviconFile, isArabic]);

  const navGroups = useMemo(
    () => [
      {
        label: isArabic ? "إدارة الموقع" : "SITE MANAGEMENT",
        items: [
          {
            key: "general" as const,
            label: isArabic ? "عام" : "General",
            icon: Settings2,
          },
          {
            key: "branding" as const,
            label: isArabic ? "الهوية" : "Branding",
            icon: BadgeCheck,
          },
          {
            key: "integrations" as const,
            label: isArabic ? "التكاملات" : "Integrations",
            icon: Link2,
          },
          {
            key: "marketing" as const,
            label: isArabic ? "التسويق والتحليلات" : "Marketing & Analytics",
            icon: Megaphone,
          },
          {
            key: "security" as const,
            label: isArabic ? "الأمان" : "Security",
            icon: Lock,
          },
          {
            key: "maintenance" as const,
            label: isArabic ? "الصيانة" : "Maintenance",
            icon: Wrench,
          },
        ],
      },
      {
        label: isArabic ? "متقدم" : "ADVANCED",
        items: [
          {
            key: "api" as const,
            label: isArabic ? "وصول API" : "API Access",
            icon: Globe,
          },
          {
            key: "webhooks" as const,
            label: isArabic ? "Webhooks" : "Webhooks",
            icon: LayoutGrid,
          },
        ],
      },
    ],
    [isArabic],
  );

  const onDiscard = () => {
    setAcademyName("Medicova");
    setSupportEmail("support@medicova.net");
    setAddress("");
    setTimezone("GMT (Europe/London)");
    setLanguage("English");
    setCurrency("GBP (£)");
    setSeoTitle("Medicova | Medical Education & Resources");
    setMetaDescription("");
    setMaintenanceMode(false);
    setStudentRegistration(true);
    setFaviconFile(null);
  };

  const onSave = () => {
    toast.success(isArabic ? "تم حفظ التغييرات" : "Changes saved");
  };

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="animate-in fade-in space-y-6 duration-700"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="truncate">
            {isArabic ? "إعدادات الموقع" : "Site Settings"}
          </span>
          <ChevronRight className="h-4 w-4" />
          <span className="truncate">{isArabic ? "عام" : "General"}</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
          {isArabic ? "الإعدادات العامة" : "General Settings"}
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {isArabic
            ? "إدارة معلومات الموقع الأساسية والتفضيلات الإقليمية."
            : "Manage your site's core information and regional preferences."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
          {navGroups.map((g) => (
            <div key={g.label} className="mb-5 last:mb-0">
              <div className="px-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {g.label}
              </div>
              <div className="mt-2 space-y-1">
                {g.items.map((it) => {
                  const Icon = it.icon;
                  const isActive = active === it.key;
                  return (
                    <button
                      key={it.key}
                      type="button"
                      onClick={() => setActive(it.key)}
                      className={[
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition",
                        isActive
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={[
                            "flex h-8 w-8 items-center justify-center rounded-lg transition",
                            isActive
                              ? "bg-white/15"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        {it.label}
                      </span>
                      <ChevronRight
                        className={[
                          "h-4 w-4 transition",
                          isActive ? "text-white/90" : "text-slate-300",
                        ].join(" ")}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        <main className="space-y-6">
          {active !== "general" ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="text-sm font-extrabold text-slate-900">
                {isArabic ? "قريباً" : "Coming soon"}
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {isArabic
                  ? "هذه الصفحة قيد الإعداد. حالياً تم تنفيذ تصميم قسم الإعدادات العامة."
                  : "This section is being prepared. For now, the General Settings design is implemented."}
              </p>
            </div>
          ) : null}

          {/* Academy Details */}
          <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <Globe className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {isArabic ? "تفاصيل الموقع" : "Academy Details"}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="mb-1 text-[12px] font-semibold text-slate-600">
                  {isArabic ? "اسم الموقع" : "Academy Name"}
                </div>
                <Input
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="mb-1 text-[12px] font-semibold text-slate-600">
                  {isArabic ? "بريد الدعم" : "Support Email"}
                </div>
                <Input
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="mb-1 text-[12px] font-semibold text-slate-600">
                  {isArabic ? "العنوان الفعلي" : "Physical Address"}
                </div>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isArabic ? "أدخل العنوان" : "Enter address"}
                  className="min-h-[96px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </section>

          {/* Regional Settings */}
          <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <Globe className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {isArabic ? "الإعدادات الإقليمية" : "Regional Settings"}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div>
                <div className="mb-1 text-[12px] font-semibold text-slate-600">
                  {isArabic ? "المنطقة الزمنية" : "Timezone"}
                </div>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option>GMT (Europe/London)</option>
                  <option>UTC</option>
                  <option>GMT+2 (Africa/Cairo)</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-[12px] font-semibold text-slate-600">
                  {isArabic ? "اللغة" : "Language"}
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option>English</option>
                  <option>Arabic</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-[12px] font-semibold text-slate-600">
                  {isArabic ? "العملة" : "Currency"}
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option>GBP (£)</option>
                  <option>USD ($)</option>
                  <option>EGP (E£)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Site Meta & SEO */}
          <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <BadgeCheck className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {isArabic ? "بيانات الموقع و SEO" : "Site Meta & SEO"}
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-1 text-[12px] font-semibold text-slate-600">
                  {isArabic ? "أيقونة الموقع" : "Site Favicon"}
                </div>
                <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm font-semibold text-slate-500 hover:bg-slate-50/80">
                  <input
                    type="file"
                    accept="image/png,image/x-icon"
                    className="hidden"
                    onChange={(e) =>
                      setFaviconFile(e.target.files?.[0] ?? null)
                    }
                  />
                  {faviconLabel}
                </label>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-[12px] font-semibold text-slate-600">
                  <span>{isArabic ? "عنوان SEO" : "SEO Title"}</span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {Math.min(60, seoTitle.length)}/60{" "}
                    {isArabic ? "موصى به" : "recommended"}
                  </span>
                </div>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="h-11 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <div className="mb-1 text-[12px] font-semibold text-slate-600">
                  {isArabic ? "وصف الميتا" : "Meta Description"}
                </div>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={
                    isArabic
                      ? "وصف مختصر لنتائج البحث"
                      : "Brief description for search results"
                  }
                  className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </section>

          {/* Quick System Toggles */}
          <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <Wrench className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">
                {isArabic ? "مفاتيح النظام السريعة" : "Quick System Toggles"}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3">
                <div className="text-sm font-semibold text-slate-800">
                  {isArabic ? "تفعيل وضع الصيانة" : "Enable Maintenance Mode"}
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={(v) => setMaintenanceMode(Boolean(v))}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3">
                <div className="text-sm font-semibold text-slate-800">
                  {isArabic
                    ? "السماح بتسجيل الطلاب"
                    : "Allow Student Registration"}
                </div>
                <Switch
                  checked={studentRegistration}
                  onCheckedChange={(v) => setStudentRegistration(Boolean(v))}
                  className="data-[state=checked]:bg-emerald-600"
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onDiscard}
              className="h-10 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {isArabic ? "تجاهل" : "Discard"}
            </Button>
            <Button
              type="button"
              onClick={onSave}
              className="h-10 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              {isArabic ? "حفظ التغييرات" : "Save Changes"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
