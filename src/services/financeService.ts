import { apiClient } from "@/lib/apiClient";

export interface FinanceSummary {
  grossVolume: number;
  platformFees: number;
  netEarnings: number;
  pendingPayoutEstimate: number;
  feePercentApplied: number;
}

export interface AdminFinanceSummary {
  totalGrossVolume: number;
  totalPlatformCommission: number;
  netRevenue: number;
  pendingPayouts: number;
  refundVolume: number;
}

export interface AdminTransaction {
  _id: string;
  orderId: string;
  orderNumber: string;
  sellerId: {
    _id: string;
    brandName: string;
    firstName: string;
    lastName: string;
  };
  totalAmount: number;
  platformCommission: number;
  netPayout: number;
  status: "completed" | "processing" | "refunded";
  createdAt: string;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
}

export interface CategorySplit {
  categoryName: string;
  revenue: number;
  percentage: number;
}

export interface AdminWithdrawal {
  _id: string;
  sellerId: {
    _id: string;
    brandName: string;
    firstName: string;
    lastName: string;
  };
  amount: number;
  status: "pending" | "approved" | "rejected";
  method: "bank_transfer" | "paypal" | "instapay";
  details: any;
  createdAt: string;
}

export interface AdminWithdrawalStats {
  totalRequested: number;
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
}

export async function getFinanceSummary(token?: string): Promise<FinanceSummary | null> {
  try {
    const res = await apiClient<any>({
      endpoint: "/seller/finance/summary",
      method: "GET",
      token,
    });
    return res.data || res;
  } catch (err) {
    console.error("getFinanceSummary failed:", err);
    return null;
  }
}

export async function getAdminFinanceSummary(token?: string): Promise<AdminFinanceSummary | null> {
  try {
    const res = await apiClient<any>({
      endpoint: "/admin/finance/summary",
      method: "GET",
      token,
    });
    return res.data || res;
  } catch (err) {
    console.error("getAdminFinanceSummary failed:", err);
    return null;
  }
}

export async function getAdminTransactions(
  token?: string,
  params?: { page?: number; limit?: number; search?: string; sellerId?: string }
): Promise<{ transactions: AdminTransaction[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.sellerId) query.append("sellerId", params.sellerId);

    const res = await apiClient<any>({
      endpoint: `/admin/finance/transactions?${query.toString()}`,
      method: "GET",
      token,
    });
    const data = res.data || res;
    return {
      transactions: Array.isArray(data?.transactions)
        ? data.transactions
        : Array.isArray(data)
          ? data
          : [],
      total: data?.total || (Array.isArray(data) ? data.length : 0),
    };
  } catch (err) {
    console.error("getAdminTransactions failed:", err);
    return { transactions: [], total: 0 };
  }
}

export async function getAdminRevenueTrend(token?: string): Promise<RevenueTrend[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/admin/finance/revenue-trend",
      method: "GET",
      token,
    });
    const data = res.data || res;
    return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  } catch (err) {
    console.error("getAdminRevenueTrend failed:", err);
    return [];
  }
}

export async function getAdminCategorySplit(token?: string): Promise<CategorySplit[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/admin/finance/category-split",
      method: "GET",
      token,
    });
    const data = res.data || res;
    return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  } catch (err) {
    console.error("getAdminCategorySplit failed:", err);
    return [];
  }
}

export function getAdminTransactionsExportUrl(token?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://shop-api.medicova.net/api/v1";
  return `${baseUrl}/admin/finance/transactions/export?token=${token}`;
}

export async function getAdminWithdrawals(
  token?: string,
  params?: { page?: number; limit?: number; status?: string; search?: string }
): Promise<{ withdrawals: AdminWithdrawal[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);

    const res = await apiClient<any>({
      endpoint: `/withdrawals?${query.toString()}`,
      method: "GET",
      token,
    });
    return {
      withdrawals: res.data?.withdrawals || res.data || [],
      total: res.data?.total || (Array.isArray(res.data) ? res.data.length : 0),
    };
  } catch (err) {
    console.error("getAdminWithdrawals failed:", err);
    return { withdrawals: [], total: 0 };
  }
}

export async function getAdminWithdrawalStats(token?: string): Promise<AdminWithdrawalStats | null> {
  try {
    const res = await apiClient<any>({
      endpoint: "/withdrawals/stats",
      method: "GET",
      token,
    });
    return res.data || res;
  } catch (err) {
    console.error("getAdminWithdrawalStats failed:", err);
    return null;
  }
}

export interface SellerWithdrawal {
  _id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  method: "bank_transfer" | "paypal" | "instapay";
  details?: any;
  createdAt: string;
}

export interface CreateWithdrawalPayload {
  amount: number;
  method: "bank_transfer" | "paypal" | "instapay";
  details?: any;
}

export async function getSellerWithdrawals(
  token?: string,
  params?: { page?: number; limit?: number; status?: string }
): Promise<{ withdrawals: SellerWithdrawal[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.status) query.append("status", params.status);

    const res = await apiClient<any>({
      endpoint: `/withdrawals/me?${query.toString()}`,
      method: "GET",
      token,
    });
    return {
      withdrawals: res.data?.withdrawals || res.data || [],
      total: res.data?.total || (Array.isArray(res.data) ? res.data.length : 0),
    };
  } catch (err) {
    console.error("getSellerWithdrawals failed:", err);
    return { withdrawals: [], total: 0 };
  }
}

export async function createSellerWithdrawal(
  token: string,
  payload: CreateWithdrawalPayload
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const res = await apiClient<any>({
      endpoint: "/withdrawals",
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      token,
    });
    return { success: true, data: res.data || res, message: res.message };
  } catch (err: any) {
    console.error("createSellerWithdrawal failed:", err);
    return { success: false, message: err?.response?.data?.message || err.message };
  }
}

export async function getWithdrawalDetails(
  token: string,
  id: string
): Promise<AdminWithdrawal | SellerWithdrawal | null> {
  try {
    const res = await apiClient<any>({
      endpoint: `/withdrawals/${id}`,
      method: "GET",
      token,
    });
    return res.data || res;
  } catch (err) {
    console.error("getWithdrawalDetails failed:", err);
    return null;
  }
}

export interface PaymentAuditLog {
  _id: string;
  transactionId: string;
  orderId?: string | { _id: string; orderNumber: string };
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "refunded" | string;
  gateway: string;
  eventType?: string;
  providerResponse?: any;
  createdAt: string;
}

export async function getAdminPaymentAudits(
  token?: string,
  params?: { page?: number; limit?: number; search?: string; status?: string }
): Promise<{ audits: PaymentAuditLog[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.status) query.append("status", params.status);

    const res = await apiClient<any>({
      endpoint: `/payments/admin/transactions?${query.toString()}`,
      method: "GET",
      token,
    });
    const data = res.data || res;
    return {
      audits: Array.isArray(data?.transactions) ? data.transactions : (Array.isArray(data) ? data : []),
      total: data?.total || (Array.isArray(data) ? data.length : 0),
    };
  } catch (err) {
    console.error("getAdminPaymentAudits failed:", err);
    return { audits: [], total: 0 };
  }
}

export async function getAdminPaymentAuditDetails(
  token: string,
  transactionId: string
): Promise<PaymentAuditLog | null> {
  try {
    const res = await apiClient<any>({
      endpoint: `/payments/admin/transactions/${transactionId}`,
      method: "GET",
      token,
    });
    return res.data || res;
  } catch (err) {
    console.error("getAdminPaymentAuditDetails failed:", err);
    return null;
  }
}
