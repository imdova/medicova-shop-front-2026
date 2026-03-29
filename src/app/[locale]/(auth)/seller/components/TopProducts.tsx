"use client";

import { ApexOptions } from "apexcharts";
import { ChartColumn, List, Star } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { LanguageType } from "@/util/translations";
import { ApiProduct } from "@/services/productService";
import { ApiOrder } from "@/services/orderService";

// Dynamically import ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type TopProduct = {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  stock: number;
  rating: number;
};

type Props = {
  locale?: LanguageType;
  products?: ApiProduct[];
  orders?: ApiOrder[];
};

const translations = {
  en: {
    topProducts: "Top Products",
    bySales: "By Sales",
    byRevenue: "By Revenue",
    product: "Product",
    sales: "Sales",
    revenue: "Revenue",
    stock: "Stock",
    rating: "Rating",
  },
  ar: {
    topProducts: "أفضل المنتجات",
    bySales: "حسب المبيعات",
    byRevenue: "حسب الإيرادات",
    product: "المنتج",
    sales: "المبيعات",
    revenue: "الإيرادات",
    stock: "المخزون",
    rating: "التقييم",
  },
};

const TopProducts = ({ locale = "en", products = [], orders = [] }: Props) => {
  const t = translations[locale];
  const [view, setView] = useState<"list" | "chart">("list");
  const [sortBy, setSortBy] = useState<"sales" | "revenue">("sales");

  const topProducts = useMemo(() => {
    const productStats: Record<string, { sales: number; revenue: number }> = {};
    
    // Aggregating stats from all orders
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!item.productId) return;
        if (!productStats[item.productId]) {
          productStats[item.productId] = { sales: 0, revenue: 0 };
        }
        productStats[item.productId].sales += item.quantity || 0;
        productStats[item.productId].revenue += (item.unitPrice || 0) * (item.quantity || 0);
      });
    });

    return products.map(p => {
      const stats = productStats[p._id] || { sales: 0, revenue: 0 };
      return {
        id: p._id,
        name: locale === "ar" ? (p.nameAr || p.nameEn) : (p.nameEn || p.nameAr),
        sales: stats.sales,
        revenue: stats.revenue,
        stock: p.stockQuantity || p.inventory?.stockQuantity || 0,
        rating: p.rate || 0
      } as TopProduct;
    }).sort((a, b) => b[sortBy] - a[sortBy]).slice(0, 5);
  }, [products, orders, sortBy, locale]);

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: locale === "ar" ? "'Tajawal', sans-serif" : "inherit",
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: true,
        barHeight: "60%",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: topProducts.map((p) => p.name),
      labels: {
        style: {
          colors: "#9ca3af",
          fontWeight: 600,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#4b5563",
          fontWeight: 700,
        },
      },
    },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4,
    },
    colors: ["#10b981"], // Emerald 600
    tooltip: {
      theme: "light",
      style: {
        fontSize: "12px",
      },
    },
  };

  const chartSeries = [
    {
      name: sortBy === "sales" ? t.sales : t.revenue,
      data: topProducts.map((p) =>
        sortBy === "sales" ? p.sales : p.revenue,
      ),
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex rounded-2xl bg-gray-50/50 p-1 ring-1 ring-gray-100">
          <button
            onClick={() => setSortBy("sales")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 ${
              sortBy === "sales"
                ? "bg-white text-gray-900 shadow-lg shadow-gray-200/50 ring-1 ring-gray-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.bySales}
          </button>
          <button
            onClick={() => setSortBy("revenue")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 ${
              sortBy === "revenue"
                ? "bg-white text-gray-900 shadow-lg shadow-gray-200/50 ring-1 ring-gray-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.byRevenue}
          </button>
        </div>

        <button
          onClick={() => setView(view === "list" ? "chart" : "list")}
          className="flex items-center justify-center rounded-xl bg-gray-50/50 p-2.5 text-gray-400 ring-1 ring-gray-100 transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-600"
        >
          {view === "list" ? <ChartColumn size={18} /> : <List size={18} />}
        </button>
      </div>

      <div className="flex-1">
        {view === "list" ? (
          <div className="scroll-bar-minimal overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  {[t.product, t.sales, t.revenue, t.stock, t.rating].map(
                    (label, idx) => (
                      <th
                        key={label}
                        className={`pb-4 ${idx === 0 ? (locale === "ar" ? "text-right" : "text-left") : "text-center"} text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400`}
                      >
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="group transition-colors duration-200 hover:bg-gray-50/50"
                  >
                    <td className="whitespace-nowrap py-4 text-sm font-bold text-gray-900 max-w-[200px] truncate">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap py-4 text-center text-sm font-medium text-gray-600">
                      {product.sales}
                    </td>
                    <td className="whitespace-nowrap py-4 text-center text-sm font-bold text-gray-900">
                      {locale === "ar" ? "ر.س" : "$"}{product.revenue.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap py-4 text-center">
                      <span
                        className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-bold ring-1 ${
                          product.stock > 20
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10"
                            : product.stock > 0
                              ? "bg-amber-50 text-amber-700 ring-amber-600/10"
                              : "bg-rose-50 text-rose-700 ring-rose-600/10"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-gray-900">
                          {product.rating}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-[400px]">
             {topProducts.length > 0 ? (
               <Chart
                options={chartOptions}
                series={chartSeries}
                type="bar"
                height="100%"
              />
             ) : (
               <div className="flex h-full items-center justify-center text-sm text-gray-400">
                 No data available
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProducts;
