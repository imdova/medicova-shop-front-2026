"use client";
import { PencilIcon, EyeIcon, Check, X } from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import { useState } from "react";
import { productFilters } from "@/constants/drawerFilter";
import { LanguageType } from "@/util/translations";
import DynamicFilter from "@/components/UI/filter/DynamicFilter";
import SearchInput from "@/components/Forms/formFields/SearchInput";
import { DynamicFilterItem } from "@/types/filters";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";

// Define Withdrawal type
export type Withdrawal = {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  paymentMethod: string;
  status: "pending" | "approved" | "rejected" | "processing";
  createdAt: string;
  processedAt?: string;
  accountDetails: string;
  transactionId?: string;
};

// Dummy withdrawals data
const dummyWithdrawals: Withdrawal[] = [
  {
    id: "WD001",
    userId: "USR1001",
    userName: "Ahmed Mohamed",
    amount: 1500,
    paymentMethod: "Bank Transfer",
    status: "pending",
    createdAt: "2024-01-15T10:30:00Z",
    accountDetails: "IBAN: AE070331234567890123456",
  },
  {
    id: "WD002",
    userId: "USR1002",
    userName: "Sarah Johnson",
    amount: 2500,
    paymentMethod: "PayPal",
    status: "approved",
    createdAt: "2024-01-14T14:20:00Z",
    processedAt: "2024-01-15T09:15:00Z",
    accountDetails: "sarah.j@example.com",
    transactionId: "TXN789012",
  },
  {
    id: "WD003",
    userId: "USR1003",
    userName: "Mohammed Ali",
    amount: 3200,
    paymentMethod: "Bank Transfer",
    status: "processing",
    createdAt: "2024-01-13T16:45:00Z",
    accountDetails: "IBAN: AE070331987654321098765",
  },
  {
    id: "WD004",
    userId: "USR1004",
    userName: "Emma Wilson",
    amount: 1800,
    paymentMethod: "Stripe",
    status: "rejected",
    createdAt: "2024-01-12T11:20:00Z",
    processedAt: "2024-01-13T10:30:00Z",
    accountDetails: "acc_1Example123",
    transactionId: "pi_3Example456",
  },
  {
    id: "WD005",
    userId: "USR1005",
    userName: "Carlos Rodriguez",
    amount: 2750,
    paymentMethod: "PayPal",
    status: "approved",
    createdAt: "2024-01-11T13:10:00Z",
    processedAt: "2024-01-12T08:45:00Z",
    accountDetails: "carlos.r@example.com",
    transactionId: "TXN345678",
  },
  {
    id: "WD006",
    userId: "USR1006",
    userName: "Fatima Hassan",
    amount: 4200,
    paymentMethod: "Bank Transfer",
    status: "pending",
    createdAt: "2024-01-10T09:30:00Z",
    accountDetails: "IBAN: AE070331456789012345678",
  },
];

