import { apiClient } from "@/lib/apiClient";

export interface Seller {
  id: string;
  name: string;
  store_name?: string;
  email: string;
}

export async function getSellers(token?: string): Promise<Seller[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/users/all-sellers",
      method: "GET",
      token,
    });

    // The API structure likely returns users in res.data or res.data.users
    const sellersArr = Array.isArray(res.data) 
      ? res.data 
      : (res.data?.users || res.data?.sellers || res.users || []);

    return sellersArr.map((s: any) => ({
      id: s.id || s._id,
      name: s.name || s.email,
      store_name: s.store_name,
      email: s.email,
    }));
  } catch (error) {
    const msg =
      typeof (error as any)?.message === "string" ? (error as any).message : "";
    // Suppress expected auth-related errors to avoid console spam.
    if (msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("invalid refresh token")) {
      return [];
    }
    console.error("Error fetching sellers:", error);
    return [];
  }
}
