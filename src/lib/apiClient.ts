type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestConfig {
  endpoint: string;
  method?: HttpMethod;
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  token?: string;
}

function getBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;

  if (baseUrl) {
    const cleanUrl = baseUrl.replace(/\/$/, "");
    return cleanUrl.includes("/api/v1") ? cleanUrl : `${cleanUrl}/api/v1`;
  }

  // Final fallback (typically for cloud production if ENV is missing)
  return "https://shop-api.medicova.net/api/v1";
}


function handleTlsBypass(): void {
  const bypassRequested =
    process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0" ||
    process.env.NEXT_PUBLIC_NODE_TLS_REJECT_UNAUTHORIZED === "0";

  if (bypassRequested || process.env.NODE_ENV === "development") {
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
  }
}


export async function apiClient<T = unknown>({
  endpoint,
  method = "POST",
  body,
  headers,
  token,
}: ApiRequestConfig): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  console.log(`[API Request] ${method} ${url}`);
  
  handleTlsBypass();

  try {
    // Basic URL validation
    new URL(url);
  } catch (e) {
    console.error(`[API Error] Invalid URL: ${url}`);
    throw new Error(`Invalid API URL: ${url}`);
  }

  const isFormData = body instanceof FormData;

  const fetchOptions: RequestInit = {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body && method !== "GET") {
    fetchOptions.body = isFormData ? body : JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error: any) {
    throw new Error(
      `Connection failed to ${url}: ${error?.message || "Unknown network error"}`,
    );
  }

  const responseText = await response.text();

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Invalid response from server (Status ${response.status})`,
    );
  }

  if (!response.ok) {
    console.error("API Error Details:", JSON.stringify(data, null, 2));
    const errorMsg =
      data.errors?.message?.[0] ||
      data.message ||
      data.error ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}
