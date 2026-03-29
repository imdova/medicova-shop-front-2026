import React, { ReactNode } from "react";
import Sidebar from "@/components/layouts/Layout/sidebar/Sidebar";
import { auth } from "@/lib/auth/auth";
import { NextAuthProvider } from "@/NextAuthProvider";
import { Toaster } from "react-hot-toast";
import { getMessages, setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

interface AccountLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AccountLayout({ children, params }: AccountLayoutProps) {
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

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-[#fcfcfd]">
        <div className="container mx-auto flex p-4 lg:max-w-[1536px] lg:p-8">
          <div className="hidden lg:block">
            <Sidebar user={safeUser} />
          </div>

          <main className="flex-1 lg:px-8">
            <div className="mx-auto max-w-[60rem]">
              <NextAuthProvider session={session}>
                {children}
              </NextAuthProvider>
            </div>
          </main>
        </div>
        <Toaster position="top-right" />
      </div>
    </NextIntlClientProvider>
  );
}
