import { Raleway, Cairo } from "next/font/google";
import "./globals.css";
import DynamicHeaderWrapper from "@/components/Layout/Header/DynamicHeaderWrapper";
import { Suspense } from "react";
import LoadingAnimation from "@/components/UI/LoadingAnimation";
import StoreProvider from "@/store/StoreProvider";
import { NextAuthProvider } from "@/NextAuthProvider";
import DynamicFooter from "@/components/Layout/Footer/DynamicFooter";
import { LanguageProvider } from "@/contexts/LanguageContext";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={`${raleway.variable} ${cairo.variable}`}>
      <LanguageProvider>
        <html lang="en">
          <body className="bg-gray-50 antialiased">
            <StoreProvider>
              <NextAuthProvider>
                <DynamicHeaderWrapper>
                  <Suspense fallback={<LoadingAnimation />}>
                    {children}
                  </Suspense>
                </DynamicHeaderWrapper>
                <DynamicFooter />
              </NextAuthProvider>
            </StoreProvider>
          </body>
        </html>
      </LanguageProvider>
    </main>
  );
}
