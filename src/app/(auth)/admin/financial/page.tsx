"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/UI/Tabs"; // adjust path if needed
import { CircleDollarSign, TextSearch, Wallet } from "lucide-react";
import OverviewPanel from "./panels/OverviewPanel";
import TransactionsListPanel from "./panels/TransactionsListPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import PlansListPanel from "./panels/PlansListPanel";
import WithdrawalsListPanel from "./panels/WithdrawalsListPanel";

export default function FinancialPage() {
  const { language } = useLanguage();

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      icon: TextSearch,
      content: <OverviewPanel locale={language} />,
    },
    {
      value: "transactions",
      label: "Transactions History",
      icon: CircleDollarSign,
      content: <TransactionsListPanel />,
    },
    {
      value: "withdrawals",
      label: "Withdrawals",
      icon: Wallet,
      content: <WithdrawalsListPanel />,
    },
    {
      value: "plans",
      label: "Plans",
      icon: CircleDollarSign,
      content: <PlansListPanel />,
    },
  ];

  return (
    <main className="p-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          {tabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon className="size-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(({ value, content }) => (
          <TabsContent key={value} value={value} className="mt-4">
            {content}
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}
