import { apiClient } from "../lib/apiClient";

export async function checkPhoneExists(phone: string): Promise<boolean> {
  // Ensure format is +2010... even if user types 010...
  let formattedPhone = phone.trim();
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "+2" + formattedPhone;
  } else if (!formattedPhone.startsWith("+")) {
    formattedPhone = "+20" + formattedPhone;
  }
  
  try {
    // Try POST first as it's what was initially there
    const res = await apiClient<any>({
      endpoint: `/auth/check-phone`,
      method: "POST",
      body: { phone: formattedPhone },
      suppressErrorLog: true, 
      suppressAutoLogout: true,
    });
    
    const data = res.data || res;
    return !!(data.exists === true || data.isRegistered === true || data.status === "exists" || data.data?.exists === true);
  } catch (err) {
    // If POST fails with 404, the endpoint might be a GET endpoint
    try {
      const res = await apiClient<any>({
        endpoint: `/auth/check-phone?phone=${encodeURIComponent(formattedPhone)}`,
        method: "GET",
        suppressErrorLog: true,
        suppressAutoLogout: true,
      });
      const data = res.data || res;
      return !!(data.exists === true || data.isRegistered === true || data.status === "exists" || data.data?.exists === true);
    } catch (secondErr) {
      console.error("checkPhoneExists both POST and GET failed:", secondErr);
      return false;
    }
  }
}
