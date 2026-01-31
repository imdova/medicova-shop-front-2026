"use client";
import React, { ReactNode } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Layout/sidebar/Sidebar";

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
    <div className="container mx-auto flex min-h-screen bg-gray-50 p-3 lg:max-w-[1440px]">
      <div className="hidden lg:block">
        <Sidebar user={safeUser} />
      </div>

      <main className="flex-1 pt-2 lg:px-4">
        <div>{children}</div>
      </main>
    </div>
  );
};

export default AccountLayout;
