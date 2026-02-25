import { Raleway, Cairo } from "next/font/google";
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
  const headerLinks = (await import("@/data/header.json")).default;
  const footerData = (await import("@/data/footer.json")).default;

  return (
    <html lang={locale} dir={direction}>
      <body
        className={`${raleway.variable} ${cairo.variable} ${fontClass} bg-gray-50 antialiased`}
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
