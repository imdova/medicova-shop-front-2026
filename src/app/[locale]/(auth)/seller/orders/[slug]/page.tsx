"use client";

import { use, useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  Package,
  MapPin,
  CreditCard,
  ShoppingBag,
  Clock,
  Loader2,
  FileText,
  BadgeCheck,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  getOrderById,
  ApiOrder,
} from "@/services/orderService";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { getProductById, mapApiProductToProduct } from "@/services/productService";

function formatDateTime(value: Date, locale: string) {
  if (!value || isNaN(value.getTime())) return "N/A";
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.DateTimeFormat(loc, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export default function SellerOrderDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const locale = useAppLocale();
  const isAr = locale === "ar";

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const sellerId = (session as any)?.user?.id;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!token || !slug || !sellerId) return;
    setLoading(true);
    try {
      const data = await getOrderById(slug, token);
      if (data) {
        const d = data as any;
        
        // Robust Payment Check (Case-insensitive)
        const method = String(d.paymentMethod || "").toLowerCase();
        const status = String(d.paymentStatus || "").toLowerCase();
        const isPaidOrCod = status === "paid" || method === "cash_on_delivery" || method === "cod";
        
        if (!isPaidOrCod) {
          setOrder(null);
          return;
        }

        // Filter items for this seller only
        const sourceItems = (data.items && data.items.length > 0) ? data.items : (d.units || []);
        
        const filteredSourceItems = sourceItems.filter((it: any) => {
          const itemSellerId = 
            it.sellerId || 
            (typeof it.productId === 'object' && it.productId?.sellerId) ||
            it.seller?._id ||
            it.seller?.id ||
            (typeof it.productId === 'object' && it.productId?.seller?._id) ||
            (typeof it.productId === 'object' && it.productId?.seller?.id) ||
            d.sellerId; // Fallback to order-level sellerId
          
          return itemSellerId && sellerId && String(itemSellerId) === String(sellerId);
        });

        if (filteredSourceItems.length === 0) {
          setOrder(null);
          return;
        }

        // Helper to ensure absolute URLs
        const ensureAbsoluteUrl = (url: any) => {
          if (!url || typeof url !== "string" || url === "h") return "/images/placeholder.png";
          if (url.startsWith("http")) return url;
          const apiBaseUrl = "https://shop-api.medicova.net";
          return `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
        };

        const itemsWithDetails = await Promise.all(filteredSourceItems.map(async (item: any) => {
          const productId = typeof item.productId === "object" ? item.productId?._id : item.productId;
          if (productId && typeof productId === "string") {
            try {
              const fullProd = await getProductById(productId, token);
              if (fullProd) {
                const mapped = mapApiProductToProduct(fullProd);
                return {
                  ...item,
                  productBrand: mapped.brand?.name?.[locale] || "Medicova",
                  productImage: mapped.images?.[0] || item.productImage || item.image,
                  productName: mapped.title?.en || item.productName || item.nameEn || item.name,
                  productNameAr: mapped.title?.ar || item.productNameAr || item.nameAr || item.productName
                };
              }
            } catch (pErr) {
              console.warn("Failed to fetch product details for item:", productId, pErr);
            }
          }
          return { ...item, productBrand: "Medicova" };
        }));

        const transformed = {
          ...d,
          status: d.status === "delivered" ? "completed" : (d.status || d.orderStatus || "pending"),
          displayId: d.orderNumber || d.id || d._id,
          grandTotal: d.total || d.totalPrice || d.total_price || d.grandTotal || 0,
          createdAt: d.createdAt || d.created_at,
          paymentMethod: d.paymentMethod || "cash_on_delivery",
          shippingAddress: (() => {
            const addr = d.address || d.shippingAddress || d.shipping_address || {};
            const isObj = addr && typeof addr === "object" && Object.keys(addr).length > 0;
            const cust = typeof d.customerId === "object" ? d.customerId : (d.user || {});
            
            return {
              name: (isObj && (addr.name || addr.addressName || addr.fullName)) || (cust.firstName ? `${cust.firstName} ${cust.lastName}` : (d.userName || d.name || d.user?.name || "Customer")),
              phone: (isObj && (addr.phone || addr.phoneNumber)) || (d.phoneNumber || d.phone || cust.phone || "+2"),
              address: (isObj && (addr.addressDetails || addr.address)) || d.shippingAddress || d.addressDetails || "N/A",
              city: (isObj && (addr.city || addr.area)) || d.governorate || d.area || d.city || "N/A",
              country: (isObj && addr.country) || "Egypt"
            };
          })(),
          items: itemsWithDetails.map(it => {
            const item = it as any;
            const variantMap = new Map<string, string>();
            const variantKeys = ["size", "color", "Color", "Size", "Tt", "Strength"];
            variantKeys.forEach(key => {
              const val = item[key];
              if (val && val !== "Default" && typeof val === "string") {
                let label = key;
                if (key === "size") label = isAr ? "المقاس" : "Size";
                if (key === "color") label = isAr ? "اللون" : "Color";
                variantMap.set(label, val);
              }
            });
            const displayVariants = Array.from(variantMap.entries()).map(([label, value]) => ({ label, value }));
            return {
              ...item,
              price: item.unitPrice || item.unit_price || item.price || 0,
              displayImage: ensureAbsoluteUrl(item.productImage || item.image),
              displayName: isAr ? (item.productNameAr || item.nameAr || item.productName) : (item.productName || item.nameEn || item.name || item.displayName),
              displayBrand: item.productBrand || "Medicova",
              displayVariants: displayVariants,
            };
          })
        };
        setOrder(transformed);
      } else {
        setOrder(null);
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      toast.error(isAr ? "فشل في تحميل تفاصيل الطلب" : "Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [slug, token, sellerId, isAr, locale]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const statusConfig = {
    completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-100", label: isAr ? "مكتمل" : "Completed" },
    cancelled: { color: "bg-rose-50 text-rose-700 border-rose-100", label: isAr ? "ملغي" : "Cancelled" },
    processing: { color: "bg-amber-50 text-amber-700 border-amber-100", label: isAr ? "قيد التنفيذ" : "Processing" },
    shipped: { color: "bg-sky-50 text-sky-700 border-sky-100", label: isAr ? "تم الشحن" : "Shipped" },
    pending: { color: "bg-amber-50 text-amber-700 border-amber-100", label: isAr ? "معلق" : "Pending" },
  };

  const config = order ? (statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending) : statusConfig.pending;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm font-bold text-gray-400">
            {isAr ? "جاري تحميل تفاصيل الطلب..." : "Loading order details..."}
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#F8FAFC] text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-500">
          <Package size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {isAr ? "الطلب غير موجود أو غير مصرّح لك بالوصول" : "Order Not Found or Access Denied"}
        </h2>
        <Link 
          href={`/${locale}/seller/orders`}
          className="mt-2 font-semibold text-primary hover:underline"
        >
          {isAr ? "العودة للطلبات" : "Back to Orders"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href={`/${locale}/seller/orders`} 
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white transition-colors hover:bg-gray-50"
          >
            <ChevronLeft className={`${isAr ? 'rotate-180' : ''} text-gray-600`} size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {isAr ? "طلب" : "Order"} {order.displayId}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDateTime(new Date(order.createdAt), locale)}
              </span>
            </div>
          </div>
        </div>
        
        <div className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wider ${config.color}`}>
          {config.label}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <ShoppingBag size={20} className="text-primary" />
              {isAr ? "منتجاتي في هذا الطلب" : "My Products in this Order"}
            </h2>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 py-6 first:pt-0 last:pb-0">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100">
                    <Image
                      src={item.displayImage}
                      alt={item.displayName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.displayName}</h3>
                      <p className="text-xs font-semibold text-gray-400">{item.displayBrand}</p>
                      {item.displayVariants && item.displayVariants.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.displayVariants.map((variant: any, vIdx: number) => (
                            <span key={vIdx} className="inline-block rounded-md bg-primary/5 border border-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              <span className="opacity-70">{variant.label}:</span> {variant.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-500">
                        {isAr ? "الكمية:" : "Qty:"} <span className="text-gray-900">{item.quantity}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Shipping Address */}
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <MapPin size={20} className="text-primary" />
              {isAr ? "عنوان الشحن" : "Shipping Address"}
            </h2>
            <div className="rounded-2xl border border-gray-50 bg-gray-50/50 p-4">
              <div className="space-y-1">
                <p className="font-bold text-gray-900">{order.shippingAddress.name}</p>
                <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-8">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sticky top-8">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <CreditCard size={20} className="text-primary" />
              {isAr ? "نظام الدفع" : "Payment Info"}
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{isAr ? "طريقة الدفع" : "Payment Method"}</span>
                <span className="font-semibold text-gray-900 uppercase">
                  {order.paymentMethod === "cash_on_delivery" ? "COD" : (isAr ? "بطاقة/محفظة" : "Card/Wallet")}
                </span>
              </div>
              
              <hr className="border-gray-50" />
              
              <div className="pt-2">
                <p className="text-sm font-bold text-gray-400 mb-1">{isAr ? "إجمالي المبلغ" : "Total Amount"}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-primary">
                    {isAr ? "جنيه" : "EGP"} {order.grandTotal?.toLocaleString()}
                  </span>
                  <div className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest ring-1 ${order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-amber-50 text-amber-700 ring-amber-100'}`}>
                    {order.paymentStatus === "paid" ? (isAr ? "مدفوع" : "Paid") : (isAr ? "معلق" : "Pending")}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
             <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <FileText size={20} className="text-primary" />
              {isAr ? "حالة الطلب" : "Order Status"}
            </h2>
            <div className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-widest ${config.color}`}>
              {config.label}
            </div>
            <p className="mt-4 text-xs font-semibold text-gray-400">
               {isAr ? "يتم تحديث الحالة من قبل إدارة المتجر." : "Status is updated by marketplace administration."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
