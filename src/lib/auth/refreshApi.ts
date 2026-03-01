import { apiClient } from "../apiClient";

interface RefreshTokenResponse {
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

export async function callRefreshTokenApi(
  refreshToken: string,
  userId: string,
): Promise<RefreshTokenResponse> {
  return apiClient<RefreshTokenResponse>({
    endpoint: "/auth/refresh",
    method: "GET",
    headers: {
      "x-refresh-token": refreshToken,
      "x-user-id": userId,
    },
  });
}
