import { apiClient } from "../apiClient";

interface RegisterResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
      language: string;
    };
  };
  message: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email?: string;
  password: string;
  role: "user" | "seller";
  language: string;
  phone: string;
}

export async function callRegisterApi(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  // Ensure phone formatting +2010...
  const phone = (data.phone || "").trim();
  const formattedPhone = phone.startsWith("0") 
    ? "+2" + phone 
    : (phone.startsWith("+") ? phone : "+20" + phone);

  return apiClient<RegisterResponse>({
    endpoint: "/auth/register",
    method: "POST",
    body: { ...data, phone: formattedPhone } as unknown as Record<string, unknown>,
  });
}
