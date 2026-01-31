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
import { LanguageType } from "@/util/translations";
import Dropdown from "@/components/UI/DropDownMenu";
type Product = {
  name: string;
  image: string;
  quantity: number;
  price: string;
};
type Refund = {
  id: string;
  order_id: string;
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
  status: "Processed" | "Pending";

  quantity: string;
};

// Refunds dummy data
const refunds: Refund[] = [
  {
    id: "ewqke2",
    order_id: "ORD-1001",
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
    status: "Processed",
    quantity: "4 units",
  },
  {
    id: "ewjqe2",
    order_id: "ORD-1002",
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
    id: "ewqgge2",
    order_id: "ORD-1003",
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
    status: "Pending",
    quantity: "4 units",
  },
  {
    id: "ewqde2",
    order_id: "ORD-1004",
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
    status: "Pending",
    quantity: "1 unit",
  },
  {
    id: "ewfqe2",
    order_id: "ORD-1005",
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
    status: "Pending",
    quantity: "1 unit",
  },
  {
    id: "ewge2",
    order_id: "ORD-1006",
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
    status: "Pending",
    quantity: "1 unit",
  },
];

// Filter options
const sellerOptions = [
  { id: "all", name: { en: "All Sellers", ar: "كل البائعين" } },
  { id: "brandova", name: { en: "Brandova", ar: "براندوفا" } },
  { id: "softmart", name: { en: "SoftMart", ar: "سوفت مارت" } },
  { id: "techgear", name: { en: "TechGear", ar: "تيك جير" } },
];

const customerOptions = [
  { id: "all", name: { en: "All Customers", ar: "كل العملاء" } },
  { id: "ahmed", name: { en: "Ahmed Mohamed", ar: "أحمد محمد" } },
  { id: "fatma", name: { en: "Fatma Said", ar: "فاطمة سعيد" } },
  { id: "mohamed", name: { en: "Mohamed Ali", ar: "محمد علي" } },
];

