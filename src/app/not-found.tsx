"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function NotFound() {
  const { language } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-2 text-center">
        <svg
          width="63"
          height="91"
          viewBox="0 0 63 91"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto text-primary"
        >
          <path
            d="M30.8364 23.0021C37.1914 23.0021 42.3431 17.8529 42.3431 11.501C42.3431 5.14919 37.1914 0 30.8364 0C24.4813 0 19.3296 5.14919 19.3296 11.501C19.3296 17.8529 24.4813 23.0021 30.8364 23.0021Z"
            fill="currentColor"
          />
          <path
            d="M55.2626 19.3702C55.2626 19.3702 43.2511 20.5808 31.6434 29.8119H31.3406C31.3406 29.8119 23.7704 21.8419 7.7215 19.0675V27.4411C7.7215 27.4411 22.5592 30.5685 31.0378 38.3872C31.0378 38.3872 31.6434 38.7908 32.0472 38.3872C32.4509 37.9837 40.0212 30.8208 55.2626 27.4411V19.3702Z"
            fill="currentColor"
          />
          <path
            d="M62.8834 28.349C62.8834 28.349 62.9843 77.3797 62.8834 77.3797C62.7825 77.3797 49.9635 82.3736 49.9635 82.3736V46.6598L31.694 58.4131L13.475 46.7607V69.561L31.694 76.7239L46.1784 70.1159V83.1807L31.2903 90.848L0 77.985L0.353284 28.4499C0.353284 28.4499 19.6826 31.8296 31.694 42.9271C31.694 42.9271 39.5166 33.696 62.8329 28.4499L62.8834 28.349Z"
            fill="currentColor"
          />
        </svg>

        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-medium text-gray-600">
            {language === "ar" ? "الصفحة غير موجودة" : "Page Not Found"}
          </h2>
          <p className="text-gray-500">
            {language === "ar"
              ? "عذرًا! الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
              : "Oops! The page you are looking for does not exist or has been moved."}
          </p>
        </div>

        <div className="pt-6">
          <Link
            href={language === "ar" ? "/ar" : "/"}
            className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            {language === "ar" ? "العودة إلى المتجر" : "Return to Store"}
          </Link>
        </div>
      </div>
    </div>
  );
}
