"use client";
import NotFound from "@/app/not-found";
import { TabWithIcon } from "@/components/UI/TabWithIcon";
import { products } from "@/constants/products";
import { Eye, List } from "lucide-react";
import { use } from "react";
import ProductOverviewPanel from "./panels/ProductOverviewPanel";
import OrdersPanel from "./panels/OrdersPanel";
import { useLanguage } from "@/contexts/LanguageContext";

const t = {
  en: {
    overview: "Product Overview",
    orders: "Orders",
  },
  ar: {
    overview: "نظرة عامة على المنتج",
    orders: "الطلبات",
  },
};

export default function SingleProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { language } = useLanguage();
  const foundProduct = products.find((p) => p.id === slug);
  if (!foundProduct) {
    return NotFound;
  }
  const tabs = [
    {
      label: t[language].overview,
      icon: Eye,
      content: (
        <ProductOverviewPanel locale={language} foundProduct={foundProduct} />
      ),
    },
    {
      label: t[language].orders,
      icon: List,
      content: <OrdersPanel locale={language} />,
    },
  ];
  return (
    <div>
      <TabWithIcon tabs={tabs} />
    </div>
  );
}
