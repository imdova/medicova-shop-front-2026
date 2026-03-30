import React, { ReactNode } from "react";
import Sidebar from "@/components/layouts/Layout/sidebar/Sidebar";
import { auth } from "@/lib/auth/auth";
import { NextAuthProvider } from "@/NextAuthProvider";
import ToastProvider from "@/components/shared/ToastProvider";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getSellerOwnDocuments } from "@/services/sellerService";
import SellerAccessGuard from "./components/SellerAccessGuard";

interface AccountLayoutProps {
  children: ReactNode;
}

export default async function AccountLayout({ children, params }: AccountLayoutProps & { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  const [session, messages] = await Promise.all([
    auth(),
    getMessages()
  ]);

  // Create a safe user object with default values from the server session
  const safeUser = {
    id: session?.user?.id || "",
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
    role: (session?.user as any)?.role || "user",
  };

  // Determine if seller is restricted (No docs or status not approved)
  let isRestricted = false;
  if (safeUser.role === "seller") {
    try {
      const token = (session as any)?.accessToken;
      const res = await getSellerOwnDocuments(token);
      const docs = res?.data || res;
      isRestricted = docs?.status !== "approved";
    } catch {
      isRestricted = true; // No docs found or error -> restricted
    }
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-[#fcfcfd]">
        <div className="container mx-auto flex p-4 lg:max-w-[1536px] lg:p-8">
          <div className="hidden lg:block">
            <Sidebar user={safeUser} isRestricted={isRestricted} />
          </div>

          <main className="flex-1 lg:px-8">
            <div className="mx-auto max-w-[60rem]">
              <NextAuthProvider session={session}>
                <SellerAccessGuard isRestricted={isRestricted} locale={locale}>
                  {children}
                </SellerAccessGuard>
              </NextAuthProvider>
            </div>
          </main>
        </div>
        <ToastProvider />
      </div>
    </NextIntlClientProvider>
  );
}
