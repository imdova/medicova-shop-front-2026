"use client";

import DynamicHeader from "@/components/layouts/Layout/Header/DynamicHeader";
import Navbar from "../NavbarMobile/Navbar";

export default function DynamicHeaderWrapper({
  children,
  headerLinks,
}: {
  children: React.ReactNode;
  headerLinks: any;
}) {
  return (
    <>
      <DynamicHeader links={headerLinks} />
      <main>{children}</main>
      <Navbar />
    </>
  );
}
