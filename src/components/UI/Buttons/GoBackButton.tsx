"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const translations = {
  en: {
    aria: {
      back: "Go back to previous page",
      home: "Return to home page",
    },
    label: {
      back: "Go Back",
      home: "Home",
    },
  },
  ar: {
    aria: {
      back: "العودة إلى الصفحة السابقة",
      home: "العودة إلى الصفحة الرئيسية",
    },
    label: {
      back: "عودة",
      home: "الرئيسية",
    },
  },
};

const GoBackButton = ({ locale = "en" }: { locale?: "en" | "ar" }) => {
  const t = translations[locale];
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCanGoBack(window.history.length > 2);
    }
  }, []);

  const handleGoBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <button
      onClick={handleGoBack}
      aria-label={canGoBack ? t.aria.back : t.aria.home}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-2 text-xs font-semibold transition-all duration-200 focus:outline-none md:px-3 ${
        canGoBack
          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      <ArrowLeft
        size={14}
        strokeWidth={2}
        className={` ${locale === "ar" ? "rotate-180" : ""}`}
      />
      <span className="hidden text-xs font-semibold md:block">
        {canGoBack ? t.label.back : t.label.home}
      </span>
    </button>
  );
};

export default GoBackButton;
