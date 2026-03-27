import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import type { Locale } from "@/i18n/routing";

/**
 * Bi-lingual text object used throughout the data layer.
 * e.g. { en: "Hello", ar: "مرحبا" }
 */
export type BilingualText = {
  en: string;
  ar: string;
};

/**
 * Hook to get the current locale typed as our Locale union.
 * Use this in client components to access bilingual data:
 *
 * ```ts
 * const locale = useAppLocale();
 * const title = item.title[locale];
 * ```
 */
export function useAppLocale(): Locale {
  const params = useParams();
  const localeFromParams = params?.locale as Locale;
  
  try {
    const locale = useLocale() as Locale;
    return locale || localeFromParams || "en";
  } catch (e) {
    return localeFromParams || "en";
  }
}

/**
 * Helper to pick the correct string from a BilingualText object.
 * Use in server components or outside React:
 *
 * ```ts
 * const title = localized(item.title, "ar");
 * ```
 */
export function localized(text: BilingualText, locale: Locale): string {
  return text[locale];
}
