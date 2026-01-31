"use client";
import { usePathname } from "next/navigation";
import { matchRoute } from "./routeConfigs";
import FullFooter from "./FullFooter";
import AccountFooter from "./AccountFooter";

const DynamicFooter: React.FC = () => {
  const pathname = usePathname() || "/";
  const FooterType = matchRoute(pathname)?.footerType || "full";

  const FooterComponents = {
    full: FullFooter,
    account: AccountFooter,
  };

  const SelectedFooter = FooterComponents[FooterType];

  return <SelectedFooter />;
};

export default DynamicFooter;
