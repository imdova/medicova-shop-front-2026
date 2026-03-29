import React, { ReactNode } from "react";
import Sidebar from "@/components/layouts/Layout/sidebar/Sidebar";
import GoBackButton from "@/components/shared/Buttons/GoBackButton";
import { auth } from "@/lib/auth/auth";
import { NextAuthProvider } from "@/NextAuthProvider";
import { Toaster } from "react-hot-toast";

interface AccountLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AccountLayout({ children, params }: AccountLayoutProps) {
  const { locale } = await params;
  const session = await auth();

  const safeUser = {
    id: session?.user?.id || "",
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
    role: (session?.user as any)?.role || "user",
  };

  return (
    <div className="relative min-h-screen bg-[#fcfcfd]">
      {/* Decorative background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="bg-secondary/5 absolute -right-[5%] top-[20%] h-[30%] w-[30%] rounded-full blur-[100px]" />
      </div>

      <div className="container relative mx-auto flex flex-col gap-8 py-8 lg:max-w-[98%] lg:flex-row">
        {/* Sidebar wrapper with glass effect for desktop */}
        <aside className="hidden w-60 flex-shrink-0 lg:block">
          <div className="sticky top-8">
            <Sidebar user={safeUser} />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <GoBackButton locale={locale as any} />
          </div>

          <div className="rounded-[2rem] border border-white/60 bg-white/40 p-1 shadow-2xl shadow-gray-200/50 backdrop-blur-xl">
            <div className="rounded-[1.8rem] bg-white p-6 shadow-inner md:p-10 lg:p-12">
              <NextAuthProvider session={session}>
                {children}
              </NextAuthProvider>
            </div>
          </div>
        </main>
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "16px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: 600,
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </div>
  );
}
