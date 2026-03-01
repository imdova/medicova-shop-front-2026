"use client";
import { useRouter } from "next/navigation";
import React from "react";

const AccountPage: React.FC = () => {
  const router = useRouter();

  // Redirect to orders page by default
  React.useEffect(() => {
    router.push("/user/orders");
  }, []);

  return null;
};

export default AccountPage;
