"use client";

import { use, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  Calendar,
  Copy,
  DollarSign,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  MoreVertical,
  Pencil,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Store,
  Tag,
  Wallet,
} from "lucide-react";

import Avatar from "@/components/shared/Avatar";
import { Link } from "@/i18n/navigation";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Sellers } from "@/constants/sellers";

function formatNumber(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc).format(value);
}

function formatCurrency(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hashToNumber(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash;
}

export default function SellerDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "1";

  const seller = useMemo(() => Sellers.find((s) => String(s.id) === String(slug)) || null, [slug]);

  const title = seller?.name || (isAr ? "تفاصيل البائع" : "Seller Details");

  const seed = useMemo(
    () => hashToNumber(`seller:${slug}:${seller?.name || "unknown"}`),
    [seller?.name, slug],
  );

  const statusLabel = useMemo(() => {
    const active = seller?.isActive ?? true;
    const pending = seed % 7 === 0;
    if (!active) return isAr ? "موقوف" : "Suspended";
    if (pending) return isAr ? "قيد المراجعة" : "Pending";
    return isAr ? "نشط" : "Active";
  }, [isAr, seed, seller?.isActive]);

  const statusTone = useMemo(() => {
    if (statusLabel === (isAr ? "موقوف" : "Suspended"))
      return { bg: "bg-rose-50", ring: "ring-rose-100", text: "text-rose-700", dot: "bg-rose-500" };
    if (statusLabel === (isAr ? "قيد المراجعة" : "Pending"))
      return { bg: "bg-amber-50", ring: "ring-amber-100", text: "text-amber-700", dot: "bg-amber-500" };
    return { bg: "bg-emerald-50", ring: "ring-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
  }, [isAr, statusLabel]);

  const joiningDate = useMemo(() => {
    const year = 2021 + (seed % 4);
    const month = (seed % 12) + 1;
    const day = (seed % 26) + 1;
    return new Date(Date.UTC(year, month - 1, day));
  }, [seed]);

  const joiningDateText = useMemo(() => {
    const loc = isAr ? "ar-EG" : "en-US";
    return new Intl.DateTimeFormat(loc, { year: "numeric", month: "short", day: "2-digit" }).format(
      joiningDate,
    );
  }, [isAr, joiningDate]);

  const lifetimeSales = useMemo(() => {
    const base = (seller?.customers ?? 500) * 140 + (seller?.sales ?? 200) * 860;
    const wobble = (seed % 50000) * 1.25;
    return Math.round((base + wobble) / 10) * 10;
  }, [seed, seller?.customers, seller?.sales]);

  const currentRating = useMemo(() => {
    const base = seller?.rating ? 3.6 + seller.rating * 0.22 : 4.2;
    const wobble = ((seed % 7) - 3) * 0.08;
    return clamp(base + wobble, 3.6, 5);
  }, [seed, seller?.rating]);

  const totalProducts = useMemo(() => {
    const base = (seller?.products ?? 10) * 28;
    return base + (seed % 120);
  }, [seed, seller?.products]);

  const verifiedLabel = useMemo(() => {
    if (isAr) return "موزّع طبي موثّق";
    return "Verified Medical Distributor";
  }, [isAr]);

  type TabId = "products" | "orders" | "payouts" | "docs";
  const [tab, setTab] = useState<TabId>("products");
  const [productQuery, setProductQuery] = useState("");
  const [productCategory, setProductCategory] = useState<string>("all");
  const [productPage, setProductPage] = useState(1);

  const productCatalog = useMemo(() => {
    const categories = [
      { id: "protective", label: isAr ? "معدات وقاية" : "Protective Gear" },
      { id: "diagnostics", label: isAr ? "تشخيص" : "Diagnostics" },
      { id: "cardiology", label: isAr ? "قلب" : "Cardiology" },
      { id: "orthopedics", label: isAr ? "عظام" : "Orthopedics" },
    ];

    const names = [
      isAr ? "قفازات نيتريل (علبة 100)" : "Nitril Medical Gloves (Box 100)",
      isAr ? "مقياس حرارة رقمي" : "Digital Infrared Thermometer",
      isAr ? "جهاز ضغط أوتوماتيك - برو" : "Automatic BP Monitor - Pro",
      isAr ? "كمامة N95 (علبة 20)" : "N95 Face Mask (Box 20)",
      isAr ? "ميزان حرارة أذن" : "Ear Thermometer",
      isAr ? "سماعة طبية - بريميوم" : "Stethoscope - Premium",
      isAr ? "قناع أكسجين" : "Oxygen Mask",
      isAr ? "حزام داعم للركبة" : "Knee Support Brace",
      isAr ? "جهاز قياس سكر" : "Glucometer Kit",
      isAr ? "قسطرة طبية" : "Medical Catheter",
      isAr ? "ضمادات معقمة" : "Sterile Bandages",
      isAr ? "مقص جراحي" : "Surgical Scissors",
    ];

    const images = [
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1584516150909-c43483ee7932?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=400&q=80",
    ];

    return Array.from({ length: totalProducts }, (_, idx) => {
      const s = hashToNumber(`${seed}:${idx}:${slug}`);
      const cat = categories[s % categories.length];
      const name = names[idx % names.length];
      const sku = `SKU: MT-${String(8000 + (s % 9000))}-${String.fromCharCode(65 + (s % 20))}`;
      const stock = 10 + (s % 2000);
      const price = Math.round((12 + (s % 160) + (s % 99) / 100) * 100) / 100;
      const img = images[s % images.length];
      const stockPct = clamp(Math.round((stock / 2000) * 100), 5, 100);
      return { id: `p-${idx + 1}`, name, sku, category: cat, stock, stockPct, price, img };
    });
  }, [isAr, seed, slug, totalProducts]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return productCatalog.filter((p) => {
      const categoryOk = productCategory === "all" ? true : p.category.id === productCategory;
      if (!categoryOk) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [productCatalog, productCategory, productQuery]);

  const itemsPerPage = 6;
  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safeProductPage = clamp(productPage, 1, totalProductPages);
  const productStartIndex = (safeProductPage - 1) * itemsPerPage;
  const productRows = filteredProducts.slice(productStartIndex, productStartIndex + itemsPerPage);

  const tabs = useMemo(
    () =>
      [
        { id: "products" as const, label: isAr ? "المنتجات" : "Products", icon: Tag },
        { id: "orders" as const, label: isAr ? "سجل الطلبات" : "Order History", icon: FileText },
        { id: "payouts" as const, label: isAr ? "المدفوعات" : "Payouts", icon: Wallet },
        { id: "docs" as const, label: isAr ? "مستندات التحقق" : "Verification Docs", icon: ShieldCheck },
      ] satisfies Array<{ id: TabId; label: string; icon: React.ElementType }>,
    [isAr],
  );

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F3F6F4] p-4 duration-700 md:p-8">
      <div className="mx-auto max-w-[1440px] space-y-5">
        {/* Breadcrumb */}
        <div className="text-xs font-semibold text-slate-500">
          <Link href="/admin/sellers" className="hover:underline">
            {isAr ? "البائعين" : "Sellers"}
          </Link>{" "}
          <span className="mx-1">›</span>
          <span className="text-slate-700">{title}</span>
        </div>

        {/* Header card */}
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  className="h-16 w-16 rounded-2xl border border-white shadow-sm ring-1 ring-slate-100"
                  imageUrl={seller?.image}
                  name={seller?.name || "Seller"}
                />
                <span className={`absolute -bottom-1 -left-1 h-4 w-4 rounded-full ${statusTone.dot} ring-2 ring-white`} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-lg font-extrabold text-slate-900 md:text-xl">
                    {title}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ${statusTone.bg} ${statusTone.text} ring-1 ${statusTone.ring}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    {verifiedLabel}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>
                    {isAr ? "ID" : "ID"}:{" "}
                    <span className="font-extrabold text-slate-700">
                      {seller?.id || slug}
                    </span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {seller ? `${seller.city}, ${seller.country}` : "—"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-emerald-700">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-emerald-700 transition hover:bg-emerald-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {isAr ? "زيارة المتجر" : "Visit Storefront"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl px-2 py-1 text-slate-600 transition hover:bg-slate-50"
                  >
                    <Copy className="h-4 w-4" />
                    {isAr ? "نسخ الرابط" : "Copy Link"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/admin/sellers/${encodeURIComponent(slug)}?edit=1`}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                {isAr ? "تعديل البائع" : "Edit Seller"}
              </Link>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <MessageSquare className="h-4 w-4" />
                {isAr ? "رسالة" : "Message"}
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-xs font-extrabold text-rose-700 shadow-sm transition hover:bg-rose-50"
              >
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {isAr ? "إيقاف" : "Suspend"}
              </button>
            </div>
          </div>

          {editMode ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
              {isAr
                ? "وضع التعديل (واجهة فقط) — اربط حقول API لاحقاً."
                : "Edit mode (UI only) — connect to API later."}
            </div>
          ) : null}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: isAr ? "إجمالي المبيعات" : "Lifetime Sales",
              value: formatCurrency(lifetimeSales, locale),
              sub: isAr ? "+12% هذا الشهر" : "+12% this month",
              icon: DollarSign,
              tone: "emerald",
            },
            {
              label: isAr ? "التقييم الحالي" : "Current Rating",
              value: `${currentRating.toFixed(1)} / 5.0`,
              sub: isAr ? "من 8.2 مراجعة" : "From 8.2 total reviews",
              icon: Star,
              tone: "amber",
            },
            {
              label: isAr ? "إجمالي المنتجات" : "Total Products",
              value: formatNumber(totalProducts, locale),
              sub: isAr ? "24 منتج نفد" : "24 items out of stock",
              icon: Tag,
              tone: "indigo",
            },
            {
              label: isAr ? "تاريخ الانضمام" : "Joining Date",
              value: joiningDateText,
              sub: isAr ? "عضو منذ 2.4 سنة" : "Member for 2.4 years",
              icon: Calendar,
              tone: "slate",
            },
          ].map((c) => {
            const Icon = c.icon;
            const tone =
              c.tone === "emerald"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                : c.tone === "amber"
                  ? "bg-amber-50 text-amber-700 ring-amber-100"
                  : c.tone === "indigo"
                    ? "bg-indigo-50 text-indigo-700 ring-indigo-100"
                    : "bg-slate-50 text-slate-700 ring-slate-100";
            return (
              <div key={c.label} className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                      {c.label}
                    </div>
                    <div className="mt-2 text-xl font-extrabold text-slate-900 md:text-2xl">
                      {c.value}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-emerald-600">
                      {c.sub}
                    </div>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left column */}
          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                <Building2 className="h-4 w-4 text-emerald-700" />
                <div className="text-sm font-extrabold text-slate-900">
                  {isAr ? "معلومات المتجر" : "Store Information"}
                </div>
              </div>

              <div className="space-y-5 px-5 py-4 text-sm">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    {isAr ? "عنوان النشاط" : "Business Address"}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-700">
                    882 Healthcare Plaza, Suite 400
                    <br />
                    Medical District, {seller?.city || "Cairo"}, IL 60612
                    <br />
                    {seller?.country || "Egypt"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      {isAr ? "الرقم الضريبي" : "Tax ID / EIN"}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-700">
                      {String(120000000 + (seed % 900000000)).replace(/(\d{2})(\d{7})(\d)/, "$1-$2$3")}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      {isAr ? "نوع الشركة" : "Company Type"}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-700">
                      {isAr ? "شركة" : "Corporation"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    {isAr ? "جهة الاتصال" : "Primary Contact"}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                      <img
                        src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80"
                        alt="Contact"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-slate-900">
                        {isAr ? "سارة ميلر" : "Sarah J. Miller"}
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        {isAr ? "مدير عمليات المبيعات" : "Head of Sales Operations"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold">
                        s.miller@{(seller?.name || "medicova").toLowerCase().replace(/\s+/g, "")}.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <div className="text-sm font-extrabold">
                  {isAr ? "حالة الامتثال" : "Compliance Status"}
                </div>
              </div>
              <p className="mt-2 text-sm font-medium text-emerald-900/80">
                {isAr
                  ? "جميع التراخيص الطبية والمستندات الضريبية محدثة. المراجعة القادمة مجدولة في ديسمبر 2024."
                  : "All medical licenses and tax documents are currently up-to-date. Next verification review scheduled for Dec 2024."}
              </p>
              <button
                type="button"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-xs font-extrabold text-emerald-700 shadow-sm ring-1 ring-emerald-200 transition hover:bg-emerald-50"
              >
                {isAr ? "عرض تقرير الامتثال" : "View Compliance Report"}
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 pt-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-wrap items-center gap-6">
                  {tabs.map((t) => {
                    const Icon = t.icon;
                    const active = tab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        className={[
                          "relative inline-flex items-center gap-2 pb-3 text-sm font-extrabold transition",
                          active ? "text-emerald-700" : "text-slate-500 hover:text-slate-700",
                        ].join(" ")}
                      >
                        <Icon className="h-4 w-4" />
                        {t.label}
                        {active ? (
                          <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-emerald-600" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-5">
                {tab === "products" ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="relative w-full max-w-md">
                        <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={productQuery}
                          onChange={(e) => {
                            setProductQuery(e.target.value);
                            setProductPage(1);
                          }}
                          placeholder={isAr ? "ابحث عن منتج..." : "Search products..."}
                          className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/40 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none ring-emerald-100 focus:bg-white focus:ring-2"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                          <select
                            value={productCategory}
                            onChange={(e) => {
                              setProductCategory(e.target.value);
                              setProductPage(1);
                            }}
                            className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 shadow-sm outline-none transition hover:bg-slate-50"
                          >
                            <option value="all">{isAr ? "كل الفئات" : "All Categories"}</option>
                            <option value="protective">{isAr ? "معدات وقاية" : "Protective Gear"}</option>
                            <option value="diagnostics">{isAr ? "تشخيص" : "Diagnostics"}</option>
                            <option value="cardiology">{isAr ? "قلب" : "Cardiology"}</option>
                            <option value="orthopedics">{isAr ? "عظام" : "Orthopedics"}</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
                          aria-label={isAr ? "فلترة" : "Filter"}
                        >
                          <SlidersHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200/70">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-left text-sm">
                          <thead>
                            <tr className="bg-slate-50/60 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                              <th className="px-5 py-3">{isAr ? "المنتج" : "Product"}</th>
                              <th className="px-5 py-3">{isAr ? "الفئة" : "Category"}</th>
                              <th className="px-5 py-3">{isAr ? "المخزون" : "Stock"}</th>
                              <th className="px-5 py-3">{isAr ? "السعر" : "Price"}</th>
                              <th className="px-5 py-3">{isAr ? "إجراءات" : "Actions"}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productRows.map((p) => (
                              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/40">
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-12 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                                      <img src={p.img} alt={p.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="truncate text-sm font-extrabold text-slate-900">
                                        {p.name}
                                      </div>
                                      <div className="mt-0.5 text-[11px] font-semibold text-slate-500">
                                        {p.sku}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="text-sm font-semibold text-slate-700">
                                    {p.category.label}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-2 w-28 rounded-full bg-slate-100">
                                      <div
                                        className="h-2 rounded-full bg-emerald-500"
                                        style={{ width: `${p.stockPct}%` }}
                                      />
                                    </div>
                                    <div className="text-sm font-extrabold text-slate-900">
                                      {formatNumber(p.stock, locale)}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="text-sm font-extrabold text-slate-900">
                                    {formatCurrency(p.price, locale)}
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <button
                                    type="button"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                                    aria-label={isAr ? "المزيد" : "More"}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {productRows.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
                                  {isAr ? "لا توجد منتجات" : "No products found"}
                                </td>
                              </tr>
                            ) : null}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs font-medium text-slate-500">
                          {isAr
                            ? `عرض ${productStartIndex + 1} إلى ${Math.min(
                                productStartIndex + itemsPerPage,
                                filteredProducts.length,
                              )} من ${formatNumber(filteredProducts.length, locale)} منتج`
                            : `Showing ${productStartIndex + 1} to ${Math.min(
                                productStartIndex + itemsPerPage,
                                filteredProducts.length,
                              )} of ${formatNumber(filteredProducts.length, locale)} products`}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setProductPage((p) => clamp(p - 1, 1, totalProductPages))}
                            disabled={safeProductPage === 1}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={isAr ? "السابق" : "Previous"}
                          >
                            ‹
                          </button>
                          {Array.from({ length: Math.min(3, totalProductPages) }, (_, i) => i + 1).map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setProductPage(n)}
                              className={[
                                "inline-flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-extrabold transition",
                                n === safeProductPage
                                  ? "border-emerald-200 bg-emerald-600 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              {n}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setProductPage((p) => clamp(p + 1, 1, totalProductPages))}
                            disabled={safeProductPage === totalProductPages}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label={isAr ? "التالي" : "Next"}
                          >
                            ›
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-6">
                    <div className="flex items-center gap-2 text-slate-900">
                      {tab === "orders" ? (
                        <FileText className="h-4 w-4 text-slate-500" />
                      ) : tab === "payouts" ? (
                        <Wallet className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-slate-500" />
                      )}
                      <div className="text-sm font-extrabold">
                        {tab === "orders"
                          ? isAr
                            ? "سجل الطلبات"
                            : "Order history"
                          : tab === "payouts"
                            ? isAr
                              ? "المدفوعات"
                              : "Payouts"
                            : isAr
                              ? "مستندات التحقق"
                              : "Verification docs"}
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      {isAr
                        ? "هذا القسم واجهة فقط حالياً — سيتم ربط بيانات API لاحقاً."
                        : "This section is UI-only for now — connect to API later."}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        <Store className="h-4 w-4" />
                        {isAr ? "فتح التقرير" : "Open report"}
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {isAr ? "تواصل" : "Contact"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

