import { apiClient } from "@/lib/apiClient";

export interface Seller {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  storeName?: string;
  storePhone?: string;
  email: string;
  phone?: string;
  isActive?: boolean;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  address?: string;
  profileImage?: string;
  storeLogo?: string;
  dateOfBirth?: string;
  sales?: number;
  productsCount?: number;
  category?: string;
  status?: "active" | "pending" | "suspended";
  rating?: number;
  sellerCode?: string;
  commission?: number;
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
      name: s.name || (s.firstName ? `${s.firstName} ${s.lastName || ""}`.trim() : s.email),
      storeName: s.storeName || s.store_name || s.name,
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

export async function getAdminSellers(token?: string): Promise<Seller[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/users/all-sellers?limit=1000",
      method: "GET",
      token,
    });
    
    const rawData = (res as any)?.data || res;
    const sellers: any[] = rawData.sellers || (Array.isArray(rawData) ? rawData : []);

    return sellers.map((s: any) => ({
      id: s._id || s.id,
      firstName: s.firstName || "",
      lastName: s.lastName || "",
      name: s.fullName || (s.firstName ? `${s.firstName} ${s.lastName || ""}`.trim() : s.email),
      storeName: s.storeName || s.brandName || s.store_name || s.name,
      storePhone: s.storePhone || "",
      email: s.email,
      isActive: s.active !== false,
      city: s.city || "",
      state: s.state || "",
      country: s.country || "",
      zipCode: s.zipCode || "",
      address: s.address || "",
      profileImage: s.profileImage || s.image || s.avatar || "",
      storeLogo: s.storeLogo || s.brandLogo || "",
      dateOfBirth: s.dateOfBirth || "",
      phone: s.phone || s.phoneNumber || s.mobile,
      sales: Number((s.sales && typeof s.sales === "object" ? s.sales.total : s.sales) || s.totalSales || 0),
      commission: Number(s.commission || 0),
      productsCount: Number(s.productsCount || s.products?.length || s.productIds?.length || 0),
      category: s.category || s.brandName || "",
      status: s.status || (s.active === false ? "suspended" : "active"),
      rating: Number(s.rating || s.rate || 0),
      sellerCode: s.sellerCode || s.code || `#SEL-${(s._id || s.id || "").slice(-4)}`,
    }));
  } catch (error) {
    console.error("Error fetching admin sellers:", error);
    return [];
  }
}

export async function createSellerByAdmin(data: any, token?: string): Promise<any> {
  return apiClient<any>({
    endpoint: "/users/admin/sellers",
    method: "POST",
    body: data,
    token,
  });
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
      id: data._id || data.id,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      name: data.fullName || (data.firstName ? `${data.firstName} ${data.lastName || ""}`.trim() : data.email),
      storeName: data.storeName || data.brandName || data.store_name || data.name,
      storePhone: data.storePhone || "",
      email: data.email,
      isActive: data.active !== false,
      city: data.city || "",
      state: data.state || "",
      country: data.country || "",
      zipCode: data.zipCode || "",
      address: data.address || "",
      profileImage: data.profileImage || data.image || data.avatar || "",
      storeLogo: data.storeLogo || data.brandLogo || "",
      dateOfBirth: data.dateOfBirth || "",
      phone: data.phone || data.phoneNumber || data.mobile,
      sales: Number((data.sales && typeof data.sales === "object" ? data.sales.total : data.sales) || data.totalSales || 0),
      commission: Number(data.commission || 0),
      productsCount: Number(data.productsCount || data.products?.length || data.productIds?.length || 0),
      category: data.category || data.brandName || "",
      status: data.status || (data.active === false ? "suspended" : "active"),
      rating: Number(data.rating || data.rate || 0),
      sellerCode: data.sellerCode || data.code || `#SEL-${(data._id || data.id || "").slice(-4)}`,
    };
  } catch (error) {
    console.error(`Error fetching seller ${id}:`, error);
    return null;
  }
}
export async function deleteSeller(id: string, token?: string): Promise<any> {
  return apiClient<any>({
    endpoint: `/users/${id}`,
    method: "DELETE",
    token,
  });
}
