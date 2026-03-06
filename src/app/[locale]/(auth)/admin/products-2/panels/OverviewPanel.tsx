"use client";

import { CardStats, IconType } from "@/components/features/cards/CardStats";
import GenericChart from "@/components/features/charts/GenericChart";
import { dummyCards, dummyChartData } from "@/constants/sellerDashboardMock";
import TopProducts from "../../components/TopProducts";
import { products } from "@/data";
import ProductCard from "@/components/features/cards/ProductCard";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Pagination } from "@/components/shared/Pagination";
import { RecentProductCard } from "@/components/features/cards/RecentProductCard";
import { LanguageType } from "@/util/translations";
import { useTranslations } from "next-intl";

export default function OverviewPanel({ locale }: { locale: LanguageType }) {
  const t = useTranslations("admin");
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const ITEMS_PER_PAGE = 6;

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage]);

  const stats: {
    title: string;
    value: string;
    change: string;
    icon: IconType;
    color: string;
  }[] = [
    {
      title: t("totalProducts"),
      value: "1,245",
      change: "+12.5%",
      icon: "package",
      color: "#429fe6",
    },
    {
      title: t("totalOrders"),
      value: "156",
      change: "+8.2%",
      icon: "shoppingCart",
      color: "#429fe6",
    },
    {
      title: t("totalRevenue"),
      value: `12,450 EGP`,
      change: "+8%",
      icon: "dollar",
      color: "#10b981",
    },
    {
      title: t("totalViews"),
      value: "5,678",
      change: "+15%",
      icon: "eye",
      color: "#625df5",
    },
    {
      title: t("totalCommission"),
      value: "78%",
      change: "+3%",
      icon: "award",
      color: "#f59e0b",
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-1000">
      {/* Stats Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, idx) => (
          <CardStats
            key={idx}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
            size="sm"

          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Content: Chart & Recent Products */}
        <div className="space-y-8 lg:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/30 backdrop-blur-xl">
            <GenericChart
              chartTitle={`${t("salesOverview")} 2`}
              data={dummyChartData}
              showCards={true}
              cards={dummyCards}

            />
          </div>

          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {t("recentProducts")}
                </h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                  {products.length} {t("productsLabel")}
                </p>
              </div>

              <div className="flex gap-3">
                <span className="bg-primary/10 border-primary/10 inline-flex items-center rounded-xl border px-4 py-2 text-xs font-bold text-primary shadow-sm">
                  1,210 {t("ordersSold")}
                </span>
                <span className="inline-flex items-center rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600 shadow-sm">
                  42,350 EGP {t("netSales")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Pagination
                totalItems={products.length}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={currentPage}

              />
            </div>
          </div>
        </div>

        {/* Sidebar: Top Products & Recent List */}
        <div className="space-y-8 lg:col-span-4">
          <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/30 backdrop-blur-xl">
            <TopProducts />
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/30 backdrop-blur-xl">
            <h2 className="mb-6 text-lg font-black text-gray-900">
              {t("recentProducts")}
            </h2>
            <div className="custom-scrollbar max-h-[600px] space-y-4 overflow-y-auto pr-2">
              {products.map((product) => (
                <RecentProductCard

                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
