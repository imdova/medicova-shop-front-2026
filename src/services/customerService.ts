import { apiClient } from "@/lib/apiClient";

export interface ApiCustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

export async function getCustomers(token?: string): Promise<ApiCustomer[]> {
  try {
    const res = await apiClient({
      endpoint: "/users/all-users", // Correct endpoint for fetching all users
      method: "GET",
      token,
    });
    const data = (res as any)?.data || res;
    if (Array.isArray(data)) return data;
    if (data?.users && Array.isArray(data.users)) return data.users;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (err) {
    console.error("getCustomers failed:", err);
    return [];
  }
}
