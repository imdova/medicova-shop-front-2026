"use client";
import Link from "next/link";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CornerDownRight,
} from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import { useState } from "react";
import { productFilters } from "@/constants/drawerFilter";
import { LanguageType } from "@/util/translations";
import DynamicFilter from "@/components/UI/filter/DynamicFilter";
import SearchInput from "@/components/Forms/formFields/SearchInput";
import { DynamicFilterItem } from "@/types/filters";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { mockProductInventory } from "@/constants/inventory";
import { ProductInventory, ProductVariant } from "@/types/product";
import Image from "next/image";

type EditFormState = {
  [id: number]: {
    storefrontManagement: string;
    quantity: number;
  };
};

// Flatten data for table with expanded state
const flattenInventoryData = (
  data: ProductInventory[],
  expandedItems: Set<number>,
) => {
  const flattened: (ProductInventory | ProductVariant)[] = [];

  data.forEach((item) => {
    flattened.push(item);

    if (item.hasVariants && expandedItems.has(item.id)) {
      item.variants?.forEach((variant) => {
        flattened.push(variant);
      });
    }
  });

  return flattened;
};

// Translation dictionary for Product Inventory
const translations = {
  en: {
    title: "Product Inventory",
    description:
      "Manage stock levels, track quantities, and control availability for each product and its variants. ",
    searchPlaceholder: "Search...",
    image: "IMAGE",
    products: "PRODUCTS",
    storefrontManagement: "STOREFRONT MANAGEMENT",
    quantity: "QUANTITY",
    operations: "Operations",
    sku: "SKU",
    search: "Search",
    moreFilters: "More Filters",
    download: "Download",
    filters: "Filters",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    yes: "Yes",
    no: "No",
    outOfStock: "Out of Stock",
    lowStock: "Low Stock",
    inStock: "In Stock",
    manageInventory: "Manage Inventory",
    in_stock: "In Stock",
    out_stock: "Out of Stock",
    noindex: "Select storefront management",
    name: "Enter quantity",
    save: "Save",
    cancel: "Cancel",
    reset: "Reset",
    showData: "Show Data",
  },
  ar: {
    title: "مخزون المنتج",
    description:
      "قم بإدارة مستويات المخزون، وتتبع الكميات، والتحكم في توفر كل منتج ونسخه المختلفة.",
    searchPlaceholder: "بحث...",
    image: "الصورة",
    products: "المنتجات",
    storefrontManagement: "إدارة المتجر",
    quantity: "الكمية",
    operations: "العمليات",
    sku: "رمز المنتج",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    filters: "فلاتر",
    create: "انشاء",
    edit: "تعديل",
    delete: "حذف",
    yes: "نعم",
    no: "لا",
    outOfStock: "غير متوفر",
    lowStock: "منخفض المخزون",
    inStock: "متوفر",
    manageInventory: "إدارة المخزون",
    in_stock: "متوفر",
    out_stock: "غير متوفر",
    noindex: "اختر إدارة المتجر",
    name: "أدخل الكمية",
    save: "حفظ",
    cancel: "إلغاء",
    reset: "إعادة تعيين",
    showData: "عرض البيانات",
  },
};

