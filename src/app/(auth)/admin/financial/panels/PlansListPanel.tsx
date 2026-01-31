"use client";
import Link from "next/link";
import { PencilIcon, Plus, TrashIcon, EyeIcon } from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import { useState } from "react";
import { productFilters } from "@/constants/drawerFilter";
import { LanguageType } from "@/util/translations";
import DynamicFilter from "@/components/UI/filter/DynamicFilter";
import SearchInput from "@/components/Forms/formFields/SearchInput";
import { DynamicFilterItem } from "@/types/filters";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/UI/switch"; // Your switch component
import { Plan } from "@/types";
import { dummyPlans } from "@/constants/plans";

// Translation dictionary
const translations = {
  en: {
    title: "Subscription Plans",
    description:
      "Manage and monitor all subscription plans and their performance",
    id: "Plan ID",
    name: "Plan Name",
    totalSubscriptions: "Total Subscriptions",
    customers: "Customers",
    revenue: "Revenue",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    viewPlan: "View Plan",
    createdAt: "Created At",
    operations: "Operations",
    searchPlaceholder: "Search plans...",
    search: "Search",
    moreFilters: "More Filters",
    download: "Download",
    allStatuses: "All Statuses",
    pending: "Pending",
    draft: "Draft",
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
    create: "Create Plan",
    toggleStatus: "Toggle Status",
    revenueCurrency: "$",
    total: "Total",
    activePlans: "Active Plans",
    inactivePlans: "Inactive Plans",
  },
  ar: {
    title: "خطط الاشتراك",
    description: "إدارة ومراقبة جميع خطط الاشتراك وأدائها",
    id: "معرف الخطة",
    name: "اسم الخطة",
    totalSubscriptions: "إجمالي الاشتراكات",
    customers: "العملاء",
    revenue: "الإيرادات",
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    viewPlan: "عرض الخطة",
    createdAt: "تاريخ الإنشاء",
    operations: "العمليات",
    searchPlaceholder: "بحث في الخطط...",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    allStatuses: "كل الحالات",
    pending: "معلق",
    draft: "مسودة",
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
    create: "إنشاء خطة",
    toggleStatus: "تبديل الحالة",
    revenueCurrency: "د.إ",
    total: "الإجمالي",
    activePlans: "الخطط النشطة",
    inactivePlans: "الخطط غير النشطة",
  },
};

