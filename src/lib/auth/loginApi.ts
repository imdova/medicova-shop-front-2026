import { apiClient } from "../apiClient";

export async function callLoginApi(identifier: string, password: string) {
  return apiClient({
    endpoint: "/auth/login",
    method: "POST",
    body: { identifier, password },
  });
}