export default function ProductInventoryListPanel() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [editForm, setEditForm] = useState<EditFormState>({});
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar";
  const ITEMS_PER_PAGE = 10;

  const toggle = () => setIsOpen((prev) => !prev);

  const toggleExpand = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getColumns = (locale: LanguageType) => [
    {
      key: "Products",
      header: translations[locale].products,
      sortable: false,
      render: (item: ProductInventory) => (
        <div className="flex items-center gap-2">
          {item.hasVariants && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpand(item.id)}
              className="h-6 w-6 p-0"
            >
              {expandedItems.has(item.id) ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          )}
          {item.isVariant && (
            <span className="ml-6">
              <CornerDownRight className="h-4 w-4" />
            </span>
          )}
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
            {item.image ? (
              <Image
                width={100}
                height={100}
                src={item.image}
                alt={item.name}
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <span className="text-xs text-gray-400">IMG</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Link
              className="block font-medium text-primary hover:underline"
              href={`/admin/products/edit/${item.id}`}
            >
              {item.name}
            </Link>
            <div className="mt-1 text-xs text-gray-500">
              {translations[locale].sku}: {item.sku}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "storefrontManagement",
      header: translations[locale].storefrontManagement,
      sortable: true,
      render: (item: ProductInventory) => (
        <Select
          onValueChange={(value) =>
            setEditForm((prev) => ({
              ...prev,
              [item.id]: {
                ...(prev[item.id] || item),
                storefrontManagement: value,
              },
            }))
          }
          defaultValue={
            editForm[item.id]?.storefrontManagement ?? item.storefrontManagement
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t.noindex} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="out_stock">{t.out_stock}</SelectItem>
            <SelectItem value="in_stock">{t.inStock}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "quantity",
      header: translations[locale].quantity,
      sortable: true,
      render: (item: ProductInventory) => {
        const isOutStock =
          (editForm[item.id]?.storefrontManagement ??
            item.storefrontManagement) === "out_stock";

        return (
          <div className="flex items-center gap-2">
            <Input
              placeholder={t.name}
              value={editForm[item.id]?.quantity ?? item.quantity}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  [item.id]: {
                    ...(prev[item.id] || {
                      storefrontManagement: item.storefrontManagement,
                      quantity: item.quantity,
                    }),
                    quantity: parseInt(e.target.value) || 0,
                  },
                }))
              }
              type="number"
              className="w-20"
              disabled={isOutStock} // 🔒 disable if out of stock
            />
          </div>
        );
      },
    },
  ];

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "stockStatus",
      label: { en: "Stock Status", ar: "حالة المخزون" },
      type: "dropdown",
      options: [
        { id: "inStock", name: { en: "In Stock", ar: "متوفر" } },
        { id: "lowStock", name: { en: "Low Stock", ar: "منخفض المخزون" } },
        { id: "outOfStock", name: { en: "Out of Stock", ar: "غير متوفر" } },
      ],
      visible: true,
    },
    {
      id: "storefrontManagement",
      label: { en: "Storefront Management", ar: "إدارة المتجر" },
      type: "dropdown",
      options: [
        { id: "true", name: { en: "Yes", ar: "نعم" } },
        { id: "false", name: { en: "No", ar: "لا" } },
      ],
      visible: true,
    },
    {
      id: "quantityRange",
      label: { en: "Quantity Range", ar: "نطاق الكمية" },
      type: "number-range",
      visible: true,
    },
  ];

  // Count inventory by stock status
  const stockCounts = mockProductInventory.reduce(
    (acc: { inStock: number; lowStock: number; outOfStock: number }, item) => {
      // Count main item
      if (item.quantity === 0) {
        acc.outOfStock += 1;
      } else if (item.quantity < 10) {
        acc.lowStock += 1;
      } else {
        acc.inStock += 1;
      }

      // Count variants too (variants are ProductVariant, not ProductInventory)
      item.variants?.forEach((variant) => {
        if (variant.quantity === 0) {
          acc.outOfStock += 1;
        } else if (variant.quantity < 10) {
          acc.lowStock += 1;
        } else {
          acc.inStock += 1;
        }
      });

      return acc;
    },
    { inStock: 0, lowStock: 0, outOfStock: 0 },
  );

  const flattenedData = flattenInventoryData(
    mockProductInventory,
    expandedItems,
  );

  return (
    <div className="relative space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h2 className="mb-1 text-2xl font-bold">{t.title}</h2>
        <p className="max-w-lg text-sm text-gray-600">{t.description}</p>
      </div>
      <DynamicFilter
        t={t}
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
        locale={language}
        isRTL={isRTL}
        drawerFilters={productFilters}
        showViewToggle={false}
        statusCounts={stockCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
        quickFiltersGridCols="grid-cols-1 md:grid-cols-3"
      />

      {/* Product Inventory Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={toggle}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm"
          >
            {t.filters}
          </button>
          <SearchInput locale={language} />
        </div>
        <DynamicTable
          data={flattenedData}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "products", direction: "asc" }}
          locale={language}
        />
      </div>
    </div>
  );
}
