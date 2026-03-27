"use client";

import React from "react";
import { useOrderDetails } from "@/app/[locale]/(auth)/user/hooks/useOrderDetails";
import { ChevronLeft, Package, MapPin, CreditCard, ShoppingBag, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const OrderDetailPage = () => {
  const { order, loading, error, isAr } = useOrderDetails();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-500">
          <Package size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {isAr ? "حدث خطأ أثناء تحميل تفاصيل الطلب" : "Failed to load order details"}
        </h2>
        <p className="text-gray-500">{error || (isAr ? "الطلب غير موجود" : "Order not found")}</p>
        <Link 
          href="/user/orders"
          className="mt-2 font-semibold text-primary hover:underline"
        >
          {isAr ? "العودة إلى طلباتي" : "Back to My Orders"}
        </Link>
      </div>
    );
  }

  const statusConfig = {
    completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-100", label: isAr ? "مكتمل" : "Completed" },
    cancelled: { color: "bg-rose-50 text-rose-700 border-rose-100", label: isAr ? "ملغي" : "Cancelled" },
    processing: { color: "bg-amber-50 text-amber-700 border-amber-100", label: isAr ? "قيد التنفيذ" : "Processing" },
    shipped: { color: "bg-sky-50 text-sky-700 border-sky-100", label: isAr ? "تم الشحن" : "Shipped" },
  };

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.processing;

  return (
    <div className="mx-auto max-w-5xl pb-20">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/user/orders" 
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white transition-colors hover:bg-gray-50"
          >
            <ChevronLeft className={`${isAr ? 'rotate-180' : ''} text-gray-600`} size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              {isAr ? "تفاصيل الطلب" : "Order Details"}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
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
              {isAr ? "المنتجات" : "Order Items"}
            </h2>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 py-6 first:pt-0 last:pb-0">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100">
                    <Image
                      src={item.displayImage}
                      alt={item.displayName}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
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
                    <div className="flex items-center justify-between">
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
              {order.shippingAddress ? (
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">{order.shippingAddress.name}</p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                   <p className="font-bold text-gray-900">{order.userId?.name || order.userName || "Customer"}</p>
                   <p className="text-sm text-gray-500 italic">
                     {isAr ? "لم يتم ربط تفاصيل العنوان الكاملة" : "Full address details not linked"}
                   </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-8">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-900">
              <CreditCard size={20} className="text-primary" />
              {isAr ? "ملخص الدفع" : "Payment Summary"}
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                <span className="font-semibold text-gray-900">
                   {isAr ? "جنيه" : "EGP"} {order.subTotal?.toLocaleString() || (order.grandTotal - (order.shippingPrice || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{isAr ? "طريقة الدفع" : "Payment Method"}</span>
                <span className="font-semibold text-gray-900 uppercase">
                  {order.paymentMethod?.replace(/_/g, ' ') || 'COD'}
                </span>
              </div>
              <hr className="border-gray-50" />
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-black text-gray-900">{isAr ? "الإجمالي" : "Total Amount"}</span>
                <span className="text-2xl font-black text-primary">
                  {isAr ? "جنيه" : "EGP"} {order.grandTotal?.toLocaleString()}
                </span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
