"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { CircleDollarSign, TrendingUp, BarChart3, Star } from "lucide-react";
import { useAppLocale } from "@/hooks/useAppLocale";

// Components
import FinancialStats from "../components/FinancialStats";
import GenericChart from "@/components/features/charts/GenericChart";
import { dummyChartSingleData } from "@/constants/sellerDashboardMock";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/Tabs";

export default function OverviewPanel() {
  const t = useTranslations("admin");
  const locale = useAppLocale();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <FinancialStats locale={locale} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {t("salesOverview")}
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {t("revenueStreams")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-1">
              <span className="border-primary/10 rounded-lg border bg-white px-3 py-1.5 text-[10px] font-black text-primary shadow-sm transition-all">
                DAILY
              </span>
              <span className="cursor-pointer rounded-lg px-3 py-1.5 text-[10px] font-bold text-gray-400 transition-all hover:bg-white hover:text-gray-900">
                WEEKLY
              </span>
            </div>
          </div>

          <div className="h-[350px]">
            <GenericChart

              chartTitle={t("salesStatistic")}
              data={dummyChartSingleData}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">
                {t("topSellers")}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {t("performance")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/50 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white bg-gray-100 text-xs font-black text-gray-400 shadow-sm">
                    S{i}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">
                      Seller Name {i}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                      Total Sales: 1,20{i}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Star size={10} className="fill-primary" />
                  <span className="text-[10px] font-black">4.{i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
