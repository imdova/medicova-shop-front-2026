import { apiClient } from "../lib/apiClient";

export async function checkPhoneExists(phone: string): Promise<boolean> {
  try {
    const res = await apiClient<any>({
      endpoint: `/users/all-users?phone=${encodeURIComponent(phone)}`,
      method: "GET",
      suppressErrorLog: true,
      suppressAutoLogout: true,
    });
    
    const data = res.data || res;
    // Assuming the API returns a list and we check length, 
    // or a specific structure for phone search.
    if (Array.isArray(data)) {
      return data.length > 0;
    }
    if (data && typeof data === "object") {
       // Handle cases where data is { count: 1, ... } or similar
       return !!(data.count > 0 || data.total > 0 || (Array.isArray(data.users) && data.users.length > 0));
    }
    return false;
  } catch (err) {
    console.warn("Failed to check phone existence:", err);
    return false;
  }
}
