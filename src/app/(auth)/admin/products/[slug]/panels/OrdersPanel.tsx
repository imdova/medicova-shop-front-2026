"use client";
import { PencilIcon, Search, SlidersHorizontal, TrashIcon } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import DynamicTable from "@/components/UI/tables/DTable";
import { useState } from "react";
import DateRangeSelector from "@/components/UI/DateRangeSelector";
import { formatDate } from "@/util/dateUtils";
import Avatar from "@/components/UI/Avatar";
import { Filters } from "@/components/UI/filter/FilterDrawer";
import { productFilters } from "@/constants/drawerFilter";
import { LanguageType } from "@/util/translations";

type InvoiceRow = {
  id: string;
  customer: {
    name: string;
    image?: string;
  };
  date: string;
  seller: string;
  category: string;
  brand: string;
  unitPrice: number;
  quantity: number;
  total: number;
  status: "Paid" | "Pending" | "Canceled";
};

// Translation dictionary
const translations = {
  en: {
    invoice: "Invoice",
    customer: "Customer",
    date: "Date",
    seller: "Seller",
    category: "Category",
    brand: "Brand",
    unitPrice: "Unit Price",
    quantity: "Quantity",
    totalPurchase: "Total Purchase",
    status: "Status",
    search: "Search",
    moreFilters: "More Filters",
    download: "Download",
    edit: "Edit",
    delete: "Delete",
    paid: "Paid",
    pending: "Pending",
    canceled: "Canceled",
    units: "units",
  },
  ar: {
    invoice: "فاتورة",
    customer: "العميل",
    date: "التاريخ",
    seller: "البائع",
    category: "الفئة",
    brand: "العلامة التجارية",
    unitPrice: "سعر الوحدة",
    quantity: "الكمية",
    totalPurchase: "إجمالي الشراء",
    status: "الحالة",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    edit: "تعديل",
    delete: "حذف",
    paid: "مدفوع",
    pending: "قيد الانتظار",
    canceled: "ملغى",
    units: "وحدات",
  },
};

const invoiceData: InvoiceRow[] = [
  {
    id: "INV001",
    customer: {
      name: "Dianne Russell",
    },
    date: "15/5/2025",
    seller: "25487",
    category: "Medical Wear",
    brand: "Brandova",
    unitPrice: 800,
    quantity: 4,
    total: 3200,
    status: "Paid",
  },
  {
    id: "INV002",
    customer: {
      name: "Dianne Russell",
    },
    date: "15/5/2025",
    seller: "25487",
    category: "Medical Wear",
    brand: "Brandova",
    unitPrice: 800,
    quantity: 4,
    total: 3200,
    status: "Paid",
  },
  {
    id: "INV003",
    customer: {
      name: "Dianne Russell",
    },
    date: "15/5/2025",
    seller: "25487",
    category: "Medical Wear",
    brand: "Brandova",
    unitPrice: 800,
    quantity: 4,
    total: 3200,
    status: "Paid",
  },
  {
    id: "INV004",
    customer: {
      name: "Dianne Russell",
    },
    date: "15/5/2025",
    seller: "25487",
    category: "Medical Wear",
    brand: "Brandova",
    unitPrice: 800,
    quantity: 4,
    total: 3200,
    status: "Paid",
  },
];

const getColumns = (locale: LanguageType) => [
  { key: "id", header: translations[locale].invoice, sortable: true },
  {
    key: "customer",
    header: translations[locale].customer,
    render: (item: InvoiceRow) => (
      <div className="flex items-center gap-2">
        <Avatar
          className="h-9 w-9"
          imageUrl={item.customer.image}
          name={item.customer.name}
        />
        <span>{item.customer.name}</span>
      </div>
    ),
    sortable: true,
  },
  { key: "date", header: translations[locale].date, sortable: true },
  { key: "seller", header: translations[locale].seller, sortable: true },
  { key: "category", header: translations[locale].category, sortable: true },
  { key: "brand", header: translations[locale].brand, sortable: true },
  {
    key: "unitPrice",
    header: translations[locale].unitPrice,
    render: (item: InvoiceRow) =>
      `${item.unitPrice} ${locale === "ar" ? "جنيه" : "EG"}`,
  },
  {
    key: "quantity",
    header: translations[locale].quantity,
    render: (item: InvoiceRow) =>
      `${item.quantity} ${translations[locale].units}`,
  },
  {
    key: "total",
    header: translations[locale].totalPurchase,
    render: (item: InvoiceRow) =>
      `${item.total} ${locale === "ar" ? "جنيه" : "EG"}`,
  },
  {
    key: "status",
    header: translations[locale].status,
    render: (item: InvoiceRow) => {
      const statusColor =
        item.status === "Paid"
          ? "bg-green-100 text-green-800"
          : item.status === "Pending"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800";

      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}
        >
          {
            translations[locale][
              item.status.toLowerCase() as keyof (typeof translations)["en"]
            ]
          }
        </span>
      );
    },
  },
];

export default function OrdersPanel({
  locale = "en",
}: {
  locale: LanguageType;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const t = translations[locale];
  const isRTL = locale === "ar";

  const currentSearchQuery = searchParams.get("search")?.toLowerCase() || "";

  const handleDateChange = (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    const params = new URLSearchParams(searchParams);

    if (range.startDate) {
      params.set("start_date", formatDate(range.startDate, "yyyy-MM-dd"));
    } else {
      params.delete("start_date");
    }

    if (range.endDate) {
      params.set("end_date", formatDate(range.endDate, "yyyy-MM-dd"));
    } else {
      params.delete("end_date");
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleFilterChange = (
    filterType: string,
    value: string | Date | null,
  ) => {
    const params = new URLSearchParams(searchParams);

    if (!value) {
      params.delete(filterType);
    } else {
      const formattedValue =
        value instanceof Date ? value.toISOString() : value;
      params.set(filterType, formattedValue);
    }

    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="shadow-xs space-y-6 rounded-lg border border-gray-200 bg-white p-3">
        {/* search content */}
        <div>
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
                  defaultValue={currentSearchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search}
                  className={`w-full rounded-s-md border ${isRTL ? "border-l-0" : "border-r-0"} border-gray-300 px-3 py-1.5 outline-none placeholder:text-sm ${
                    isRTL ? "pr-10" : "pl-10"
                  }`}
                />
                <Search
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-600 ${
                    isRTL ? "right-4" : "left-4"
                  }`}
                  size={15}
                />
              </div>
              <button
                onClick={() => handleFilterChange("search", searchQuery)}
                className="rounded-e-md bg-light-primary px-3 py-1.5 text-sm text-white hover:brightness-90"
              >
                {t.search}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltersOpen(true)}
                className="flex items-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                <SlidersHorizontal size={16} />
                {t.moreFilters}
              </button>
              <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
                {t.download}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <DynamicTable
          data={invoiceData}
          columns={getColumns(locale)}
          pagination={true}
          itemsPerPage={5}
          selectable={true}
          minWidth={1000}
          defaultSort={{ key: "title", direction: "asc" }}
          actions={[
            {
              label: t.edit,
              onClick: () => console.log("edited"),
              className:
                "bg-white text-gray-700 hover:text-blue-700 hover:bg-blue-50 ",
              icon: <PencilIcon className="h-4 w-4" />,
            },
            {
              label: t.delete,
              onClick: () => console.log("Deleted"),
              className:
                "bg-white text-gray-700 hover:text-red-700 hover:bg-red-50 ",
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
      <Filters
        filtersData={productFilters}
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        locale={locale}
      />
    </div>
  );
}
