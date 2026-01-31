"use client";

import { ApexOptions } from "apexcharts";
import { ChartColumn, List } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { LanguageType } from "@/util/translations";

// Dynamically import ApexCharts
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type Product = {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  stock: number;
  rating: number;
};

const topProductsData: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    sales: 156,
    revenue: 3120,
    stock: 24,
    rating: 4.7,
  },
  {
    id: "2",
    name: "Smart Watch Pro",
    sales: 128,
    revenue: 4480,
    stock: 15,
    rating: 4.5,
  },
  {
    id: "3",
    name: "Bluetooth Speaker",
    sales: 98,
    revenue: 1960,
    stock: 32,
    rating: 4.3,
  },
  {
    id: "4",
    name: "USB-C Charger",
    sales: 87,
    revenue: 870,
    stock: 56,
    rating: 4.2,
  },
  {
    id: "5",
    name: "Ergonomic Mouse",
    sales: 76,
    revenue: 1140,
    stock: 18,
    rating: 4.6,
  },
];

type Props = {
  locale?: LanguageType;
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

const TopProducts = ({ locale = "en" }: Props) => {
  const t = translations[locale];
  const [view, setView] = useState<"list" | "chart">("list");
  const [sortBy, setSortBy] = useState<"sales" | "revenue">("sales");

  const sortedProducts = [...topProductsData].sort(
    (a, b) => b[sortBy] - a[sortBy],
  );

  const chartOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
    dataLabels: { enabled: false },
    xaxis: { categories: sortedProducts.map((product) => product.name) },
    colors: ["#82c341"],
  };

  const chartSeries = [
    {
      name: sortBy === "sales" ? t.sales : t.revenue,
      data: sortedProducts.map((p) =>
        sortBy === "sales" ? p.sales : p.revenue,
      ),
    },
  ];

  return (
    <div>
      <h3 className="mb-4 text-lg font-bold text-gray-900">{t.topProducts}</h3>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("sales")}
            className={`rounded-md px-3 py-1 text-sm ${
              sortBy === "sales"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {t.bySales}
          </button>
          <button
            onClick={() => setSortBy("revenue")}
            className={`rounded-md px-3 py-1 text-sm ${
              sortBy === "revenue"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {t.byRevenue}
          </button>
          <button
            onClick={() => setView(view === "list" ? "chart" : "list")}
            className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700"
          >
            {view === "list" ? <ChartColumn size={15} /> : <List size={15} />}
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[t.product, t.sales, t.revenue, t.stock, t.rating].map(
                  (label) => (
                    <th
                      key={label}
                      className={`px-4 py-3 ${locale === "ar" ? "text-right" : "text-left"} text-xs font-medium uppercase tracking-wider text-gray-500`}
                    >
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedProducts.map((product) => (
                <tr key={product.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {product.sales}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        product.stock > 20
                          ? "bg-green-100 text-green-800"
                          : product.stock > 5
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg
                        className="mr-1 h-4 w-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {product.rating}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-80">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height="100%"
          />
        </div>
      )}
    </div>
  );
};

export default TopProducts;
