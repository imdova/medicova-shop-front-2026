"use client";
import Link from "next/link";
import { Clipboard, PencilIcon, Plus, TrashIcon } from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import { useState } from "react";
import { LanguageType } from "@/util/translations";
import DynamicFilter from "@/components/UI/filter/DynamicFilter";
import SearchInput from "@/components/Forms/formFields/SearchInput";
import { DynamicFilterItem } from "@/types/filters";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Discount, DiscountStatus } from "@/types/product";
import { dummyDiscounts } from "@/constants/discounts";
import { productFilters } from "@/constants/drawerFilter";

// Translation dictionary
const translations = {
  en: {
    title: "Discounts",
    desc: "Manage discount codes and promotions for your ecommerce store",
    id: "ID",
    detail: "Detail",
    used: "Used",
    startDate: "Start date",
    endDate: "End date",
    store: "Store",
    operations: "Operations",
    searchPlaceholder: "Search discounts...",
    search: "Search",
    moreFilters: "More Filters",
    download: "Download",
    allStatuses: "All Statuses",
    active: "Active",
    expired: "Expired",
    scheduled: "Scheduled",
    reset: "Reset",
    showData: "Show Data",
    unknown: "Unknown",
    delete: "Delete",
    edit: "Edit",
    quickFilters: "Quick Filters",
    addFilter: "Add Filter",
    hideFilters: "Hide Filters",
    showFilters: "Show Filters",
    filters: "Filters",
    create: "Create",
    viewDetails: "View Details",
    noDiscounts: "No discounts available",
    times: "times",
    allStores: "All Stores",
    mainStore: "Main Store",
    electronics: "Electronics Store",
    fashion: "Fashion Store",
    home: "Home Goods Store",
    copy: "Copy",
    fixedCoupon: "Same fee ${value} for all products in order",
    percentageCoupon: "Discount {value}% for all orders",
    shippingCoupon: "Free shipping to all orders when shipping fee ≤ ${value}",
    promoRestriction: "(Coupon code cannot be used with promotion)",
  },
  ar: {
    title: "الخصومات",
    desc: "إدارة رموز الخصومات والعروض الترويجية لمتجرك الإلكتروني",
    id: "المعرف",
    detail: "التفاصيل",
    used: "مستخدم",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    store: "المتجر",
    operations: "العمليات",
    searchPlaceholder: "ابحث في الخصومات...",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    allStatuses: "كل الحالات",
    active: "نشط",
    expired: "منتهي",
    scheduled: "مجدول",
    reset: "إعادة تعيين",
    showData: "عرض البيانات",
    unknown: "غير معروف",
    delete: "حذف",
    edit: "تعديل",
    quickFilters: "الفلاتر السريعة",
    addFilter: "إضافة فلتر",
    hideFilters: "إخفاء الفلاتر",
    showFilters: "عرض الفلاتر",
    filters: "فلاتر",
    create: "إنشاء",
    viewDetails: "عرض التفاصيل",
    noDiscounts: "لا توجد خصومات متاحة",
    times: "مرات",
    allStores: "جميع المتاجر",
    mainStore: "المتجر الرئيسي",
    electronics: "متجر الإلكترونيات",
    fashion: "متجر الأزياء",
    home: "متجر الأدوات المنزلية",
    copy: "نسخ",
    fixedCoupon: "رسوم ثابتة ${value} لجميع المنتجات في الطلب",
    percentageCoupon: "خصم {value}% على جميع الطلبات",
    shippingCoupon: "شحن مجاني لجميع الطلبات إذا كانت رسوم الشحن ≤ ${value}",
    promoRestriction: "(لا يمكن استخدام رمز القسيمة مع العرض الترويجي)",
  },
};

