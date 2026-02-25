/**
 * Shared login API function that calls the external authentication API
 */
export async function callLoginApi(email: string, password: string) {
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
  const loginUrl = `${cleanBaseUrl}/auth/login`;

  console.log("Calling login API:", loginUrl);
  console.log("Environment:", process.env.NODE_ENV);

  let response;
  try {
    // For IP-based HTTPS, Node.js may reject the certificate. 
    // In development/test, we might need to bypass this if the cert doesn't match the IP.
    if (loginUrl.startsWith("https://") && (process.env.NODE_ENV === "development" || process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0")) {
      // Note: This is a diagnostic step. If this is a production server, 
      // the certificate should be correctly issued for the IP or a domain should be used.
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
  } catch (fetchError: any) {
    console.error("Fetch request failed:", fetchError);
    throw new Error(`Connection failed to ${loginUrl}: ${fetchError?.message || "Unknown network error"}`);
  }

  // Get response text first to check if it's JSON
  const responseText = await response.text();
  console.log("API response status:", response.status);
  
  if (response.status >= 500) {
    console.error("Server Error Response:", responseText);
  }

  let data;
  try {
    // Try to parse as JSON
    data = JSON.parse(responseText);
  } catch (parseError) {
    // If not JSON, throw error
    console.error("API returned non-JSON response:", responseText);
    throw new Error(`Invalid response from authentication server (Status ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `Authentication failed with status ${response.status}`);
  }

  return data;
}

