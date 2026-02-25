/**
 * Shared refresh token API function that calls the external authentication API
 */
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
  userId: string
): Promise<RefreshTokenResponse> {

  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;

  
  if (baseUrl) {
    baseUrl = baseUrl.replace(/\/$/, "");
    if (!baseUrl.includes("/api/v1")) {
      baseUrl = `${baseUrl}/api/v1`;
    }
  } else {
    baseUrl = "https://82.112.255.49/api/v1";
  }

  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const refreshUrl = `${cleanBaseUrl}/auth/refresh`;

  console.log("Calling refresh token API:", refreshUrl);
  console.log("Environment:", process.env.NODE_ENV);

  let response;
  try {
    if (refreshUrl.startsWith("https://") && (process.env.NODE_ENV === "development" || process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0")) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    response = await fetch(refreshUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-refresh-token": refreshToken,
        "x-user-id": userId,
      },
    });
  } catch (fetchError: any) {
    console.error("Refresh fetch request failed:", fetchError);
    throw new Error(`Connection failed to refresh endpoint ${refreshUrl}: ${fetchError?.message || "Unknown network error"}`);
  }

  const responseText = await response.text();
  console.log("Refresh API response status:", response.status);

  if (response.status >= 500) {
    console.error("Server Error Response (Refresh):", responseText);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error("Refresh API returned non-JSON response:", responseText);
    throw new Error(
      `Invalid response from refresh server (Status ${response.status})`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Token refresh failed with status ${response.status}`
    );
  }

  return data as RefreshTokenResponse;
}

