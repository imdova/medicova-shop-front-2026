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
  // Phone is already formatted with country code from the signup form (e.g. +201XXXXXXXXX)
  const phone = (data.phone || "").trim();

  return apiClient<RegisterResponse>({
    endpoint: "/auth/register",
    method: "POST",
    body: { ...data, phone } as unknown as Record<string, unknown>,
  });
}
