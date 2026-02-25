/**
 * Shared registration API function that calls the external authentication API
 */
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
  data: RegisterRequest
): Promise<RegisterResponse> {
  // Prefer NEXT_PUBLIC_BASE_URL for client-side support, fallback to BASE_URL for server-side
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;

  // Remove trailing slash and append /api/v1 if needed
  if (baseUrl) {
    baseUrl = baseUrl.replace(/\/$/, "");
    if (!baseUrl.includes("/api/v1")) {
      baseUrl = `${baseUrl}/api/v1`;
    }
  } else {
    // Fallback to default external API if no environment variables are set
    baseUrl = "https://82.112.255.49/api/v1";
  }

  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const registerUrl = `${cleanBaseUrl}/auth/register`;

  console.log("Calling register API:", registerUrl);
  console.log("Registration data:", { ...data, password: "***" });

  const response = await fetch(registerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // Get response text first to check if it's JSON
  const responseText = await response.text();
  console.log("Register API response status:", response.status);
  console.log("Register API response text (first 200 chars):", responseText.substring(0, 200));

  let responseData;
  try {
    // Try to parse as JSON
    responseData = JSON.parse(responseText);
  } catch (parseError) {
    // If not JSON, throw error
    console.error("Register API returned non-JSON response:", responseText);
    console.error("Parse error:", parseError);
    throw new Error(
      `Invalid response from registration server: ${responseText.substring(0, 100)}`
    );
  }

  if (!response.ok) {
    throw new Error(
      responseData.message || responseData.error || `Registration failed with status ${response.status}`
    );
  }

  return responseData as RegisterResponse;
}

