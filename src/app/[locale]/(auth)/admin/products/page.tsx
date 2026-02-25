"use client";

import { Eye, List, Plus } from "lucide-react";
import OverviewPanel from "./panels/OverviewPanel";
import ProductListPanel from "./panels/ProductListPanel";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useTranslations } from "next-intl";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/shared/Tabs";
import Link from "next/link";

export default function ProductsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F8FAFC] p-4 duration-700 md:p-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("products")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("productsDescription")}
            </p>
          </div>
          <Link
            href={`/${locale}/admin/create-product`}
            className="shadow-primary/20 group flex items-center gap-2 rounded-2xl bg-[#31533A] px-6 py-3 text-sm font-black text-white shadow-xl transition-all duration-300 hover:brightness-110 active:scale-95"
          >
            <Plus
              size={18}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            <span>{t("create")}</span>
          </Link>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 w-fit rounded-2xl bg-gray-100/40 p-1.5 backdrop-blur-sm">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:shadow-gray-200/50"
            >
              <div className="flex size-5 items-center justify-center rounded-md bg-[#EDF3F0] text-[#7BA68E]">
                <Eye className="size-3.5" />
              </div>
              {t("salesOverview")}
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:shadow-gray-200/50"
            >
              <List className="size-4 text-gray-400" />
              {t("products")}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="mt-0 focus-visible:outline-none"
          >
            <OverviewPanel />
          </TabsContent>

          <TabsContent value="list" className="mt-0 focus-visible:outline-none">
            <ProductListPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
