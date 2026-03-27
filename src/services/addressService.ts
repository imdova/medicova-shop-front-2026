import { apiClient } from "@/lib/apiClient";

export interface AddressPayload {
  userId?: string;
  addressType: "home" | "work" | "other" | string;
  addressName: string;
  addressDetails: string;
  area: string;
  city: string;
  isDefault?: boolean;
}

export async function createAddress(payload: AddressPayload, token?: string): Promise<any> {
  return apiClient({
    endpoint: "/customer-addresses",
    method: "POST",
    body: payload as any,
    token,
  });
}

export async function getAddresses(token?: string): Promise<any> {
  return apiClient({
    endpoint: "/customer-addresses/me",
    method: "GET",
    token,
  });
}
