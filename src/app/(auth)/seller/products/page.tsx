"use client";
import Link from "next/link";
import { Filter, PencilIcon, Plus, Search, TrashIcon } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import DynamicTable from "@/components/UI/tables/DTable";
import Dropdown from "@/components/UI/DropDownMenu";
import { Filters } from "@/components/UI/filter/FilterDrawer";
import { useState } from "react";
import { products } from "@/constants/products";
import { Product } from "@/types/product";
import { filtersData } from "@/constants/drawerFilter";
import { useLanguage } from "@/contexts/LanguageContext";

const statusOptions = [
  { id: "all", name: { en: "All Statuses", ar: "كل الحالات" } },
  { id: "active", name: { en: "Active", ar: "نشط" } },
  { id: "out_of_stock", name: { en: "Out of Stock", ar: "غير متوفر" } },
];

const stockOptions = [
  { id: "all", name: { en: "All Stock", ar: "كل المخزون" } },
  { id: "in_stock", name: { en: "In Stock", ar: "متوفر في المخزون" } },
  { id: "out_of_stock", name: { en: "Out of Stock", ar: "غير متوفر" } },
];

const offerOptions = [
  { id: "all", name: { en: "All Products", ar: "كل المنتجات" } },
  { id: "yes", name: { en: "On Offer", ar: "ضمن العروض" } },
  { id: "no", name: { en: "Not on Offer", ar: "ليست ضمن العروض" } },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const columns = (language: "en" | "ar") => [
    {
      key: "id",
      header: { en: "Product ID", ar: "معرّف المنتج" }[language],
      sortable: true,
    },
    {
      key: "title",
      header: { en: "Title", ar: "العنوان" }[language],
      sortable: true,
      render: (item: Product) => (
        <Link className="hover:underline" href={`/product-details/${item.id}`}>
          {item.title[language]}
        </Link>
      ),
    },
    {
      key: "price",
      header: { en: "Price", ar: "السعر" }[language],
      sortable: true,
      render: (item: Product) => (
        <div className="flex items-center">
          ${item.price.toFixed(2)}
          {item.sale && (
            <span className="ml-2 rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
              {language === "ar" ? "عرض" : "Offer"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      header: { en: "Stock", ar: "المخزون" }[language],
      sortable: true,
      render: (item: Product) => {
        const inStock = (item.stock ?? 0) > 0;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              inStock
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {inStock
              ? item.stock
              : language === "ar"
                ? "غير متوفر"
                : "Out of stock"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: { en: "Status", ar: "الحالة" }[language],
      sortable: true,
      render: (item: Product) => {
        const status = item.status?.[language];
        const isActive = status === "Active" || status === "نشط";
        const statusColor = isActive
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-600";

        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "category",
      header: { en: "Category", ar: "الفئة" }[language],
      sortable: true,
      render: (item: Product) => <span>{item.category?.title[language]}</span>,
    },
  ];

  const statusFilter = searchParams.get("status") || "all";
  const stockFilter = searchParams.get("stock") || "all";
  const offerFilter = searchParams.get("offer") || "all";
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const filteredProducts = products.filter((product) => {
    if (statusFilter !== "all" && product.status?.en !== statusFilter)
      return false;
    if (stockFilter === "in_stock" && (product.stock ?? 0) <= 0) return false;
    if (stockFilter === "out_of_stock" && (product.stock ?? 0) > 0)
      return false;
    if (offerFilter === "yes" && !product.sale) return false;
    if (offerFilter === "no" && product.sale) return false;
    if (
      searchQuery &&
      !product.title[language].toLowerCase().includes(searchQuery)
    )
      return false;

    return true;
  });

  const handleEditProduct = (slug: string) => {
    router.push(`/seller/products/edit-product/${slug}`);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(filterType, value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {language === "ar" ? "منتجاتك" : "Your Products"}
        </h2>
        <button className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          <Link
            href="/seller/create-product"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {language === "ar" ? "إضافة منتج" : "Add Product"}
          </Link>
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        {/* Filter Controls */}
        <div className="flex flex-col items-end gap-4 pb-4 xl:flex-row">
          <div className="flex w-full gap-2 xl:w-fit xl:min-w-[350px]">
            <div className="relative w-full">
              <input
                type="text"
                defaultValue={searchQuery}
                onChange={(e) =>
                  handleFilterChange("search", e.target.value.trim())
                }
                placeholder={
                  language === "ar" ? "ابحث عن منتج" : "Search for product"
                }
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 pl-10 outline-none placeholder:text-sm"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                size={15}
              />
            </div>

            <div className="block lg:hidden">
              <button
                onClick={() => setFiltersOpen(true)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-500"
              >
                <Filter size={16} />
              </button>

              <Filters
                filtersData={filtersData}
                isOpen={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                locale={language}
              />
            </div>
          </div>

          <div className="flex w-full flex-1 items-end gap-2">
            <div className="grid w-full grid-cols-1 gap-2 lg:grid-cols-3">
              <div className="w-full min-w-[120px]">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  {language === "ar" ? "الحالة" : "Status"}
                </label>
                <Dropdown
                  options={statusOptions}
                  selected={statusFilter}
                  onSelect={(value) =>
                    handleFilterChange("status", value.toString())
                  }
                  locale={language}
                />
              </div>
              <div className="w-full min-w-[120px]">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  {language === "ar" ? "المخزون" : "Stock"}
                </label>
                <Dropdown
                  options={stockOptions}
                  selected={stockFilter}
                  onSelect={(value) =>
                    handleFilterChange("stock", value.toString())
                  }
                  locale={language}
                />
              </div>
              <div className="w-full min-w-[120px]">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  {language === "ar" ? "ضمن العروض" : "On Offer"}
                </label>
                <Dropdown
                  options={offerOptions}
                  selected={offerFilter}
                  onSelect={(value) =>
                    handleFilterChange("offer", value.toString())
                  }
                  locale={language}
                />
              </div>
            </div>
            <div className="hidden lg:block">
              <button
                onClick={() => setFiltersOpen(true)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-500"
              >
                <Filter size={16} />
              </button>

              <Filters
                filtersData={filtersData}
                isOpen={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                locale={language}
              />
            </div>
          </div>
        </div>

        <DynamicTable
          data={filteredProducts}
          columns={columns(language)}
          pagination={true}
          itemsPerPage={5}
          selectable={true}
          defaultSort={{ key: "name", direction: "asc" }}
          locale={language}
          actions={[
            {
              label: { en: "Edit", ar: "تعديل" }[language],
              onClick: (product: Product) => handleEditProduct(product.id),
              className:
                "bg-white text-gray-700 hover:text-blue-700 hover:bg-blue-50",
              icon: <PencilIcon className="h-4 w-4" />,
            },
            {
              label: { en: "Delete", ar: "حذف" }[language],
              onClick: (product: Product) => console.log("Deleted", product.id),
              className:
                "bg-white text-gray-700 hover:text-red-700 hover:bg-red-50",
              icon: <TrashIcon className="h-4 w-4" />,
            },
          ]}
        />
      </div>
    </div>
  );
}
