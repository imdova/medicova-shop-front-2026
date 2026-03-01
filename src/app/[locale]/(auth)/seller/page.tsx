"use client";

import { CardStats, IconType } from "@/components/features/cards/CardStats";
import GenericChart from "@/components/features/charts/GenericChart";
import DynamicTable from "@/components/features/tables/DTable";
import TopProducts from "./components/TopProducts";
import { dummyCards, dummyChartData } from "@/constants/sellerDashboardMock";
import { PencilIcon, TrashIcon } from "lucide-react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

type Order = {
  id: string;
  customer: string;
  total: number;
  status: "pending" | "shipped" | "delivered";
  date: string;
};

const orders: Order[] = [
  {
    id: "ORD123",
    customer: "Alice Johnson",
    total: 129.99,
    status: "pending",
    date: "2025-06-04",
  },
  {
    id: "ORD124",
    customer: "Bob Smith",
    total: 89.5,
    status: "delivered",
    date: "2025-06-03",
  },
];

export default function SellerDashboard() {
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const t = useTranslations("seller_dashboard");

  const statsData: {
    title: string;
    value: string;
    change: string;
    icon: IconType;
  }[] = [
    {
      title: t("totalRevenue"),
      value: "$12,345",
      change: "+12.5%",
      icon: "dollar",
    },
    {
      title: t("totalOrders"),
      value: "156",
      change: "+8.2%",
      icon: "shoppingCart",
    },
    {
      title: t("products"),
      value: "42",
      change: "+3.1%",
      icon: "package",
    },
    {
      title: t("avgRating"),
      value: "4.6",
      change: "+0.3",
      icon: "star",
    },
  ];

  const translatedColumns = [
    {
      key: "id",
      header: t("orderId"),
      sortable: true,
    },
    {
      key: "customer",
      header: t("customer"),
      sortable: true,
    },
    {
      key: "total",
      header: t("total"),
      render: (item: Order) => `$${item.total.toFixed(2)}`,
      sortable: true,
    },
    {
      key: "status",
      header: t("status"),
      render: (item: Order) => {
        const statusColor =
          item.status === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : item.status === "shipped"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800";

        const statusLabel = t(`statusLabels.${item.status}`);

        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}
          >
            {statusLabel}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: "date",
      header: t("date"),
      sortable: true,
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Greeting Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
          {t("welcomeSeller")}
        </h1>
        <p className="font-medium text-gray-500">{t("storeOverview")}</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, i) => (
          <CardStats
            key={i}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            locale={locale}
          />
        ))}
      </div>

      {/* Main Content Sections - Stacked Vertically for Harmony */}
      <div className="space-y-8">
        {/* Sales Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl"
        >
          <GenericChart
            chartTitle={t("salesOverview")}
            data={dummyChartData}
            showCards={true}
            cards={dummyCards}
            locale={locale}
          />
        </motion.div>

        {/* Top Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl"
        >
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-2xl font-black text-gray-900">
              {t("topProducts")}
            </h3>
            <button className="text-sm font-bold text-primary hover:underline">
              {t("viewAll")}
            </button>
          </div>
          <TopProducts locale={locale} />
        </motion.div>
      </div>

      {/* Recent Orders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl"
      >
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-2xl font-black text-gray-900">
              {t("recentOrders")}
            </h3>
            <button className="text-sm font-bold text-primary hover:underline">
              {t("viewAllOrders")}
            </button>
          </div>

          <div className="scroll-bar-minimal overflow-x-auto">
            <DynamicTable
              data={orders}
              columns={translatedColumns}
              pagination={false}
              selectable
              defaultSort={{ key: "date", direction: "desc" }}
              locale={locale}
              minWidth={0}
              className="border-none"
              headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-bold uppercase tracking-widest border-b border-gray-100"
              rowClassName="hover:bg-gray-50/80 transition-colors duration-200 text-sm border-b border-gray-50 last:border-none"
              actions={[
                {
                  label: t("edit"),
                  onClick: () => console.log("Edited"),
                  className:
                    "bg-white/50 backdrop-blur-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50 ring-1 ring-gray-100",
                  icon: <PencilIcon className="h-4 w-4" />,
                },
                {
                  label: t("delete"),
                  onClick: () => console.log("Deleted"),
                  className:
                    "bg-white/50 backdrop-blur-sm text-gray-700 hover:text-red-700 hover:bg-red-50 ring-1 ring-gray-100",
                  icon: <TrashIcon className="h-4 w-4" />,
                },
              ]}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