// Translation dictionary
const translations = {
  en: {
    title: "Withdrawal Requests",
    description: "Manage and process all withdrawal requests from users",
    id: "Withdrawal ID",
    userId: "User ID",
    userName: "User Name",
    amount: "Amount",
    paymentMethod: "Payment Method",
    status: "Status",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    processing: "Processing",
    createdAt: "Request Date",
    processedAt: "Processed Date",
    operations: "Operations",
    searchPlaceholder: "Search withdrawals...",
    search: "Search",
    moreFilters: "More Filters",
    download: "Download",
    allStatuses: "All Statuses",
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
    create: "Create Withdrawal",
    viewWithdrawal: "View Withdrawal",
    accountDetails: "Account Details",
    transactionId: "Transaction ID",
    total: "Total",
    pendingWithdrawals: "Pending Withdrawals",
    approvedWithdrawals: "Approved Withdrawals",
    totalAmount: "Total Amount",
    approve: "Approve",
    reject: "Reject",
    process: "Process",
    revenueCurrency: "$",
  },
  ar: {
    title: "طلبات السحب",
    description: "إدارة ومعالجة جميع طلبات السحب من المستخدمين",
    id: "معرف السحب",
    userId: "معرف المستخدم",
    userName: "اسم المستخدم",
    amount: "المبلغ",
    paymentMethod: "طريقة الدفع",
    status: "الحالة",
    pending: "معلق",
    approved: "مقبول",
    rejected: "مرفوض",
    processing: "قيد المعالجة",
    createdAt: "تاريخ الطلب",
    processedAt: "تاريخ المعالجة",
    operations: "العمليات",
    searchPlaceholder: "بحث في طلبات السحب...",
    search: "بحث",
    moreFilters: "المزيد من الفلاتر",
    download: "تحميل",
    allStatuses: "كل الحالات",
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
    create: "إنشاء سحب",
    viewWithdrawal: "عرض السحب",
    accountDetails: "تفاصيل الحساب",
    transactionId: "معرف المعاملة",
    total: "الإجمالي",
    pendingWithdrawals: "طلبات السحب المعلقة",
    approvedWithdrawals: "طلبات السحب المقبولة",
    totalAmount: "المبلغ الإجمالي",
    approve: "قبول",
    reject: "رفض",
    process: "معالجة",
    revenueCurrency: "د.إ",
  },
};

