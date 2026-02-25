"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { useTransition } from "react";

type LanguageSwitcherProps = {
  className?: string;
};

export default function LanguageSwitcher({
  className = "",
}: LanguageSwitcherProps) {
  const locale = useAppLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const targetLocale = locale === "ar" ? "en" : "ar";
  const label = locale === "ar" ? "EN" : "عربي";

  const handleSwitch = () => {
    startTransition(() => {
      router.replace(pathname, { locale: targetLocale });
    });
  };

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      className={`flex items-center gap-1 px-2 py-1 text-sm font-medium transition-opacity hover:opacity-80 ${className} ${
        isPending ? "opacity-50" : ""
      }`}
      aria-label={`Switch to ${targetLocale === "ar" ? "Arabic" : "English"}`}
    >
      <Globe size={16} />
      <span>{label}</span>
    </button>
  );
}
