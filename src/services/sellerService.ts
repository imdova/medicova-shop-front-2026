import { apiClient } from "@/lib/apiClient";

export interface Seller {
  id: string;
  name: string;
  store_name?: string;
  email: string;
}

export async function getSellers(token?: string): Promise<Seller[]> {
  try {
    let res = await apiClient<any>({
      endpoint: "/users/all-sellers",
      method: "GET",
      token,
    });
    console.log("DEBUG: getSellers /users/all-sellers raw response:", JSON.stringify(res, null, 2));

    // Fallback if empty
    if (!res || (Array.isArray(res) && res.length === 0) || (res.data && Array.isArray(res.data) && res.data.length === 0)) {
      console.log("DEBUG: /users/all-sellers empty, trying /sellers...");
      const res2 = await apiClient<any>({ endpoint: "/sellers", method: "GET", token }).catch(() => null);
      if (res2) {
        res = res2;
        console.log("DEBUG: getSellers /sellers success:", JSON.stringify(res, null, 2));
      } else {
        console.log("DEBUG: /sellers failed, trying /users/sellers...");
        const res3 = await apiClient<any>({ endpoint: "/users/sellers", method: "GET", token }).catch(() => null);
        if (res3) {
            res = res3;
            console.log("DEBUG: getSellers /users/sellers success:", JSON.stringify(res, null, 2));
        }
      }
    }

    // The API structure likely returns users in res.data or res.data.users
    const sellersArr = Array.isArray(res) 
      ? res 
      : (res?.data && Array.isArray(res.data) 
          ? res.data 
          : (res?.data?.users || res?.data?.sellers || res?.users || res?.sellers || []));

    console.log("DEBUG: getSellers raw response sample:", JSON.stringify(sellersArr[0], null, 2));

    return sellersArr.map((s: any) => ({
      id: s.id || s._id,
      name: s.name || s.firstName ? `${s.firstName} ${s.lastName || ""}`.trim() : s.email,
      store_name: s.store_name || s.name,
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

export async function getSellerById(
  id: string,
  token?: string,
): Promise<Seller | null> {
  try {
    const res = await apiClient<any>({
      endpoint: `/users/${id}`,
      method: "GET",
      token,
    });
    const data = (res as any)?.data || res;
    if (!data) return null;
    return {
      id: data.id || data._id,
      name:
        data.name ||
        (data.firstName
          ? `${data.firstName} ${data.lastName || ""}`.trim()
          : data.email),
      store_name: data.store_name || data.name,
      email: data.email,
    };
  } catch (error) {
    console.error(`Error fetching seller ${id}:`, error);
    return null;
  }
}
