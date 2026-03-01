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
  email: string;
  password: string;
  role: "user" | "seller";
  language: string;
}

export async function callRegisterApi(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  return apiClient<RegisterResponse>({
    endpoint: "/auth/register",
    method: "POST",
    body: data as unknown as Record<string, unknown>,
  });
}