export default function DiscountsListPanel() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === "ar";
  const ITEMS_PER_PAGE = 6;
  const router = useRouter();
  const toggle = () => setIsOpen((prev) => !prev);

  const getColumns = (locale: LanguageType) => [
    {
      key: "id",
      header: translations[locale].id,
      sortable: true,
      render: (item: Discount) => (
        <span className="font-mono text-sm">#{item.id}</span>
      ),
    },
    {
      key: "detail",
      header: translations[locale].detail,
      sortable: false,
      render: (item: Discount) => (
        <div
          className={`relative max-w-md rounded-md p-2 ${
            item.status === "expired" ? "bg-gray-200 opacity-75" : "bg-primary"
          }`}
        >
          {/* Coupon with copy button */}
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`font-medium ${
                item.status === "expired"
                  ? "text-gray-700 line-through"
                  : "text-white"
              }`}
            >
              {item.couponCode}
            </span>
            {item.status === "expired" && (
              <span className="absolute right-3 top-2 -rotate-6 border-y border-destructive p-1 text-xs text-destructive">
                Expired
              </span>
            )}
            {/* Copy button */}
            <button
              onClick={() => navigator.clipboard.writeText(item.couponCode)}
              className={`flex items-center text-xs ${
                item.status === "expired" ? "text-gray-700" : "text-white"
              }`}
            >
              <Clipboard className="h-3 w-3" />
            </button>
          </div>

          {/* Coupon details */}
          <div className="mb-1 text-sm text-gray-600">
            {item.discountType === "fixed" && (
              <span
                className={`font-medium ${
                  item.status === "expired"
                    ? "text-gray-700 line-through"
                    : "text-gray-100"
                }`}
              >
                {translations[locale].fixedCoupon.replace(
                  "${value}",
                  item.value.toFixed(2),
                )}
              </span>
            )}
            {item.discountType === "percentage" && (
              <span
                className={`font-medium ${
                  item.status === "expired"
                    ? "text-gray-700 line-through"
                    : "text-gray-100"
                }`}
              >
                {translations[locale].percentageCoupon.replace(
                  "{value}",
                  item.value.toString(),
                )}
              </span>
            )}
            {item.discountType === "shipping" && (
              <span
                className={`font-medium ${
                  item.status === "expired"
                    ? "text-gray-700 line-through"
                    : "text-gray-100"
                }`}
              >
                {translations[locale].shippingCoupon.replace(
                  "${value}",
                  item.value.toFixed(2),
                )}
              </span>
            )}
          </div>

          {!item.canUseWithPromotion && (
            <div
              className={`text-xs italic ${
                item.status === "expired" ? "text-secondary" : "text-gray-200"
              }`}
            >
              {translations[locale].promoRestriction}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "used",
      header: translations[locale].used,
      sortable: true,
      render: (item: Discount) => (
        <div className="text-center">
          <span className="text-sm font-medium text-gray-700">
            {item.usedCount || 0}
          </span>
          <div className="text-xs text-gray-400">{t.times}</div>
          {item.usageLimit && (
            <div className="text-xs text-gray-400">of {item.usageLimit}</div>
          )}
        </div>
      ),
    },
    {
      key: "startDate",
      header: translations[locale].startDate,
      sortable: true,
      render: (item: Discount) => (
        <span className="text-sm text-gray-600">
          {new Date(item.startDate).toLocaleDateString(
            locale === "en" ? "en-US" : "ar-EG",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            },
          )}
        </span>
      ),
    },
    {
      key: "endDate",
      header: translations[locale].endDate,
      sortable: true,
      render: (item: Discount) => (
        <span className="text-sm text-gray-600">
          {new Date(item.endDate).toLocaleDateString(
            locale === "en" ? "en-US" : "ar-EG",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            },
          )}
        </span>
      ),
    },
    {
      key: "store",
      header: translations[locale].store,
      sortable: true,
      render: (item: Discount) => {
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize`}
          >
            {item.store}
          </span>
        );
      },
    },
  ];

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "active", name: { en: "Active", ar: "نشط" } },
        { id: "expired", name: { en: "Expired", ar: "منتهي" } },
        { id: "scheduled", name: { en: "Scheduled", ar: "مجدول" } },
      ],
      visible: true,
    },
    {
      id: "store",
      label: { en: "Store", ar: "المتجر" },
      type: "dropdown",
      options: [
        { id: "main", name: { en: "Main Store", ar: "المتجر الرئيسي" } },
        {
          id: "electronics",
          name: { en: "Electronics", ar: "متجر الإلكترونيات" },
        },
        { id: "fashion", name: { en: "Fashion", ar: "متجر الأزياء" } },
        { id: "home", name: { en: "Home Goods", ar: "متجر الأدوات المنزلية" } },
      ],
      visible: true,
    },
    {
      id: "dateRange",
      label: { en: "Date Range", ar: "نطاق التاريخ" },
      type: "date-range",
      visible: true,
    },
  ];

  // Count discounts by status for the summary cards
  const statusCounts = dummyDiscounts.reduce(
    (acc: Record<DiscountStatus, number>, discount) => {
      acc[discount.status] += 1;
      return acc;
    },
    { active: 0, expired: 0, scheduled: 0 },
  );

  return (
    <div className="relative space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h2 className="mb-1 text-2xl font-bold">{t.title}</h2>
        <p className="max-w-lg text-sm text-gray-600">{t.desc}</p>
      </div>

      <DynamicFilter
        t={t}
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
        locale={language}
        isRTL={isRTL}
        drawerFilters={productFilters}
        showViewToggle={false}
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
        quickFiltersGridCols="grid-cols-1 md:grid-cols-3"
      />

      {/* Discounts Table */}
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
          <Link
            href={`/admin/discounts/create`}
            className="flex items-center justify-center gap-1 rounded-md border border-gray-200 bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-auto"
          >
            <Plus size={15} /> {t.create}
          </Link>
        </div>

        <DynamicTable
          data={dummyDiscounts}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "id", direction: "asc" }}
          solidActions={[
            {
              label: "Edit",
              onClick: (item) =>
                router.push(`/admin/discounts/edit/${item.id}`),
              icon: <PencilIcon className="h-3 w-3" />,
              color: "#2563eb",
            },
            {
              label: "Delete",
              onClick: (item) => console.log(`Delete discount: ${item.id}`),
              color: "#dc2626",
              icon: <TrashIcon className="h-3 w-3" />,
            },
          ]}
          locale={language}
        />
      </div>
    </div>
  );
}
