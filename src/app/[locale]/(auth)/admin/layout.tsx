import React, { ReactNode } from "react";
import ToastProvider from "@/components/shared/ToastProvider";
import Sidebar from "@/components/layouts/Layout/sidebar/Sidebar";
import { auth } from "@/lib/auth/auth";

import { NextAuthProvider } from "@/NextAuthProvider";

interface AccountLayoutProps {
  children: ReactNode;
}

const AccountLayout = async ({ children }: AccountLayoutProps) => {
  const session = await auth();

  const safeUser = {
    id: session?.user?.id || "",
    name: session?.user?.name || "Admin",
    email: session?.user?.email || "admin@medicova.net",
    image: session?.user?.image || "",
    role: (session?.user?.role as any) || "admin",
  };

  return (
    <NextAuthProvider session={session}>
      <div className="min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto flex gap-6 px-4 pb-4 pt-0 lg:max-w-[1536px]">
        <div className="hidden lg:block">
          <Sidebar user={safeUser} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards flex-1 duration-700">
            {children}
          </main>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/5 absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full blur-[120px]"></div>
        <div className="absolute -right-[10%] bottom-[10%] h-[30%] w-[30%] rounded-full bg-indigo-500/5 blur-[120px]"></div>
      </div>

      <ToastProvider />
      </div>
    </NextAuthProvider>
  );
};

export default AccountLayout;
