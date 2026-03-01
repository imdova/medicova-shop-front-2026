"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/shared/button";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

// UI text translations
const translations = {
  title: {
    en: "Authentication Error",
    ar: "خطأ في المصادقة",
  },
  subtitle: {
    en: "Something went wrong during the sign-in process.",
    ar: "حدث خطأ ما أثناء عملية تسجيل الدخول.",
  },
  backToLogin: {
    en: "Back to Login",
    ar: "العودة لتسجيل الدخول",
  },
  backToHome: {
    en: "Back to Home",
    ar: "العودة للرئيسية",
  },
  errors: {
    Configuration: {
      en: "There is a problem with the server configuration. Please contact support.",
      ar: "هناك مشكلة في تكوين الخادم. الرجاء الاتصال بالدعم.",
    },
    AccessDenied: {
      en: "You do not have permission to sign in.",
      ar: "ليس لديك إذن لتسجيل الدخول.",
    },
    Verification: {
      en: "The sign-in link is no longer valid or has already been used.",
      ar: "رابط تسجيل الدخول لم يعد صالحاً أو تم استخدامه بالفعل.",
    },
    CredentialsSignin: {
      en: "The credentials provided were incorrect or your account is not authorized.",
      ar: "بيانات الاعتماد المقدمة غير صحيحة أو حسابك غير مصرح له.",
    },
    Default: {
      en: "An unexpected authentication error occurred. Please try again later.",
      ar: "حدث خطأ غير متوقع في المصادقة. يرجى المحاولة مرة أخرى لاحقاً.",
    },
  },
};

const AuthErrorPage = () => {
  const locale = useAppLocale();
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const direction = locale === "ar" ? "rtl" : "ltr";

  const t = (key: string) => {
    const section = (translations as any)[key];
    if (!section) return key;
    return section[locale] || section["en"] || key;
  };

  const getErrorMessage = () => {
    const errorKey = error as keyof typeof translations.errors;
    const errorObj =
      translations.errors[errorKey] || translations.errors.Default;
    return errorObj[locale] || errorObj["en"];
  };

  return (
    <div
      dir={direction}
      className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12"
    >
      {/* Green top border decoration */}
      <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-green-600" />

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl md:p-12">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
          {t("title")}
        </h1>

        <p className="mb-8 text-lg text-gray-600">{getErrorMessage()}</p>

        <div className="space-y-4">
          <Button
            asChild
            className="h-12 w-full bg-green-600 text-lg text-white hover:bg-green-700"
          >
            <Link href="/signin">{t("backToLogin")}</Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="flex h-12 w-full items-center justify-center gap-2 text-lg text-gray-600 hover:text-gray-900"
          >
            <Link href="/">
              <ArrowLeft
                className={`h-5 w-5 ${locale === "ar" ? "rotate-180" : ""}`}
              />
              {t("backToHome")}
            </Link>
          </Button>
        </div>

        <div className="mt-12 border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-400">
            Error Code:{" "}
            <span className="font-mono uppercase text-gray-500">{error}</span>
          </p>
        </div>
      </div>

      {/* Decorative background tokens */}
      <div className="pointer-events-none fixed -bottom-24 -left-24 h-64 w-64 rounded-full bg-green-100/50 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 -top-24 h-64 w-64 rounded-full bg-green-100/50 blur-3xl" />
    </div>
  );
};

export default AuthErrorPage;
