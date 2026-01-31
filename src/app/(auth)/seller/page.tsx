"use client";

import { CardStats, IconType } from "@/components/UI/cards/CardStats";
import GenericChart from "@/components/UI/charts/GenericChart";
import DynamicTable from "@/components/UI/tables/DTable";
import TopProducts from "./components/TopProducts";
import { dummyCards, dummyChartData } from "@/constants/sellerDashboardMock";
import { PencilIcon, TrashIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

const columns = (locale: "en" | "ar") => [
  {
    key: "id",
    header: {
      en: "Order ID",
      ar: "رقم الطلب",
    }[locale],
    sortable: true,
  },
  {
    key: "customer",
    header: {
      en: "Customer",
      ar: "العميل",
    }[locale],
    sortable: true,
  },
  {
    key: "total",
    header: {
      en: "Total",
      ar: "الإجمالي",
    }[locale],
    render: (item: Order) => `$${item.total.toFixed(2)}`,
    sortable: true,
  },
  {
    key: "status",
    header: {
      en: "Status",
      ar: "الحالة",
    }[locale],
    render: (item: Order) => {
      const statusColor =
        item.status === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : item.status === "shipped"
            ? "bg-blue-100 text-blue-800"
            : "bg-green-100 text-green-800";

      const statusLabel = {
        pending: { en: "Pending", ar: "قيد الانتظار" },
        shipped: { en: "Shipped", ar: "تم الشحن" },
        delivered: { en: "Delivered", ar: "تم التوصيل" },
      }[item.status][locale];

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
    header: {
      en: "Date",
      ar: "التاريخ",
    }[locale],
    sortable: true,
  },
];

const statsData: {
  title: { en: string; ar: string };
  value: string;
  change: string;
  icon: IconType;
}[] = [
  {
    title: { en: "Total Revenue", ar: "إجمالي الإيرادات" },
    value: "$12,345",
    change: "+12.5%",
    icon: "dollar",
  },
  {
    title: { en: "Total Orders", ar: "إجمالي الطلبات" },
    value: "156",
    change: "+8.2%",
    icon: "shoppingCart",
  },
  {
    title: { en: "Products", ar: "المنتجات" },
    value: "42",
    change: "+3.1%",
    icon: "package",
  },
  {
    title: { en: "Avg. Rating", ar: "متوسط التقييم" },
    value: "4.6",
    change: "+0.3",
    icon: "star",
  },
];
export default function SellerDashboard() {
  const { language } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, i) => (
          <CardStats
            key={i}
            title={stat.title[language]}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            locale={language}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-fit overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
          <GenericChart
            chartTitle="Sales Overview"
            data={dummyChartData}
            showCards={true}
            cards={dummyCards}
            locale={language}
          />
        </div>
        <div>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <TopProducts locale={language} />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-4">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            {language == "ar" ? "الطلبات الأخيرة" : "Recent Orders"}
          </h3>
          <div className="overflow-x-auto">
            <DynamicTable
              data={orders}
              columns={columns(language)}
              pagination={true}
              itemsPerPage={5}
              selectable
              defaultSort={{ key: "date", direction: "desc" }}
              locale={language}
              actions={[
                {
                  label: "Edit",
                  onClick: () => console.log("Edited"),
                  className:
                    "bg-white text-gray-700 hover:text-blue-700 hover:bg-blue-50 ",
                  icon: <PencilIcon className="h-4 w-4" />,
                },
                {
                  label: "Delete",
                  onClick: () => console.log("Deleted"),
                  className:
                    "bg-white text-gray-700 hover:text-red-700 hover:bg-red-50 ",
                  icon: <TrashIcon className="h-4 w-4" />,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
