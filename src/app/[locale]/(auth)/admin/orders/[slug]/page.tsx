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
  updateOrderStatus,
  deleteOrder,
  ApiOrder,
} from "@/services/orderService";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getProductById, mapApiProductToProduct } from "@/services/productService";
import { confirmToast } from "@/utils/confirmToast";


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

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const router = useRouter();

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  const fetchOrder = useCallback(async () => {
    if (!token || !slug) return;
    setLoading(true);
    try {
      const data = await getOrderById(slug, token);
      if (data) {
        const d = data as any;
        
        // Use orderStatus as a fallback for status
        if (d.orderStatus && !d.status) {
          d.status = d.orderStatus;
        }
        
        // Helper to ensure absolute URLs
        const ensureAbsoluteUrl = (url: any) => {
          if (!url || typeof url !== "string" || url === "h") return "/images/placeholder.png";
          if (url.startsWith("http")) return url;
          const apiBaseUrl = "https://shop-api.medicova.net";
          return `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
        };

        // If items is missing or empty, use units as the source
        const sourceItems = (data.items && data.items.length > 0) ? data.items : (d.units || []);

        const itemsWithDetails = await Promise.all(sourceItems.map(async (item: any) => {
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
          status: d.status === "delivered" ? "completed" : d.status,
          displayId: d.orderNumber || d.id || d._id,
          grandTotal: d.total || d.totalPrice || d.total_price || d.grandTotal || 0,
          shippingPrice: d.shippingCost || d.shippingFee || d.shipping_fee || 0,
          subTotal: d.subtotal || d.subTotal || d.sub_total || ((d.total || d.totalPrice || 0) - (d.shippingCost || 0)) || 0,
          createdAt: d.createdAt || d.created_at,
          paymentMethod: d.paymentMethod || "cash_on_delivery",
          shippingAddress: (() => {
            const addr = d.address || d.shippingAddress || d.shipping_address || {};
            const isObj = addr && typeof addr === "object" && Object.keys(addr).length > 0;
            const cust = typeof d.customerId === "object" ? d.customerId : (d.user || {});
            
            const phoneSearch = [
              isObj && (addr.phone || addr.phoneNumber || addr.phone_number || addr.mobile),
              d.phoneNumber,
              d.phone,
              cust.phone,
              cust.phoneNumber,
            ].find(p => p && typeof p === "string" && p.length > 5);

            return {
              name: (isObj && (addr.name || addr.addressName || addr.fullName)) || (cust.firstName ? `${cust.firstName} ${cust.lastName}` : (d.userName || d.name || d.user?.name || "Customer")),
              phone: phoneSearch || (d.phoneNumber || d.phone || cust.phone || "+2"),
              address: (isObj && (addr.addressDetails || addr.address || addr.street || addr.details)) || d.shippingAddress || d.addressDetails || (typeof addr === "string" ? addr : "N/A"),
              city: (isObj && (addr.city || addr.area || addr.governorate || addr.region)) || d.governorate || d.area || d.city || "N/A",
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
  }, [slug, token, isAr, locale]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!token || !order) return;
    try {
      await updateOrderStatus(order._id, newStatus, token);
      toast.success(isAr ? "تم تحديث الحالة" : "Status updated");
      fetchOrder();
    } catch (err) {
      toast.error(isAr ? "فشل في تحديث الحالة" : "Failed to update status");
    }
  };

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
          <p className="mt-4 text-lg font-bold text-slate-600">
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
          {isAr ? "الطلب غير موجود" : "Order Not Found"}
        </h2>
        <Link 
          href={`/${locale}/admin/orders`}
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
            href={`/${locale}/admin/orders`} 
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
        
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wider ${config.color}`}>
            {config.label}
          </div>
          
          <div className="relative group">
            <button className="h-10 rounded-xl bg-white border border-gray-100 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50">
              {isAr ? "تحديث الحالة" : "Update Status"}
            </button>
            <div className="absolute right-0 top-full mt-2 hidden min-w-[160px] flex-col rounded-2xl border border-gray-100 bg-white p-2 shadow-xl group-hover:flex z-50">
              {Object.keys(statusConfig).map((s) => (
                <button
                  key={s}
                  onClick={() => handleUpdateStatus(s)}
                  className="flex w-full items-center px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl"
                >
                  {statusConfig[s as keyof typeof statusConfig]?.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <ShoppingBag size={20} className="text-primary" />
              {isAr ? "المنتجات" : "Order Items"}
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

          {/* Admin Internal Notes */}
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <FileText size={20} className="text-primary" />
              {isAr ? "ملاحظات داخلية" : "Admin Internal Notes"}
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isAr ? "أضف ملاحظة عن هذا الطلب..." : "Add a note about this order..."}
              className="min-h-[120px] w-full resize-none rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400">
                {isAr ? "الملاحظات مرئية لفريق المتجر فقط." : "Notes are only visible to marketplace staff."}
              </p>
              <button 
                className="rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90"
              >
                {isAr ? "حفظ الملاحظة" : "Save Note"}
              </button>
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-8">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sticky top-8">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <CreditCard size={20} className="text-primary" />
              {isAr ? "ملخص الدفع" : "Payment Summary"}
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                <span className="font-semibold text-gray-900">
                   {isAr ? "جنيه" : "EGP"} {order.subTotal?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{isAr ? "طريقة الدفع" : "Payment Method"}</span>
                <span className="font-semibold text-gray-900 uppercase">
                  {order.paymentMethod === "cash_on_delivery"
                    ? "COD"
                    : order.paymentMethod === "wallet"
                      ? (isAr ? "محفظة" : "Wallet")
                      : order.paymentMethod === "card" || order.paymentMethod === "online" || order.paymentMethod === "credit_card"
                        ? (isAr ? "بطاقة" : "Card")
                        : order.paymentMethod || "Other"}
                </span>
              </div>
              
              <hr className="border-gray-50" />
              
              <div className="pt-2">
                <p className="text-sm font-bold text-gray-400 mb-1">{isAr ? "إجمالي المبلغ" : "Total Amount"}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-primary">
                    {isAr ? "جنيه" : "EGP"} {order.grandTotal?.toLocaleString()}
                  </span>
                  <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-100">
                    {order.paymentStatus === "paid" ? (isAr ? "مدفوع" : "Paid") : (isAr ? "معلق" : "Pending")}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50">
                <button
                  onClick={async () => {
                    if (
                      await confirmToast(
                        isAr
                          ? "هل أنت متأكد من حذف هذا الطلب؟"
                          : "Are you sure you want to delete this order?",
                        isAr,
                      )
                    ) {
                      deleteOrder(order._id, token).then(() => {
                        toast.success(isAr ? "تم حذف الطلب" : "Order deleted");
                        router.push(`/${locale}/admin/orders`);
                      });
                    }
                  }}

                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50/50 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  {isAr ? "حذف الطلب" : "Delete Order"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
