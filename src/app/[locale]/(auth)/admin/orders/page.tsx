"use client";

import { List, ClipboardList, RefreshCcw } from "lucide-react";
import OrdersListPanel from "./panels/OrdersListPanel";
import RefundRequestsListPanel from "./panels/RefundRequestsListPanel";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useTranslations } from "next-intl";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/shared/Tabs";

export default function OrdersPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F8FAFC] p-4 duration-700 md:p-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("orders")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("ordersDescription")}
            </p>
          </div>
        </div>

        <Tabs defaultValue="all-orders" className="w-full">
          <TabsList className="mb-8 w-fit rounded-2xl bg-gray-100/40 p-1.5 backdrop-blur-sm">
            <TabsTrigger
              value="all-orders"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:shadow-gray-200/50"
            >
              <div className="flex size-5 items-center justify-center rounded-md bg-[#EDF3F0] text-[#7BA68E]">
                <ClipboardList className="size-3.5" />
              </div>
              {t("allOrders")}
            </TabsTrigger>
            <TabsTrigger
              value="refund-requests"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:shadow-gray-200/50"
            >
              <RefreshCcw className="size-4 text-gray-400" />
              {t("refundRequests")}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="all-orders"
            className="mt-0 focus-visible:outline-none"
          >
            <OrdersListPanel locale={locale} />
          </TabsContent>

          <TabsContent
            value="refund-requests"
            className="mt-0 focus-visible:outline-none"
          >
            <RefundRequestsListPanel locale={locale} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
