import { apiClient } from "@/lib/apiClient";

export interface FinanceSummary {
  grossVolume: number;
  platformFees: number;
  netEarnings: number;
  pendingPayoutEstimate: number;
  feePercentApplied: number;
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
