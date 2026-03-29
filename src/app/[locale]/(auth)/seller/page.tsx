"use client";

import { CardStats, IconType } from "@/components/features/cards/CardStats";
import GenericChart from "@/components/features/charts/GenericChart";
import DynamicTable from "@/components/features/tables/DTable";
import TopProducts from "./components/TopProducts";
import { dummyCards, dummyChartData } from "@/constants/sellerDashboardMock";
import { PencilIcon, TrashIcon, Loader2, DollarSign, ShoppingCart, RotateCcw } from "lucide-react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { getSellerOrders, ApiOrder } from "@/services/orderService";
import { getProducts, ApiProduct } from "@/services/productService";
import { collectCurrentSellerIds, productBelongsToSeller } from "@/components/features/ProductManagement/ownership";

export default function SellerDashboard() {
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const t = useTranslations("seller_dashboard");
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const user = session?.user;

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        setLoading(true);
        const [ordersData, productsData] = await Promise.all([
          getSellerOrders(token),
          getProducts(token)
        ]);
        setOrders(ordersData);
        setProducts(productsData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const sellerIds = useMemo(() => collectCurrentSellerIds(user), [user]);
  
  const myProducts = useMemo(() => {
    return products.filter(p => productBelongsToSeller(p, sellerIds));
  }, [products, sellerIds]);

  const myProductIds = useMemo(() => new Set(myProducts.map(p => p._id)), [myProducts]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const isPaidOrCod = order.paymentStatus === "paid" || order.paymentMethod === "cash_on_delivery";
      if (!isPaidOrCod) return false;
      
      // Check if any item belongs to current seller
      return order.items?.some(item => item.productId && myProductIds.has(item.productId));
    });
  }, [orders, myProductIds]);

  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    let totalRevenue = 0;
    
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        if (item.productId && myProductIds.has(item.productId)) {
          totalRevenue += (item.unitPrice || 0) * (item.quantity || 0);
        }
      });
    });

    const productCount = myProducts.length;

    return {
      totalRevenue: `${isAr ? "ر.س" : "$"}${totalRevenue.toLocaleString()}`,
      totalOrders: totalOrders.toString(),
      productCount: productCount.toString()
    };
  }, [filteredOrders, myProducts, myProductIds, isAr]);

  const statsData: {
    title: string;
    value: string;
    change: string;
    icon: IconType;
  }[] = [
    {
      title: t("totalRevenue"),
      value: stats.totalRevenue,
      change: "+12.5%",
      icon: "dollar",
    },
    {
      title: t("totalOrders"),
      value: stats.totalOrders,
      change: "+8.2%",
      icon: "shoppingCart",
    },
    {
      title: t("products"),
      value: stats.productCount,
      change: "+3.1%",
      icon: "package",
    },
  ];

  const translatedColumns = useMemo(() => [
    {
      key: "orderId",
      header: t("orderId"),
      sortable: true,
      render: (item: ApiOrder) => <span className="font-bold text-gray-900">{item.orderId?.slice(-8).toUpperCase() || "N/A"}</span>
    },
    {
      key: "name",
      header: t("customer"),
      sortable: true,
      render: (item: ApiOrder) => item.name || item.user?.name || "Customer"
    },
    {
      key: "total",
      header: t("total"),
      render: (item: ApiOrder) => <span className="font-bold text-emerald-600">{isAr ? "ر.س" : "$"}{(item.total || 0).toFixed(2)}</span>,
      sortable: true,
    },
    {
      key: "status",
      header: t("status"),
      render: (item: ApiOrder) => {
        const status = item.status || "pending";
        const statusColor =
          status === "pending"
            ? "bg-amber-50 text-amber-600"
            : status === "shipped" || status === "processing"
              ? "bg-blue-50 text-blue-600"
              : status === "delivered"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600";

        const statusLabel = t(`statusLabels.${status}`) || status;

        return (
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusColor}`}
          >
            {statusLabel}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: "createdAt",
      header: t("date"),
      render: (item: ApiOrder) => new Date(item.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US"),
      sortable: true,
    },
  ], [t, locale, isAr]);

  const recentOrders = useMemo(() => filteredOrders.slice(0, 5), [filteredOrders]);

  const chartCards = useMemo(() => [
    {
      title: { en: "Revenue", ar: "الإيرادات" },
      value: stats.totalRevenue,
      color: "#3b82f6",
      icon: DollarSign,
    },
    {
      title: { en: "Orders", ar: "الطلبات" },
      value: stats.totalOrders,
      color: "#10b981",
      icon: ShoppingCart,
    },
    {
      title: { en: "Returns", ar: "المرتجعات" },
      value: "0",
      color: "#ef4444",
      icon: RotateCcw,
    },
  ], [stats]);

  if (loading && token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Greeting Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-3xl">
          {t("welcomeSeller")} {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-lg">{t("storeOverview")}</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-100/50"
        >
          <GenericChart
            chartTitle={t("salesOverview")}
            data={dummyChartData}
            showCards={true}
            cards={chartCards}
            locale={locale}
          />
        </motion.div>

        {/* Top Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-100/50"
        >
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight text-gray-900">
              {t("topProducts")}
            </h3>
            <button className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
              {t("viewAll")}
            </button>
          </div>
          <TopProducts locale={locale} products={myProducts} orders={filteredOrders} />
        </motion.div>
      </div>

      {/* Recent Orders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-gray-100/50"
      >
        <div className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight text-gray-900">
              {t("recentOrders")}
            </h3>
            <button className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">
              {t("viewAllOrders")}
            </button>
          </div>

          <div className="scroll-bar-minimal overflow-x-auto">
            <DynamicTable
              data={recentOrders}
              columns={translatedColumns}
              pagination={false}
              selectable={false}
              defaultSort={{ key: "createdAt", direction: "desc" }}
              locale={locale}
              minWidth={800}
              className="border-none"
              headerClassName="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100"
              rowClassName="hover:bg-gray-50/50 transition-colors duration-200 text-[13px] border-b border-gray-50 last:border-none h-14"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
