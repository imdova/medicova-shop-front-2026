import { apiClient } from "../apiClient";

export async function callLoginApi(email: string, password: string) {
  return apiClient({
    endpoint: "/auth/login",
    method: "POST",
    body: { email, password },
  });
}
