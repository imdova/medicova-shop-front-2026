"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CircleDollarSign,
  Download,
  TextSearch,
  Wallet,
} from "lucide-react";

// Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/Tabs";
import OverviewPanel from "./panels/OverviewPanel";
import TransactionsListPanel from "./panels/TransactionsListPanel";
import WithdrawalsPanel from "./panels/WithdrawalsPanel";
import { getAdminTransactionsExportUrl } from "@/services/financeService";
import { useSession } from "next-auth/react";

export default function FinancialPageContent() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "transactions" ? "transactions" : "overview";

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const handleExport = () => {
    if (!token) return;
    const url = getAdminTransactionsExportUrl(token);
    window.open(url, "_blank");
  };

  const tabs = [
    {
      value: "overview",
      label: t("overview"),
      icon: TextSearch,
      content: <OverviewPanel />,
    },
    {
      value: "transactions",
      label: t("transactionsHistory"),
      icon: CircleDollarSign,
      content: <TransactionsListPanel />,
    },
    {
      value: "withdrawals",
      label: isArabic ? "طلبات السحب" : "Withdrawal Requests",
      icon: Wallet,
      content: <WithdrawalsPanel />,
    },
  ];

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <CircleDollarSign className="text-emerald-600" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {isArabic ? "نظرة عامة مالية" : "Financial Overview"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-medium text-gray-400">
              {isArabic
                ? "مقاييس أداء فورية لمنصة HealthMarket"
                : "Real-time performance metrics for HealthMarket platform"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <CalendarDays className="h-4 w-4 text-slate-500" />
            {isArabic ? "آخر 30 يومًا" : "Last 30 Days"}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            {isArabic ? "تصدير التقرير" : "Export Report"}
          </button>
        </div>
      </div>

      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="mb-8 w-fit rounded-2xl border border-white/60 bg-gray-100/50 p-1.5 backdrop-blur-sm">
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
            >
              <Icon className="size-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(({ value, content }) => (
          <TabsContent
            key={value}
            value={value}
            className="mt-0 focus-visible:outline-none"
          >
            {content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
