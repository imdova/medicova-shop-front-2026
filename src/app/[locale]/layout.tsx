import { Raleway, Cairo } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import DynamicHeaderWrapper from "@/components/layouts/Layout/Header/DynamicHeaderWrapper";
import { Suspense } from "react";
import LoadingAnimation from "@/components/layouts/LoadingAnimation";
import StoreProvider from "@/store/StoreProvider";
import { NextAuthProvider } from "@/NextAuthProvider";
import DynamicFooter from "@/components/layouts/Layout/Footer/DynamicFooter";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-raleway",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const direction = locale === "ar" ? "rtl" : "ltr";
  const fontClass = locale === "ar" ? "font-cairo" : "font-sans";

  // Data pre-fetching for Header and Footer to optimize hydration
  const staticHeaderLinks = (await import("@/data/header.json")).default;
  const footerData = (await import("@/data/footer.json")).default;

  // Dynamic header links from API
  const { getDynamicHeaderLinks } = await import("@/services/headerService");
  let headerLinks = await getDynamicHeaderLinks();

  // Fallback to static data if dynamic fetch failed or returned empty
  if (!headerLinks || headerLinks.length === 0) {
    headerLinks = staticHeaderLinks;
  }

  // Remove "Clothes" section from categories nav below navbar
  const clothesTitles = ["Clothes", "clothes", "Clothing", "ملابس"];
  headerLinks = headerLinks.filter((link: { title?: { en?: string; ar?: string } }) => {
    const en = link.title?.en?.trim() ?? "";
    const ar = link.title?.ar?.trim() ?? "";
    return !clothesTitles.includes(en) && !clothesTitles.includes(ar);
  });

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body
        className={`${raleway.variable} ${cairo.variable} ${fontClass} bg-gray-50 antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <StoreProvider>
            <NextAuthProvider>
              <DynamicHeaderWrapper headerLinks={headerLinks}>
                {children}
                <DynamicFooter footerData={footerData} />
              </DynamicHeaderWrapper>
            </NextAuthProvider>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
