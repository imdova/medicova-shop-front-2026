import { apiClient } from "@/lib/apiClient";

export interface PaymobMethod {
  type: "card" | "ewallet" | "kiosk";
  label: string;
  enabled: boolean;
}

export interface BillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  city: string;
  country: string;
  street: string;
  postal_code?: string;
}

export interface InitializePaymentPayload {
  orderId: string;
  paymobIntegrationType: string;
  paymobIntegrationId?: string;
  billingData: BillingData;
}

export interface PaymentInitResponse {
  status: string;
  data: {
    sessionId: string;
    paymentUrl: string;
    paymentToken: string;
    iframeId?: number;
    unifiedCheckoutUrl?: string;
  };
  message: string | null;
}

export async function getPaymobMethods(token?: string): Promise<PaymobMethod[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/checkout/paymob-methods",
      method: "GET",
      token,
      suppressErrorLog: true,
    });
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch paymob methods:", err);
    return [];
  }
}

export async function initializePaymobPayment(
  payload: InitializePaymentPayload,
  token?: string
): Promise<PaymentInitResponse> {
  return apiClient<PaymentInitResponse>({
    endpoint: "/payments/paymob/initialize",
    method: "POST",
    body: payload as any,
    token,
  });
}

export async function createCheckoutSession(orderId: string, token?: string): Promise<PaymentInitResponse> {
  return apiClient<PaymentInitResponse>({
    endpoint: "/checkout/session",
    method: "POST",
    body: { orderId },
    token,
  });
}

export async function confirmPayment(
  payload: { orderId: string; status: string; transactionId: string },
  token?: string
) {
  return apiClient({
    endpoint: "/checkout/confirm",
    method: "POST",
    body: payload as any,
    token,
  });
}
