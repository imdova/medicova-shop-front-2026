"use client";
import NotFound from "@/app/[locale]/not-found";
import { TabWithIcon } from "@/components/features/TabWithIcon";
import { products } from "@/data";
import { Eye, List } from "lucide-react";
import { use } from "react";
import ProductOverviewPanel from "./panels/ProductOverviewPanel";
import OrdersPanel from "./panels/OrdersPanel";
import { useAppLocale } from "@/hooks/useAppLocale";

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
  const locale = useAppLocale();
  const foundProduct = products.find((p) => p.id === slug);
  if (!foundProduct) {
    return <NotFound />;
  }
  const tabs = [
    {
      label: t[locale].overview,
      icon: Eye,
      content: (
        <ProductOverviewPanel foundProduct={foundProduct} />
      ),
    },
    {
      label: t[locale].orders,
      icon: List,
      content: <OrdersPanel />,
    },
  ];
  return (
    <div>
      <TabWithIcon tabs={tabs} />
    </div>
  );
}
