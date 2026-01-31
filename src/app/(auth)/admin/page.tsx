"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Clock10 } from "lucide-react";

export default function AdminDashboard() {
  const { isArabic } = useLanguage();

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="shadow-soft w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8">
        <div className="mb-6 flex animate-pulse justify-center">
          <Clock10 className="h-12 w-12 text-indigo-500" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          {isArabic ? "جارٍ الإنشاء..." : "Building..."}
          <br />
          {isArabic ? "لوحة تحكم الإدارة" : "Dashboard Home"}
        </h1>
        <p className="mb-4 text-gray-600">
          {isArabic
            ? "هذه الصفحة غير جاهزة بعد... لكنها قيد التطوير!"
            : "This page isn’t ready yet... but it’s on its way!"}
        </p>
        <p className="text-sm text-gray-500">
          {isArabic
            ? "نحن نعمل على شيء رائع."
            : "We’re building something awesome."}
        </p>
      </div>
      <p className="mt-6 text-xs text-gray-400">
        © {new Date().getFullYear()} Medicova
      </p>
    </div>
  );
}
