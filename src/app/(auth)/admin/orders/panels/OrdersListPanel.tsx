"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  PencilIcon,
  TrashIcon,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import DynamicTable from "@/components/UI/tables/DTable";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Filters } from "@/components/UI/filter/FilterDrawer";
import DateRangeSelector from "@/components/UI/DateRangeSelector";
import { formatDate } from "@/util/dateUtils";
import Dropdown from "@/components/UI/DropDownMenu";
import { LanguageType } from "@/util/translations";

// Translation dictionaries
const translations = {
  en: {
    orderId: "Order ID",
    date: "Date",
    customer: "Customer",
    products: "Products",
    seller: "Seller",
    totalSales: "Total Sales",
    payment: "Payment",
    status: "Status",
    unitPrice: "Unit price",
    quantity: "Quantity",
    searchPlaceholder: "Search by seller name...",
    search: "Search",
    moreFilters: "More Filters",
    download: "Download",
    reset: "Reset",
    showData: "Show Data",
    viewAll: "View All",
    orders: "Orders",
    edit: "Edit",
    delete: "Delete",
    statusOptions: {
      all: "All orders",
      pending: "Pending",
      packaging: "Packaging",
      for_delivery: "For Delivery",
      delivered: "Delivered",
      returned: "Returned",
      cancelled: "Cancelled",
    },
    filterLabels: {
      seller: "Seller",
      customer: "Customer",
      category: "Category",
      brand: "Brand",
      status: "Status",
    },
  },
  ar: {
    orderId: "رقم الطلب",
    date: "التاريخ",
    customer: "العميل",
    products: "المنتجات",
    seller: "البائع",
    totalSales: "إجمالي المبيعات",
    payment: "طريقة الدفع",
    status: "الحالة",
    unitPrice: "سعر الوحدة",
    quantity: "الكمية",
    searchPlaceholder: "البحث باسم البائع...",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    reset: "إعادة تعيين",
    showData: "عرض البيانات",
    viewAll: "عرض الكل",
    orders: "الطلبات",
    edit: "تعديل",
    delete: "حذف",
    statusOptions: {
      all: "جميع الطلبات",
      pending: "قيد الانتظار",
      packaging: "تعبئة",
      for_delivery: "جاهز للتسليم",
      delivered: "تم التسليم",
      returned: "مرتجع",
      cancelled: "ملغى",
    },
    filterLabels: {
      seller: "البائع",
      customer: "العميل",
      category: "الفئة",
      brand: "الماركة",
      status: "الحالة",
    },
  },
};

type Product = {
  name: string;
  image: string;
  quantity: number;
  price: string;
};

type Order = {
  id: string;
  date: string;
  unit_price: string;
  customer: {
    name: string;
    phone: string;
    location: string;
  };
  products: Product[];
  seller: string;
  total: string;
  payment: {
    method: "visa" | "paypal" | "cash" | "mastercard";
    last4?: string;
  };
  status:
    | "Packaging"
    | "Pending"
    | "Delivered"
    | "For Delivery"
    | "Returned"
    | "Cancelled";
  quantity: string;
};

