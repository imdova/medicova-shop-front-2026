"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

interface SellerAccessGuardProps {
  isRestricted: boolean;
  locale: string;
  children: React.ReactNode;
}

export default function SellerAccessGuard({
  isRestricted,
  locale,
  children,
}: SellerAccessGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isRestricted) {
      // Allow only the profile page
      // Note: usePathname from next-intl returns the path without the locale prefix
      const isProfilePage = pathname === "/seller/profile";
      
      if (!isProfilePage) {
        console.warn(`Access restricted to profile for unprivileged seller. Redirecting from ${pathname}...`);
        router.push("/seller/profile");
      }
    }
  }, [isRestricted, pathname, router]);

  return <>{children}</>;
}
