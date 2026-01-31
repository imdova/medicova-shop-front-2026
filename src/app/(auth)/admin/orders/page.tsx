"use client";
import { TabWithIcon } from "@/components/UI/TabWithIcon";
import { List } from "lucide-react";
import OrdersListPanel from "./panels/OrdersListPanel";
import RefundRequstsListPanel from "./panels/RefundRequstsListPanel";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FinancialPage() {
  const { language } = useLanguage();

  const tabs = [
    {
      label: {
        en: "Orders",
        ar: "الطلبات",
      },
      icon: List,
      content: <OrdersListPanel locale={language} />,
    },
    {
      label: {
        en: "Refund Requests",
        ar: "طلبات الاسترداد",
      },
      icon: List,
      content: <RefundRequstsListPanel locale={language} />,
    },
  ];

  return (
    <main>
      <TabWithIcon
        tabs={tabs.map((tab) => ({
          ...tab,
          label: tab.label[language], // localize the label dynamically
        }))}
      />
    </main>
  );
}
