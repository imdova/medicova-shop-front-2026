"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  const stats = [
    {
      label: { en: "Total Revenue", ar: "إجمالي الإيرادات" },
      value: "128,430 EGP",
      icon: CreditCard,
      trend: "+12.5%",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: { en: "Active Users", ar: "المستخدمون النشطون" },
      value: "1,240",
      icon: Users,
      trend: "+8.2%",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: { en: "New Orders", ar: "الطلبات الجديدة" },
      value: "48",
      icon: ShoppingBag,
      trend: "+24.1%",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: { en: "Growth Rate", ar: "معدل النمو" },
      value: "18.4%",
      icon: TrendingUp,
      trend: "+4.3%",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            {isArabic ? "مرحباً بك مجدداً!" : "Welcome back, Chief!"}
          </h1>
          <p className="mt-1 font-medium text-gray-400">
            {isArabic
              ? "إليك ما يحدث في متجرك اليوم."
              : "Here's what's happening with your store today."}
          </p>
        </div>
        <button className="shadow-primary/20 flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:brightness-110 active:scale-95">
          <TrendingUp className="h-4 w-4" />
          <span>{isArabic ? "عرض التقارير" : "View Reports"}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/30 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} shadow-inner transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-600">
                  <ArrowUpRight className="h-3 w-3" />
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {stat.label[locale]}
                </p>
                <h3 className="mt-1 text-2xl font-black text-gray-900">
                  {stat.value}
                </h3>
              </div>
            </div>
            {/* Subtle background glow */}
            <div
              className={`absolute -right-4 -top-4 h-24 w-24 rounded-full ${stat.bg} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
            ></div>
          </div>
        ))}
      </div>

      {/* Dashboard Placeholder for more luxury content */}
      <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 p-20 text-center">
        <div className="mx-auto max-w-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-gray-100 bg-white text-gray-300 shadow-lg">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-400">
            {isArabic
              ? "تخصيص لوحة التحكم الخاصة بك"
              : "Customize Your Analytics"}
          </h3>
          <p className="text-sm font-medium leading-relaxed text-gray-300">
            {isArabic
              ? "يمكنك سحب وإفلات العناصر هنا في التحديث القادم."
              : "Drag and drop widgets to build your perfect custom dashboard view."}
          </p>
        </div>
      </div>
    </div>
  );
}