const getColumns = (locale: LanguageType) => [
  {
    key: "id",
    header: translations[locale].id,
    sortable: true,
    render: (item: Withdrawal) => (
      <span className="font-mono text-sm font-medium">#{item.id}</span>
    ),
  },
  {
    key: "userName",
    header: translations[locale].userName,
    sortable: true,
    render: (item: Withdrawal) => (
      <div>
        <div className="font-medium text-gray-900">{item.userName}</div>
        <div className="text-xs text-gray-500">#{item.userId}</div>
      </div>
    ),
  },
  {
    key: "amount",
    header: translations[locale].amount,
    sortable: true,
    render: (item: Withdrawal) => (
      <span className="font-medium text-green-600">
        {translations[locale].revenueCurrency}
        {item.amount.toLocaleString()}
      </span>
    ),
  },
  {
    key: "paymentMethod",
    header: translations[locale].paymentMethod,
    sortable: true,
    render: (item: Withdrawal) => (
      <span className="text-sm text-gray-700">{item.paymentMethod}</span>
    ),
  },
  {
    key: "status",
    header: translations[locale].status,
    sortable: true,
    render: (item: Withdrawal) => {
      const statusColors = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        processing: "bg-blue-100 text-blue-800",
      };

      return (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[item.status]}`}
        >
          {translations[locale][item.status]}
        </span>
      );
    },
  },
  {
    key: "accountDetails",
    header: translations[locale].accountDetails,
    sortable: false,
    render: (item: Withdrawal) => (
      <span className="text-xs text-gray-600">{item.accountDetails}</span>
    ),
  },
  {
    key: "createdAt",
    header: translations[locale].createdAt,
    sortable: true,
    render: (item: Withdrawal) => {
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

export default function WithdrawalsListPanel() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [withdrawals, setWithdrawals] =
    useState<Withdrawal[]>(dummyWithdrawals);
  const { language } = useLanguage();
  const router = useRouter();
  const t = translations[language];
  const isRTL = language === "ar";
  const ITEMS_PER_PAGE = 6;

  const toggle = () => setIsOpen((prev) => !prev);

  const handleStatusUpdate = (
    withdrawalId: string,
    newStatus: Withdrawal["status"],
  ) => {
    setWithdrawals((prevWithdrawals) =>
      prevWithdrawals.map((withdrawal) =>
        withdrawal.id === withdrawalId
          ? {
              ...withdrawal,
              status: newStatus,
              processedAt:
                newStatus !== "pending"
                  ? new Date().toISOString()
                  : withdrawal.processedAt,
            }
          : withdrawal,
      ),
    );
    console.log(`Withdrawal ${withdrawalId} status changed to: ${newStatus}`);
  };

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "pending", name: { en: "Pending", ar: "معلق" } },
        { id: "approved", name: { en: "Approved", ar: "مقبول" } },
        { id: "rejected", name: { en: "Rejected", ar: "مرفوض" } },
        { id: "processing", name: { en: "Processing", ar: "قيد المعالجة" } },
      ],
      visible: true,
    },
    {
      id: "paymentMethod",
      label: { en: "Payment Method", ar: "طريقة الدفع" },
      type: "dropdown",
      options: [
        {
          id: "bank_transfer",
          name: { en: "Bank Transfer", ar: "تحويل بنكي" },
        },
        { id: "paypal", name: { en: "PayPal", ar: "باي بال" } },
        { id: "stripe", name: { en: "Stripe", ar: "سترايب" } },
      ],
      visible: true,
    },
    {
      id: "dateRange",
      label: { en: "Request Date Range", ar: "نطاق تاريخ الطلب" },
      type: "date-range",
      visible: true,
    },
    {
      id: "amount",
      label: { en: "Amount Range", ar: "نطاق المبلغ" },
      type: "number-range",
      visible: true,
    },
  ];

  // Count withdrawals by status for the summary cards
  const statusCounts = withdrawals.reduce(
    (
      acc: {
        pending: number;
        approved: number;
        rejected: number;
        processing: number;
      },
      withdrawal,
    ) => {
      acc[withdrawal.status] += 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0, processing: 0 },
  );

  // Calculate total metrics
  const totalMetrics = {
    totalWithdrawals: withdrawals.length,
    totalAmount: withdrawals.reduce(
      (sum, withdrawal) => sum + withdrawal.amount,
      0,
    ),
    pendingAmount: withdrawals
      .filter((w) => w.status === "pending")
      .reduce((sum, withdrawal) => sum + withdrawal.amount, 0),
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
                {totalMetrics.totalWithdrawals}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="rounded-md bg-yellow-100 p-2">
                <div className="h-4 w-4 rounded bg-yellow-600"></div>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">
                {t.pendingWithdrawals}
              </p>
              <p className="text-xl font-semibold text-yellow-600">
                {statusCounts.pending}
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
                {t.approvedWithdrawals}
              </p>
              <p className="text-xl font-semibold text-green-600">
                {statusCounts.approved}
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
              <p className="text-sm font-medium text-gray-600">
                {t.totalAmount}
              </p>
              <p className="text-xl font-semibold text-purple-600">
                {translations[language].revenueCurrency}
                {totalMetrics.totalAmount.toLocaleString()}
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

      {/* Withdrawals Table */}
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
        </div>
        <DynamicTable
          data={withdrawals}
          columns={getColumns(language)}
          pagination={true}
          itemsPerPage={ITEMS_PER_PAGE}
          selectable={true}
          defaultSort={{ key: "createdAt", direction: "desc" }}
          solidActions={[
            {
              label: "Approve",
              onClick: (item) => handleStatusUpdate(item.id, "approved"),
              icon: <Check className="h-3 w-3" />,
              color: "#059669",
            },
            {
              label: "Reject",
              onClick: (item) => handleStatusUpdate(item.id, "rejected"),
              icon: <X className="h-3 w-3" />,
              color: "#dc2626",
            },
            {
              label: "View",
              onClick: (item) =>
                router.push(`/admin/financial/withdrawals/view/${item.id}`),
              icon: <EyeIcon className="h-3 w-3" />,
              color: "#2563eb",
            },
            {
              label: "Edit",
              onClick: (item) =>
                router.push(`/admin/financial/withdrawals/edit/${item.id}`),
              icon: <PencilIcon className="h-3 w-3" />,
              color: "#f59e0b",
            },
          ]}
          locale={language}
        />
      </div>
    </div>
  );
}
