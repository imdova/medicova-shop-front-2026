"use client";
import React, { ReactNode } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layouts/Layout/sidebar/Sidebar";

interface AccountLayoutProps {
  children: ReactNode;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
  const { data: session } = useSession();

  // Create a safe user object with default values
  const safeUser = {
    id: session?.user?.id || "",
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
    role: session?.user?.role || "user",
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <div className="container mx-auto flex p-4 lg:max-w-[1536px] lg:p-8">
        <div className="hidden lg:block">
          <Sidebar user={safeUser} />
        </div>

        <main className="flex-1 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;
