"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Switch } from "@/components/shared/switch";
import {
  Check,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Store,
  Truck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/util";
import { useSession } from "next-auth/react";
import { getProducts, ApiProduct } from "@/services/productService";
import { getCustomers, ApiCustomer } from "@/services/customerService";
import { createOrder, CreateOrderPayload } from "@/services/orderService";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

type Customer = {
  id: string;
  name: string;
  dept: string;
  city: string;
  phone: string;
};

type LineItem = {
  id: string;
  name: string;
  sku: string;
  price: number;
  image: string;
  color: string;
  size: string;
  qty: number;
};

function formatMoney(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AddNewOrderPage() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const router = useRouter();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [customerQuery, setCustomerQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<ApiCustomer | null>(
    null,
  );
  const [isCustomerMenuOpen, setIsCustomerMenuOpen] = useState(false);
  const customerMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerMenuRef.current &&
        !customerMenuRef.current.contains(event.target as Node)
      ) {
        setIsCustomerMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [items, setItems] = useState<LineItem[]>([]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [pData, cData] = await Promise.all([
          getProducts(token),
          getCustomers(token),
        ]);
        setProducts(pData);
        setCustomers(cData);
      } catch (err) {
        console.error("Failed to fetch order creation data:", err);
        toast.error(isArabic ? "فشل تحميل البيانات" : "Failed to load data");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [token, isArabic]);

  const catalog = useMemo(() => {
    return products.map((p) => {
      const price =
        p.pricing?.salePrice ||
        p.pricing?.sale_price ||
        p.sale_price ||
        p.salePrice ||
        p.pricing?.originalPrice ||
        p.pricing?.original_price ||
        p.originalPrice ||
        p.original_price ||
        p.price ||
        0;
      return {
        id: p._id,
        name:
          (isArabic ? p.nameAr : p.nameEn) ||
          p.nameEn ||
          p.nameAr ||
          "Unnamed Product",
        sku: p.sku || p.identity?.sku || `SKU-${p._id.slice(-6)}`,
        price: Number(price),
        sellerId:
          p.sellerId ||
          (typeof p.seller === "object" ? (p.seller as any)?._id : p.seller) ||
          null,
        image:
          p.media?.featuredImages ||
          (p.media?.galleryImages && p.media.galleryImages[0]) ||
          "/images/placeholder.jpg",
        colors: ["Standard"],
        sizes: ["Standard"],
      };
    });
  }, [products, isArabic]);

  const [draft, setDraft] = useState<
    Record<string, { color: string; size: string; qty: number }>
  >({});

  const filteredCatalog = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((p) => {
      const hay = `${p.name} ${p.sku}`.toLowerCase();
      return hay.includes(q);
    });
  }, [catalog, productQuery]);

  const addToOrder = (id: string) => {
    const p = catalog.find((x) => x.id === id);
    if (!p) return;
    const d = draft[id] || { color: p.colors[0]!, size: p.sizes[0]!, qty: 1 };
    setItems((prev) => {
      const existing = prev.find(
        (x) => x.id === id && x.color === d.color && x.size === d.size,
      );
      if (existing) {
        return prev.map((x) =>
          x === existing ? { ...x, qty: x.qty + Math.max(1, d.qty) } : x,
        );
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          sku: p.sku,
          price: p.price,
          image: p.image,
          color: d.color,
          size: d.size,
          qty: Math.max(1, d.qty),
        },
      ];
    });
  };

  const removeCustomer = () => setSelectedCustomer(null);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers.slice(0, 10);
    return customers.filter(
      (c) =>
        `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q),
    );
  }, [customers, customerQuery]);

  const [taxExempt, setTaxExempt] = useState(false);

  // ... (subtotal, shipping, tax, total memos remain same logic)
  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.price * it.qty, 0),
    [items],
  );
  const shipping = useMemo(() => (items.length ? 50 : 0), [items.length]); // Fixed shipping
  const tax = useMemo(
    () => (taxExempt ? 0 : subtotal * 0.14), // Egyptian VAT is 14%
    [subtotal, taxExempt],
  );
  const total = subtotal + shipping + tax;

  const onCreate = async () => {
    if (!selectedCustomer) {
      toast.error(isArabic ? "يرجى اختيار عميل" : "Please select a customer");
      return;
    }
    if (items.length === 0) {
      toast.error(
        isArabic
          ? "يرجى إضافة منتج واحد على الأقل"
          : "Please add at least one item",
      );
      return;
    }

    if (!token) {
      toast.error(
        isArabic
          ? "جلسة العمل منتهية، يرجى إعادة تسجيل الدخول"
          : "Session expired, please login again",
      );
      return;
    }

    setSubmitting(true);
    try {
      // For Admins, we usually need to specify a sellerId.
      // We'll take it from the first item for now, or default to null if it's a multi-seller order (though API might reject it)
      const firstItemSellerId =
        items.length > 0
          ? catalog.find((p) => p.id === items[0].id)?.sellerId
          : null;

      const payload: CreateOrderPayload = {
        customerId: selectedCustomer._id,
        sellerId: firstItemSellerId,
        items: items.map((it) => ({
          productId: it.id,
          productName: it.name,
          productNameAr: it.name, // Fallback if not available
          sku: it.sku,
          quantity: it.qty,
          unitPrice: it.price,
          discount: 0,
          subtotal: it.price * it.qty,
          productImage: it.image,
          size: it.size === "Standard" ? null : it.size,
        })),
        subtotal,
        discountAmount: 0,
        shippingCost: shipping,
        tax,
        total,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "pending",
      };

      await createOrder(payload, token);
      toast.success(
        isArabic ? "تم إنشاء الطلب بنجاح" : "Order created successfully",
      );
      router.push("/admin/orders");
    } catch (err) {
      console.error("Order creation failed:", err);
      toast.error(isArabic ? "فشل إنشاء الطلب" : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-sm font-bold text-slate-500">
            {isArabic ? "جاري تحميل البيانات..." : "Loading data..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F8FAFC] p-4 duration-700 md:p-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Breadcrumbs */}
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/orders" className="hover:text-slate-700">
            {isArabic ? "الطلبات" : "Orders"}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{isArabic ? "إضافة طلب جديد" : "Add New Order"}</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {isArabic ? "إضافة طلب جديد" : "Add New Order"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
              {isArabic
                ? "قم بتكوين وإنشاء معاملة جديدة لإمدادات طبية."
                : "Configure and create a new marketplace transaction for medical supplies."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/orders"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Link>
            <button
              type="button"
              onClick={onCreate}
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isArabic ? "إنشاء الطلب" : "Create Order"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left */}
          <div className="space-y-6 lg:col-span-8">
            {/* Customer Information */}
            <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 p-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                  1
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  {isArabic ? "معلومات العميل" : "Customer Information"}
                </div>
              </div>

              <div className="p-5">
                <div className="text-xs font-semibold text-slate-500">
                  {isArabic ? "بحث عن عميل" : "Search Customer"}
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div ref={customerMenuRef} className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setIsCustomerMenuOpen(!isCustomerMenuOpen)}
                      className={cn(
                        "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10",
                        isCustomerMenuOpen &&
                          "border-emerald-500 ring-2 ring-emerald-500/10",
                        !selectedCustomer && "text-slate-400",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <User
                          className={cn(
                            "h-4 w-4",
                            selectedCustomer
                              ? "text-emerald-600"
                              : "text-slate-400",
                          )}
                        />
                        <span
                          className={cn(
                            "truncate",
                            selectedCustomer && "font-bold text-slate-900",
                          )}
                        >
                          {selectedCustomer
                            ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                            : isArabic
                              ? "اختر عميلاً..."
                              : "Select a customer..."}
                        </span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-slate-400 transition-transform duration-200",
                          isCustomerMenuOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {isCustomerMenuOpen && (
                      <div className="animate-in fade-in zoom-in-95 pointer-events-auto absolute left-0 right-0 top-full z-30 mt-2 max-h-[400px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 duration-200">
                        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 p-3 backdrop-blur-md">
                          <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            <Input
                              value={customerQuery}
                              onChange={(e) => setCustomerQuery(e.target.value)}
                              autoFocus
                              placeholder={
                                isArabic
                                  ? "بحث بالاسم أو البريد..."
                                  : "Search name or email..."
                              }
                              className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9 text-sm focus:bg-white"
                            />
                          </div>
                        </div>

                        <div className="custom-scrollbar max-h-[300px] overflow-auto p-1.5">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((cust) => (
                              <button
                                key={cust._id}
                                type="button"
                                onClick={() => {
                                  setSelectedCustomer(cust);
                                  setIsCustomerMenuOpen(false);
                                  setCustomerQuery("");
                                }}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50",
                                  selectedCustomer?._id === cust._id &&
                                    "bg-emerald-50/50",
                                )}
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  <div
                                    className={cn(
                                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
                                      selectedCustomer?._id === cust._id
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-100 text-slate-500",
                                    )}
                                  >
                                    <User className="h-4.5 w-4.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div
                                      className={cn(
                                        "truncate text-sm font-bold",
                                        selectedCustomer?._id === cust._id
                                          ? "text-emerald-900"
                                          : "text-slate-900",
                                      )}
                                    >
                                      {cust.firstName} {cust.lastName}
                                    </div>
                                    <div className="truncate text-[11px] font-medium text-slate-500">
                                      {cust.email}
                                    </div>
                                  </div>
                                </div>
                                {selectedCustomer?._id === cust._id && (
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <User className="h-8 w-8 text-slate-200" />
                              <p className="mt-2 text-xs font-semibold text-slate-400">
                                {isArabic
                                  ? "لا يوجد عملاء مطابخين"
                                  : "No customers found"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-50/50 px-4 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100/50 transition hover:bg-emerald-100"
                  >
                    <Plus className="h-4 w-4" />
                    {isArabic
                      ? "طلب جديد لبائع غير مسجل"
                      : "Unregistered Customer"}
                  </button>
                </div>
              </div>
            </div>

            {/* Product Selection */}
            <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                    2
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    {isArabic ? "اختيار المنتجات" : "Product Selection"}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm font-semibold text-emerald-700 hover:underline"
                >
                  + {isArabic ? "إضافة عناصر متعددة" : "Add Multiple Items"}
                </button>
              </div>

              <div className="p-5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    placeholder={
                      isArabic
                        ? "ابحث باسم المنتج أو SKU أو الفئة..."
                        : "Search products by name, SKU, or category..."
                    }
                    className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="mt-4 space-y-4">
                  {filteredCatalog.map((p) => {
                    const d = draft[p.id] || {
                      color: p.colors[0]!,
                      size: p.sizes[0]!,
                      qty: 1,
                    };
                    return (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                              <Image
                                src={p.image}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-extrabold text-slate-900">
                                {p.name}
                              </div>
                              <div className="mt-1 text-xs font-semibold text-slate-500">
                                SKU: {p.sku}
                              </div>
                            </div>
                          </div>
                          <div className="text-lg font-extrabold text-slate-900">
                            {formatMoney(p.price, locale)}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
                          <div className="sm:col-span-4">
                            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                              {isArabic ? "اللون" : "Color"}
                            </div>
                            <select
                              value={d.color}
                              onChange={(e) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  [p.id]: { ...d, color: e.target.value },
                                }))
                              }
                              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                              {p.colors.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                              {isArabic ? "المقاس" : "Size"}
                            </div>
                            <select
                              value={d.size}
                              onChange={(e) =>
                                setDraft((prev) => ({
                                  ...prev,
                                  [p.id]: { ...d, size: e.target.value },
                                }))
                              }
                              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            >
                              {p.sizes.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                              {isArabic ? "الكمية" : "Quantity"}
                            </div>
                            <div className="flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    [p.id]: {
                                      ...d,
                                      qty: Math.max(1, d.qty - 1),
                                    },
                                  }))
                                }
                                className="h-8 w-8 rounded-lg text-sm font-extrabold text-slate-600 hover:bg-slate-100"
                              >
                                -
                              </button>
                              <div className="text-sm font-extrabold text-slate-900">
                                {d.qty}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    [p.id]: { ...d, qty: d.qty + 1 },
                                  }))
                                }
                                className="h-8 w-8 rounded-lg text-sm font-extrabold text-slate-600 hover:bg-slate-100"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <button
                              type="button"
                              onClick={() => addToOrder(p.id)}
                              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                            >
                              {isArabic ? "إضافة" : "Add to Order"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6 lg:col-span-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="text-sm font-extrabold text-slate-900">
                  {isArabic ? "ملخص الطلب" : "Order Summary"}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500">
                  {isArabic
                    ? "المجموع يتم حسابه تلقائياً..."
                    : "Auto-calculating total..."}
                </div>
              </div>

              <div className="p-5">
                <div className="space-y-4">
                  {items.map((it) => (
                    <div
                      key={`${it.id}:${it.color}:${it.size}`}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                          <Image
                            src={it.image}
                            alt={it.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-extrabold text-slate-900">
                            {it.name}
                          </div>
                          <div className="mt-0.5 text-xs font-semibold text-slate-500">
                            Qty: {it.qty} • {it.color}, {it.size}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {formatMoney(it.price * it.qty, locale)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex items-center justify-between font-semibold text-slate-600">
                    <span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span>
                    <span>{formatMoney(subtotal, locale)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-slate-600">
                    <span>{isArabic ? "الشحن" : "Shipping"}</span>
                    <span>{formatMoney(shipping, locale)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-slate-600">
                    <span>{isArabic ? "الضريبة (معفى)" : "Tax (Exempt)"}</span>
                    <span className={taxExempt ? "text-emerald-700" : ""}>
                      {formatMoney(tax, locale)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm font-extrabold text-slate-900">
                  <span>{isArabic ? "الإجمالي المستحق" : "Total Due"}</span>
                  <span className="text-lg text-emerald-700">
                    {formatMoney(total, locale)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                  <div className="text-sm font-semibold text-slate-700">
                    {isArabic ? "إعفاء ضريبي" : "Tax Exempt"}
                  </div>
                  <Switch
                    checked={taxExempt}
                    onCheckedChange={(v) => setTaxExempt(Boolean(v))}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>

                <Button
                  type="button"
                  onClick={onCreate}
                  disabled={submitting}
                  className="mt-4 h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-extrabold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isArabic ? "تأكيد الطلب" : "Confirm Order"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 h-12 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  {isArabic ? "حفظ كمسودة" : "Save as Draft"}
                </Button>

                <div className="mt-3 text-center text-[11px] font-medium text-slate-400">
                  {isArabic
                    ? "بتأكيد الطلب، أنت توافق على شروط الخدمة وسياسة التنفيذ."
                    : "By confirming, you agree to HealthMarket’s Terms of Service and Fulfillment Policy."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
