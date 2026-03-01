"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { CircleDollarSign, TextSearch, Wallet, Coins } from "lucide-react";

// Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/Tabs";
import OverviewPanel from "./panels/OverviewPanel";
import TransactionsListPanel from "./panels/TransactionsListPanel";
import PlansListPanel from "./panels/PlansListPanel";
import WithdrawalsListPanel from "./panels/WithdrawalsListPanel";

export default function FinancialPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";

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
      label: t("withdrawals"),
      icon: Wallet,
      content: <WithdrawalsListPanel />,
    },
    {
      value: "plans",
      label: t("plans"),
      icon: Coins,
      content: <PlansListPanel />,
    },
  ];

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <CircleDollarSign className="text-emerald-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("financial")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("financialOverview")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
              <Wallet size={10} />
              Secure Wallet
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Status: <span className="text-gray-900">Synchronized</span>
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
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