const statusOptions = [
  { id: "all", name: { en: "All Status", ar: "كل الحالات" } },
  { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
  { id: "processed", name: { en: "Processed", ar: "تمت المعالجة" } },
];

const productsOptions = [
  { id: "all", name: { en: "All Products", ar: "كل المنتجات" } },
  { id: "standard", name: { en: "Standard", ar: "عادي" } },
  { id: "express", name: { en: "Express", ar: "سريع" } },
  { id: "priority", name: { en: "Priority", ar: "أولوية" } },
];

export default function RefundRequstsListPanel({
  locale = "en",
}: {
  locale: LanguageType;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  console.log(filtersOpen);
  // Get current filter values from URL
  const sellerFilter = searchParams.get("seller") || "all";
  const customerFilter = searchParams.get("customer") || "all";
  const productsFilter = searchParams.get("product") || "all";
  const statusFilter = searchParams.get("status") || "all";

  // Calculate order counts by status
  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: refunds.length,
      pending: 0,
      processed: 0,
    };

    refunds.forEach((refund) => {
      if (refund.status === "Pending") counts.pending++;
      if (refund.status === "Processed") counts.Processed++;
    });

    return counts;
  }, []);

  // Filter refunds based on active status
  const filteredOrders = useMemo(() => {
    if (activeStatus === "all") return refunds;
    return refunds.filter((refund) => {
      if (activeStatus === "pending") return refund.status === "Pending";
      if (activeStatus === "processed") return refund.status === "Processed";

      return true;
    });
  }, [activeStatus]);

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
  // Orders table columns
  const orderColumns = [
    {
      key: "id",
      header: locale === "ar" ? "معرف الاسترداد" : "Refund ID",
      sortable: true,
    },
    {
      key: "order_id",
      header: locale === "ar" ? "معرف الطلب" : "Order ID",
      sortable: true,
    },
    {
      key: "date",
      header: locale === "ar" ? "التاريخ" : "Date",
      sortable: true,
    },
    {
      key: "products",
      header: locale === "ar" ? "المنتجات" : "Products",
      render: (item: Refund) => (
        <div className="space-y-2">
          {item.products.map((product: Product, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <Image
                className="h-8 w-8 rounded object-cover"
                src={product.image}
                alt={product.name}
                width={32}
                height={32}
              />
              <Link href="#" className="text-sm hover:underline">
                {product.name}
              </Link>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "customer",
      header: locale === "ar" ? "العميل" : "Customer",
      render: (item: Refund) => (
        <div className="text-sm leading-5">
          <div className="font-medium">{item.customer.name}</div>
          <div className="text-xs text-gray-500">{item.customer.phone}</div>
          <div className="text-xs text-gray-500">{item.customer.location}</div>
        </div>
      ),
    },
    {
      key: "seller",
      header: locale === "ar" ? "البائع" : "Seller",
    },
    {
      key: "unit_price",
      header: locale === "ar" ? "سعر الوحدة" : "Unit Price",
    },
    {
      key: "quantity",
      header: locale === "ar" ? "الكمية" : "Quantity",
    },
    {
      key: "total",
      header: locale === "ar" ? "إجمالي المبيعات" : "Total Sales",
      sortable: true,
    },
    {
      key: "status",
      header: locale === "ar" ? "الحالة" : "Status",
      render: (item: Refund) => {
        let color = "bg-gray-100 text-gray-700";
        if (item.status === "Pending") color = "bg-yellow-100 text-yellow-700";
        if (item.status === "Processed") color = "bg-green-100 text-green-700";

        const statusLabel =
          item.status === "Pending"
            ? locale === "ar"
              ? "قيد الانتظار"
              : "Pending"
            : item.status === "Processed"
              ? locale === "ar"
                ? "تمت المعالجة"
                : "Processed"
              : item.status;

        return (
          <span
            className={`inline-block rounded-full px-2 text-[10px] ${color}`}
          >
            {statusLabel}
          </span>
        );
      },
    },
  ];

  return (
    <div className="relative space-y-6">
      <div className="shadow-xs space-y-6 rounded-lg border border-gray-200 bg-white p-3">
        <div className="flex flex-col gap-2 md:flex-row">
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
                placeholder={
                  locale === "en"
                    ? "Search by seller name..."
                    : "البحث باسم البائع..."
                }
                className={`w-full rounded-s-md border ${locale === "ar" ? "border-l-0" : "border-r-0"} border-gray-300 px-3 py-1.5 pl-10 outline-none placeholder:text-sm`}
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                size={15}
              />
            </div>
            <button
              onClick={() => handleFilterChange("search", searchQuery)}
              className="rounded-e-md bg-light-primary px-3 py-1.5 text-sm text-white hover:brightness-90"
            >
              {locale === "en" ? "Search" : "بحث"}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal size={16} />
              {locale === "en" ? "More Filters" : "المزيد من الفلاتر"}
            </button>
            <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
              {locale === "en" ? "Download" : "تحميل"}
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Seller Filter */}
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {locale === "en" ? "Seller" : "البائع"}
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
                {locale === "en" ? "Customer" : "العميل"}
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

            {/* Products Filter */}
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {locale === "en" ? "Product" : "المنتج"}
              </h3>
              <Dropdown
                options={productsOptions}
                selected={productsFilter}
                onSelect={(value) =>
                  handleFilterChange("product", value.toString())
                }
                locale={locale}
              />
            </div>
            {/* status Filter */}
            <div>
              <h3 className="mb-2 text-sm font-medium">
                {locale === "en" ? "Status" : "الحالة"}
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

        <div className="flex flex-col justify-between gap-4 md:flex-row">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleStatusTabClick(option.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1 text-xs shadow-sm transition-colors ${
                  activeStatus === option.id
                    ? "border-primary bg-primary text-white"
                    : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                {option.name[locale]} (
                {orderCounts[option.id as keyof typeof orderCounts]})
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="rounded border border-primary px-3 py-1.5 text-sm text-primary transition hover:bg-primary hover:text-white"
            >
              {locale === "en" ? "Reset" : "إعادة تعيين"}
            </button>
            <button className="rounded bg-light-primary px-3 py-1.5 text-sm text-white transition hover:brightness-95">
              {locale === "en" ? "Show Data" : "عرض البيانات"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {locale === "en" ? "Orders" : "الطلبات"}
          </h2>
          <Link
            href="#"
            className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
          >
            {locale === "en" ? "View All" : "عرض الكل"}{" "}
            <ChevronRight size={14} />
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
              label: { en: "Edit", ar: "تعديل" },
              onClick: () => console.log("edited"),
              className:
                "bg-white text-gray-700 hover:text-blue-700 hover:bg-blue-50",
              icon: <PencilIcon className="h-4 w-4" />,
            },
            {
              label: { en: "Delete", ar: "حذف" },
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
