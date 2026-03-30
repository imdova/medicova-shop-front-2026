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

export async function getAllUsers(token?: string): Promise<any> {
  const res = await apiClient<any>({
    endpoint: `/users/all-users`,
    method: "GET",
    token,
  });
  return res.data || res;
}
export async function deleteUser(id: string, token?: string): Promise<any> {
  return apiClient<any>({
    endpoint: `/users/${id}`,
    method: "DELETE",
    token,
  });
}
export async function getUserById(id: string, token?: string): Promise<any> {
  const res = await apiClient<any>({
    endpoint: `/users/${id}`,
    method: "GET",
    token,
  });
  return res.data || res;
}

export async function getMyProfile(token?: string): Promise<any> {
  const res = await apiClient<any>({
    endpoint: `/users/me`,
    method: "GET",
    token,
  });
  return res.data || res;
}

export async function updateMyProfile(data: any, token?: string): Promise<any> {
  return apiClient<any>({
    endpoint: `/users/me`,
    method: "PUT",
    body: data,
    token,
  });
}

export async function updateMyPassword(data: any, token?: string): Promise<any> {
  return apiClient<any>({
    endpoint: `/users/password`,
    method: "PUT",
    body: data,
    token,
  });
}

export async function getSellerProfile(token?: string): Promise<any> {
  const res = await apiClient<any>({
    endpoint: `/users/seller/me`,
    method: "GET",
    token,
  });
  return res.data || res;
}

export async function updateSellerProfile(data: any, token?: string): Promise<any> {
  return apiClient<any>({
    endpoint: `/users/seller/me`,
    method: "PUT",
    body: data,
    token,
  });
}

export async function updateSellerRootEmail(email: string, token?: string): Promise<any> {
  return apiClient<any>({
    endpoint: `/users/seller/root-email`,
    method: "PUT",
    body: { email },
    token,
  });
}

export async function startPhoneVerification(phone: string, token?: string): Promise<any> {
  return apiClient<any>({
    endpoint: `/auth/verify/phone/start`,
    method: "POST",
    body: { phone, channel: "sms" },
    token,
  });
}

export async function confirmPhoneVerification(
  phone: string,
  code: string,
  token?: string,
): Promise<any> {
  return apiClient<any>({
    endpoint: `/auth/verify/phone/confirm`,
    method: "POST",
    body: { phone, code, channel: "sms" },
    token,
  });
}

export async function startEmailVerification(token?: string): Promise<any> {
  return apiClient<any>({
    endpoint: `/auth/verify/email/start`,
    method: "POST",
    token,
  });
}

export async function confirmEmailVerification(
  code: string,
  token?: string,
): Promise<any> {
  return apiClient<any>({
    endpoint: `/auth/verify/email/confirm`,
    method: "POST",
    body: { code },
    token,
  });
}

export async function getVerificationStatus(token?: string, userId?: string): Promise<any> {
  return apiClient<any>({
    endpoint: userId ? `/auth/verify/status?userId=${userId}` : `/auth/verify/status`,
    method: "GET",
    token,
  });
}