// Orders dummy data
const orders: Order[] = [
  {
    id: "ORD-1001",
    date: "15/5/2025",
    customer: {
      name: "Ahmed Mohamed",
      phone: "012454526885",
      location: "Nasr City, Cairo",
    },
    unit_price: "800 EGP",
    products: [
      {
        name: "Norton Utilities Ultimate",
        image: "/images/products/norton.png",
        quantity: 2,
        price: "800 EGP",
      },
      {
        name: "Wireless Mouse",
        image: "/images/products/mouse.png",
        quantity: 1,
        price: "300 EGP",
      },
    ],
    seller: "Brandova",
    total: "1900 EGP",
    payment: {
      method: "visa",
      last4: "1452",
    },
    status: "Packaging",
    quantity: "4 units",
  },
  {
    id: "ORD-1002",
    date: "14/5/2025",
    unit_price: "800 EGP",
    customer: {
      name: "Fatma Said",
      phone: "01001234567",
      location: "Maadi, Cairo",
    },
    products: [
      {
        name: "Adobe Photoshop License",
        image: "/images/products/photoshop.png",
        quantity: 1,
        price: "1200 EGP",
      },
    ],
    seller: "SoftMart",
    total: "1200 EGP",
    payment: {
      method: "paypal",
    },
    status: "Pending",
    quantity: "4 units",
  },
  {
    id: "ORD-1003",
    date: "13/5/2025",
    unit_price: "800 EGP",
    customer: {
      name: "Mohamed Ali",
      phone: "01112233445",
      location: "Dokki, Giza",
    },
    products: [
      {
        name: "Bluetooth Headphones",
        image: "/images/products/headphones.png",
        quantity: 1,
        price: "1500 EGP",
      },
      {
        name: "Phone Case",
        image: "/images/products/case.png",
        quantity: 2,
        price: "200 EGP",
      },
    ],
    seller: "TechGear",
    total: "1900 EGP",
    payment: {
      method: "mastercard",
    },
    status: "Delivered",
    quantity: "4 units",
  },
  {
    id: "ORD-1004",
    date: "12/5/2025",
    unit_price: "500 EGP",
    customer: {
      name: "Samira Ahmed",
      phone: "01098765432",
      location: "Heliopolis, Cairo",
    },
    products: [
      {
        name: "Smart Watch",
        image: "/images/products/watch.png",
        quantity: 1,
        price: "1500 EGP",
      },
    ],
    seller: "TechGear",
    total: "1500 EGP",
    payment: {
      method: "cash",
    },
    status: "For Delivery",
    quantity: "1 unit",
  },
  {
    id: "ORD-1005",
    date: "11/5/2025",
    unit_price: "350 EGP",
    customer: {
      name: "Youssef Kamal",
      phone: "01234567890",
      location: "Zamalek, Cairo",
    },
    products: [
      {
        name: "Wireless Earbuds",
        image: "/images/products/earbuds.png",
        quantity: 1,
        price: "700 EGP",
      },
    ],
    seller: "Brandova",
    total: "700 EGP",
    payment: {
      method: "visa",
      last4: "9876",
    },
    status: "Returned",
    quantity: "1 unit",
  },
  {
    id: "ORD-1006",
    date: "10/5/2025",
    unit_price: "1200 EGP",
    customer: {
      name: "Laila Hassan",
      phone: "01111222333",
      location: "6th October City",
    },
    products: [
      {
        name: "Laptop Backpack",
        image: "/images/products/backpack.png",
        quantity: 1,
        price: "600 EGP",
      },
    ],
    seller: "SoftMart",
    total: "600 EGP",
    payment: {
      method: "mastercard",
      last4: "5432",
    },
    status: "Cancelled",
    quantity: "1 unit",
  },
];

// Filter options with translations
const sellerOptions = [
  { id: "all", name: { en: "All Sellers", ar: "كل البائعين" } },
  { id: "brandova", name: { en: "Brandova", ar: "Brandova" } },
  { id: "softmart", name: { en: "SoftMart", ar: "SoftMart" } },
  { id: "techgear", name: { en: "TechGear", ar: "TechGear" } },
];

const customerOptions = [
  { id: "all", name: { en: "All Customers", ar: "كل العملاء" } },
  { id: "ahmed", name: { en: "Ahmed Mohamed", ar: "Ahmed Mohamed" } },
  { id: "fatma", name: { en: "Fatma Said", ar: "Fatma Said" } },
  { id: "mohamed", name: { en: "Mohamed Ali", ar: "Mohamed Ali" } },
];

