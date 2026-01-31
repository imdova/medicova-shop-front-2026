"use client";

import { Eye, List } from "lucide-react";
import OverviewPanel from "./panels/OverviewPanel";
import ProductListPanel from "./panels/ProductListPanel";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/UI/Tabs";

const t = {
  en: {
    overview: "Product Overview",
    list: "Product List",
    add: "Add New Product",
  },
  ar: {
    overview: "نظرة عامة على المنتجات",
    list: "قائمة المنتجات",
    add: "إضافة منتج جديد",
  },
};

export default function ProductsPage() {
  const { language } = useLanguage();

  return (
    <main className="flex gap-4">
      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full flex-1">
        <TabsList>
          <TabsTrigger value="overview">
            <Eye className="size-4" />
            {t[language].overview}
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="size-4" />
            {t[language].list}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewPanel locale={language} />
        </TabsContent>

        <TabsContent value="list">
          <ProductListPanel locale={language} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
