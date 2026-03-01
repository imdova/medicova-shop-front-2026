"use client";
import { usePathname } from "next/navigation";
import { matchRoute } from "./routeConfigs";
import FullFooter from "./FullFooter";
import AccountFooter from "./AccountFooter";

const DynamicFooter: React.FC<{ footerData: any }> = ({ footerData }) => {
  const pathname = usePathname() || "/";
  const FooterType = matchRoute(pathname)?.footerType || "full";

  const FooterComponents = {
    full: FullFooter,
    account: AccountFooter,
  };

  const SelectedFooter = FooterComponents[FooterType];

  return <SelectedFooter footerData={footerData} />;
};

export default DynamicFooter;
