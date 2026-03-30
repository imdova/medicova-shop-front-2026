"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const FinancialPageContent = dynamic(
  () => import("./FinancialPageContent"),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    ) 
  }
);

export default function FinancialPage() {
  return <FinancialPageContent />;
}