const getColumns = (
  locale: LanguageType,
  onStatusToggle: (planId: string, newStatus: boolean) => void,
) => [
  {
    key: "id",
    header: translations[locale].id,
    sortable: true,
    render: (item: Plan) => (
      <span className="font-mono text-sm font-medium">#{item.id}</span>
    ),
  },
  {
    key: "name",
    header: translations[locale].name,
    sortable: true,
    render: (item: Plan) => (
      <Link
        className="font-medium text-primary hover:underline"
        href={`/admin/financial/edit-plan/${item.id}`}
      >
        {item.name[locale]}
      </Link>
    ),
  },
  {
    key: "totalSubscriptions",
    header: translations[locale].totalSubscriptions,
    sortable: true,
    render: (item: Plan) => (
      <span className="font-medium text-gray-900">
        {item.totalSubscriptions.toLocaleString()}
      </span>
    ),
  },
  {
    key: "customers",
    header: translations[locale].customers,
    sortable: true,
    render: (item: Plan) => (
      <span className="text-gray-700">{item.customers.toLocaleString()}</span>
    ),
  },
  {
    key: "revenue",
    header: translations[locale].revenue,
    sortable: true,
    render: (item: Plan) => (
      <span className="font-medium text-green-600">
        {translations[locale].revenueCurrency}
        {item.revenue.toLocaleString()}
      </span>
    ),
  },
  {
    key: "status",
    header: translations[locale].status,
    sortable: true,
    render: (item: Plan) => {
      const handleToggle = (checked: boolean) => {
        onStatusToggle(item.id, checked);
      };

      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={item.status}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
          />
          <span
            className={`text-sm font-medium ${
              item.status ? "text-green-700" : "text-gray-500"
            }`}
          >
            {item.status
              ? translations[locale].active
              : translations[locale].inactive}
          </span>
        </div>
      );
    },
  },
  {
    key: "createdAt",
    header: translations[locale].createdAt,
    sortable: true,
    render: (item: Plan) => {
      const date = new Date(item.createdAt);
      return (
        <span className="text-sm text-gray-600">
          {date.toLocaleDateString(locale === "en" ? "en-US" : "ar-EG", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
];

export default function PlansListPanel() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>(dummyPlans);
  const { language } = useLanguage();
  const router = useRouter();
  const t = translations[language];
  const isRTL = language === "ar";
  const ITEMS_PER_PAGE = 6;

  const toggle = () => setIsOpen((prev) => !prev);

  const handleStatusToggle = (planId: string, newStatus: boolean) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === planId ? { ...plan, status: newStatus } : plan,
      ),
    );
    // Here you would typically make an API call to update the status in the backend
    console.log(`Plan ${planId} status changed to: ${newStatus}`);
  };

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "active", name: { en: "Active", ar: "نشط" } },
        { id: "inactive", name: { en: "Inactive", ar: "غير نشط" } },
      ],
      visible: true,
    },
    {
      id: "dateRange",
      label: { en: "Date Range", ar: "نطاق التاريخ" },
      type: "date-range",
      visible: true,
    },
    {
      id: "revenue",
      label: { en: "Revenue Range", ar: "نطاق الإيرادات" },
      type: "number-range",
      visible: true,
    },
  ];

  // Count plans by status for the summary cards
  const statusCounts = plans.reduce(
    (acc: { active: number; inactive: number }, plan) => {
      if (plan.status) {
        acc.active += 1;
      } else {
        acc.inactive += 1;
      }
      return acc;
    },
    { active: 0, inactive: 0 },
  );

  // Calculate total metrics
  const totalMetrics = {
    subscriptions: plans.reduce(
      (sum, plan) => sum + plan.totalSubscriptions,
      0,
    ),
    customers: plans.reduce((sum, plan) => sum + plan.customers, 0),
    revenue: plans.reduce((sum, plan) => sum + plan.revenue, 0),
  };

  return (
    <div className="relative space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div>
        <h2 className="mb-1 text-2xl font-bold">{t.title}</h2>
        <p className="max-w-lg text-sm text-gray-600">{t.description}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-blue-100 p-2">
                <div className="h-4 w-4 rounded bg-blue-600"></div>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">{t.total}</p>
              <p className="text-xl font-semibold text-gray-900">
                {plans.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-green-100 p-2">
                <div className="h-4 w-4 rounded bg-green-600"></div>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">
                {t.activePlans}
              </p>
              <p className="text-xl font-semibold text-green-600">
                {statusCounts.active}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-red-100 p-2">
                <div className="h-4 w-4 rounded bg-red-600"></div>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">
                {t.inactivePlans}
              </p>
              <p className="text-xl font-semibold text-red-600">
                {statusCounts.inactive}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-purple-100 p-2">
                <div className="h-4 w-4 rounded bg-purple-600"></div>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">{t.revenue}</p>
              <p className="text-xl font-semibold text-purple-600">
                {translations[language].revenueCurrency}
                {totalMetrics.revenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
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
        quickFiltersGridCols="grid-cols-1 md:grid-cols-2"
      />

      {/* Plans Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={toggle}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
          >
            {t.filters}
          </button>
          <SearchInput locale={language} />
          <Link
            href={`/admin/financial/create-plan`}
            className="hover:bg-primary/90 flex items-center justify-center gap-1 rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-auto"
          >
            <Plus size={15} /> {t.create}
          </Link>
        </div>
        <DynamicTable
          data={plans}
          columns={getColumns(language, handleStatusToggle)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "name", direction: "asc" }}
          solidActions={[
            {
              label: "View",
              onClick: (item) => router.push(`/admin/plans/view/${item.id}`),
              icon: <EyeIcon className="h-3 w-3" />,
              color: "#2563eb",
            },
            {
              label: "Edit",
              onClick: (item) => router.push(`/admin/plans/edit/${item.id}`),
              icon: <PencilIcon className="h-3 w-3" />,
              color: "#059669",
            },
            {
              label: "Delete",
              onClick: (item) => {
                if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                  setPlans((prev) =>
                    prev.filter((plan) => plan.id !== item.id),
                  );
                }
              },
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
