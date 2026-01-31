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
  // Use BASE_URL from environment for the backend API URL
  // NEXTAUTH_URL is only for NextAuth callbacks, not for API requests
  let baseUrl = process.env.BASE_URL;

  // Remove trailing slash if present
  if (baseUrl) {
    baseUrl = baseUrl.replace(/\/$/, "");
    // Ensure BASE_URL includes /api/v1 if it doesn't already
    if (!baseUrl.includes("/api/v1")) {
      baseUrl = `${baseUrl}/api/v1`;
    }
  }

  // Fallback to default external API if BASE_URL is not set
  if (!baseUrl) {
    baseUrl = "http://82.112.255.49/api/v1";
  }

  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const refreshUrl = `${cleanBaseUrl}/auth/refresh`;

  console.log("Calling refresh token API:", refreshUrl);
  console.log("User ID:", userId);

  const response = await fetch(refreshUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-refresh-token": refreshToken,
      "x-user-id": userId,
    },
  });

  // Get response text first to check if it's JSON
  const responseText = await response.text();
  console.log("Refresh API response status:", response.status);
  console.log("Refresh API response text (first 200 chars):", responseText.substring(0, 200));

  let data;
  try {
    // Try to parse as JSON
    data = JSON.parse(responseText);
  } catch (parseError) {
    // If not JSON, throw error
    console.error("Refresh API returned non-JSON response:", responseText);
    console.error("Parse error:", parseError);
    throw new Error(
      `Invalid response from refresh server: ${responseText.substring(0, 100)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Token refresh failed with status ${response.status}`
    );
  }

  return data as RefreshTokenResponse;
}

