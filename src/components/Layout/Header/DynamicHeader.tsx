"use client";
import { usePathname } from "next/navigation";
import { matchRoute } from "./routeConfigs";
import FullHeader from "./FullHeader";
import { useSession } from "next-auth/react";
import { User } from "next-auth";
import MinimalHeader from "./MinimalHeader";

const DynamicHeader: React.FC = () => {
  const { data: session } = useSession();
  const pathname = usePathname() || "/";
  const headerType = matchRoute(pathname)?.headerType || "full";

  const headerComponents = {
    full: FullHeader,
    minimal: MinimalHeader,
  };

  const SelectedHeader = headerComponents[headerType];

  // Create a safe user object with default values
  const safeUser: User = {
    id: session?.user?.id || "",
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
    role: session?.user?.role || "user",
  };

  return <SelectedHeader user={safeUser} activeSection="" />;
};

export default DynamicHeader;