const statusOptions = [
  { id: "all", name: { en: "All", ar: "الكل" } },
  { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
  { id: "packaging", name: { en: "Packaging", ar: "جاري التغليف" } },
  { id: "for_delivery", name: { en: "For Delivery", ar: "قيد التوصيل" } },
  { id: "delivered", name: { en: "Delivered", ar: "تم التوصيل" } },
  { id: "returned", name: { en: "Returned", ar: "تم الإرجاع" } },
  { id: "cancelled", name: { en: "Cancelled", ar: "تم الإلغاء" } },
];

const categoryOptions = [
  { id: "all", name: { en: "All Category", ar: "كل الفئات" } },
  { id: "visa", name: { en: "Visa", ar: "Visa" } },
  { id: "mastercard", name: { en: "Mastercard", ar: "Mastercard" } },
  { id: "paypal", name: { en: "PayPal", ar: "PayPal" } },
  { id: "cash", name: { en: "Cash", ar: "نقدي" } },
];

const brandOptions = [
  { id: "all", name: { en: "All Brands", ar: "كل الماركات" } },
  { id: "nike", name: { en: "Nike", ar: "Nike" } },
  { id: "adidas", name: { en: "Adidas", ar: "Adidas" } },
  { id: "priority", name: { en: "Priority", ar: "Priority" } },
];

export default function OrdersListPanel({
  locale = "en",
}: {
  locale: LanguageType;
}) {
  const isRTL = locale === "ar";
  const t = translations[locale];

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  // Get current filter values from URL
  const sellerFilter = searchParams.get("seller") || "all";
  const customerFilter = searchParams.get("customer") || "all";
  const CategoryFilter = searchParams.get("category") || "all";
  const statusFilter = searchParams.get("status") || "all";
  const brandFilter = searchParams.get("brand") || "all";

  // Calculate order counts by status
  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      pending: 0,
      packaging: 0,
      for_delivery: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      if (order.status === "Pending") counts.pending++;
      if (order.status === "Packaging") counts.packaging++;
      if (order.status === "For Delivery") counts.for_delivery++;
      if (order.status === "Delivered") counts.delivered++;
      if (order.status === "Returned") counts.returned++;
      if (order.status === "Cancelled") counts.cancelled++;
    });

    return counts;
  }, []);

  // Filter orders based on active status
  const filteredOrders = useMemo(() => {
    if (activeStatus === "all") return orders;
    return orders.filter((order) => {
      if (activeStatus === "pending") return order.status === "Pending";
      if (activeStatus === "packaging") return order.status === "Packaging";
      if (activeStatus === "for_delivery")
        return order.status === "For Delivery";
      if (activeStatus === "delivered") return order.status === "Delivered";
      if (activeStatus === "returned") return order.status === "Returned";
      if (activeStatus === "cancelled") return order.status === "Cancelled";
      return true;
    });
  }, [activeStatus]);

  // Orders table columns with translations
  const orderColumns = useMemo(
    () => [
      {
        key: "id",
        header: t.orderId,
        sortable: true,
      },
      {
        key: "date",
        header: t.date,
        sortable: true,
      },
      {
        key: "customer",
        header: t.customer,
        render: (item: Order) => (
          <div
            className={`text-sm leading-5 ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className="font-medium">{item.customer.name}</div>
            <div className="text-xs text-gray-500">{item.customer.phone}</div>
            <div className="text-xs text-gray-500">
              {item.customer.location}
            </div>
          </div>
        ),
      },
      {
        key: "products",
        header: t.products,
        render: (item: Order) => (
          <div className="space-y-2">
            {item.products.map((product: Product, index: number) => (
              <div
                key={index}
                className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Image
                  className="h-8 w-8 rounded object-cover"
                  src={product.image}
                  alt={product.name}
                  width={32}
                  height={32}
                />
                <div className={isRTL ? "text-right" : "text-left"}>
                  <div className="text-sm">{product.name}</div>
                  <div className="text-xs text-gray-500">
                    {product.quantity} × {product.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "seller",
        header: t.seller,
      },
      {
        key: "total",
        header: t.totalSales,
        sortable: true,
      },
      {
        key: "payment",
        header: t.payment,
        render: (item: Order) => (
          <div
            className={`flex items-center gap-1 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {item.payment.method === "visa" && (
              <Image
                src="/icons/card-visa.svg"
                alt="visa"
                width={24}
                height={16}
              />
            )}
            {item.payment.method === "mastercard" && (
              <Image
                src="/icons/card-mastercard.svg"
                alt="mastercard"
                width={24}
                height={16}
              />
            )}
            {item.payment.method === "paypal" && (
              <Image
                src="/icons/google-play.svg"
                alt="paypal"
                width={24}
                height={16}
              />
            )}
            <span className="text-xs capitalize">
              {item.payment.method}
              {item.payment.last4 && ` •••• ${item.payment.last4}`}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        header: t.status,
        render: (item: Order) => {
          let color = "bg-gray-100 text-gray-700";
          if (item.status === "For Delivery")
            color = "bg-blue-100 text-blue-700";
          if (item.status === "Packaging")
            color = "bg-indigo-100 text-indigo-700";
          if (item.status === "Pending")
            color = "bg-yellow-100 text-yellow-700";
          if (item.status === "Delivered")
            color = "bg-green-100 text-green-700";
          if (item.status === "Cancelled") color = "bg-red-100 text-red-700";
          if (item.status === "Returned")
            color = "bg-orange-100 text-orange-700";

          return (
            <span
              className={`inline-block rounded-full px-2 text-[10px] ${color}`}
            >
              {
                t.statusOptions[
                  item.status.toLowerCase() as keyof typeof t.statusOptions
                ]
              }
            </span>
          );
        },
      },
      {
        key: "unit_price",
        header: t.unitPrice,
      },
      {
        key: "quantity",
        header: t.quantity,
        render: (item: Order) => (
          <span className="text-xs capitalize">{item.quantity}</span>
        ),
      },
    ],
    [t, isRTL],
  );

  const handleDateChange = (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    const params = new URLSearchParams(searchParams);
    if (range.startDate)
      params.set("start_date", formatDate(range.startDate, "yyyy-MM-dd"));
    else params.delete("start_date");
    if (range.endDate)
      params.set("end_date", formatDate(range.endDate, "yyyy-MM-dd"));
    else params.delete("end_date");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(filterType, value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleStatusTabClick = (status: string) => {
    setActiveStatus(status);
    handleFilterChange("status", status);
  };

  const resetFilters = () => {
    setActiveStatus("all");
    router.replace(pathname);
  };

  return (
    <div className="relative space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="shadow-xs space-y-6 rounded-lg border border-gray-200 bg-white p-3">
        <div className={`flex flex-col gap-2 md:flex-row`}>
          <DateRangeSelector
            onDateChange={handleDateChange}
            formatString="MM/dd/yyyy"
            className="w-full md:w-fit"
            locale={locale}
          />
          <div className="flex flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full rounded-s-md border ${locale === "ar" ? "border-l-0" : "border-r-0"} border-gray-300 px-3 py-1.5 pl-10 outline-none placeholder:text-sm`}
              />
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-600`}
                size={15}
              />
            </div>
            <button
              onClick={() => handleFilterChange("search", searchQuery)}
              className={`rounded-e-md bg-light-primary px-3 py-1.5 text-sm text-white hover:brightness-90`}
            >
              {t.search}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className={`flex items-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50`}
            >
              <SlidersHorizontal size={16} />
              {t.moreFilters}
            </button>
            <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
              {t.download}
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Seller Filter */}
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {t.filterLabels.seller}
              </h3>
              <div className="mt-2">
                <Dropdown
                  options={sellerOptions}
                  selected={sellerFilter}
                  onSelect={(value) =>
                    handleFilterChange("seller", value.toString())
                  }
                  locale={locale}
                />
              </div>
            </div>

            {/* Customer Filter */}
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {t.filterLabels.customer}
              </h3>
              <div className="mt-2">
                <Dropdown
                  options={customerOptions}
                  selected={customerFilter}
                  onSelect={(value) =>
                    handleFilterChange("customer", value.toString())
                  }
                  locale={locale}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {t.filterLabels.category}
              </h3>
              <Dropdown
                options={categoryOptions}
                selected={CategoryFilter}
                onSelect={(value) =>
                  handleFilterChange("category", value.toString())
                }
                locale={locale}
              />
            </div>
            {/* Brands Method Filter */}
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {t.filterLabels.brand}
              </h3>
              <Dropdown
                options={brandOptions}
                selected={brandFilter}
                onSelect={(value) =>
                  handleFilterChange("brand", value.toString())
                }
                locale={locale}
              />
            </div>
            {/* status Filter */}
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {t.filterLabels.status}
              </h3>
              <Dropdown
                options={statusOptions}
                selected={statusFilter}
                onSelect={(value) =>
                  handleFilterChange("status", value.toString())
                }
                locale={locale}
              />
            </div>
          </div>

          <Filters
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            filtersData={[]}
            locale={locale}
          />
        </div>

        <div className={`flex flex-col justify-between gap-4 md:flex-row`}>
          {/* Status Tabs */}
          <div className={`flex flex-wrap gap-2 ${isRTL ? "justify-end" : ""}`}>
            {statusOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleStatusTabClick(option.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1 text-xs shadow-sm transition-colors ${
                  activeStatus === option.id
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-gray-500"
                } ${isRTL ? "flex-row-reverse" : ""}`}
              >
                {option.name[locale]} (
                {orderCounts[option.id as keyof typeof orderCounts]})
              </button>
            ))}
          </div>
          <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <button
              onClick={resetFilters}
              className="rounded border border-primary px-3 py-1.5 text-sm text-primary transition hover:bg-primary hover:text-white"
            >
              {t.reset}
            </button>
            <button className="rounded bg-light-primary px-3 py-1.5 text-sm text-white transition hover:brightness-95">
              {t.showData}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t.orders}</h2>
          <Link
            href="#"
            className={`flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {t.viewAll} <ChevronRight size={14} />
          </Link>
        </div>

        <DynamicTable
          data={filteredOrders}
          columns={orderColumns}
          minWidth={1200}
          pagination={true}
          itemsPerPage={5}
          selectable={true}
          actions={[
            {
              label: t.edit,
              onClick: () => console.log("edited"),
              className:
                "bg-white text-gray-700 hover:text-blue-700 hover:bg-blue-50",
              icon: <PencilIcon className="h-4 w-4" />,
            },
            {
              label: t.delete,
              onClick: () => console.log("Deleted"),
              className:
                "bg-white text-gray-700 hover:text-red-700 hover:bg-red-50",
              icon: <TrashIcon className="h-4 w-4" />,
            },
          ]}
          solidActions={[
            {
              onClick: () => console.log("edited"),
              icon: <PencilIcon className="h-4 w-4" />,
              color: "#2563eb",
            },
            {
              onClick: () => console.log("Deleted"),
              color: "#dc2626",
              icon: <TrashIcon className="h-4 w-4" />,
            },
          ]}
          locale={locale}
        />
      </div>
    </div>
  );
}
