type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiRequestConfig {
  endpoint: string;
  method?: HttpMethod;
  body?: Record<string, unknown> | FormData;
  headers?: Record<string, string>;
  token?: string;
  suppressErrorLog?: boolean;
}

function getBaseUrl(): string {
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;

  if (baseUrl) {
    baseUrl = baseUrl.replace(/\/$/, "");
    if (!baseUrl.includes("/api/v1")) {
      baseUrl = `${baseUrl}/api/v1`;
    }
  } else {
    baseUrl = "https://shop-api.medicova.net/api/v1";
  }

  return baseUrl.replace(/\/$/, "");
}

export async function apiClient<T = unknown>({
  endpoint,
  method = "POST",
  body,
  headers,
  token,
  suppressErrorLog = false,
}: ApiRequestConfig): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const normalizedToken = token?.trim();
  const authorizationHeader = normalizedToken
    ? /^Bearer\s+/i.test(normalizedToken)
      ? normalizedToken
      : `Bearer ${normalizedToken}`
    : undefined;

  const isFormData = body instanceof FormData;

  console.log(
    `DEBUG [apiClient]: ${method} ${url} | Token: ${authorizationHeader ? "PRESENT" : "MISSING"}`,
  );

  const fetchOptions: RequestInit = {
    method,
    headers: {
      ...(!isFormData && method !== "GET" && method !== "DELETE"
        ? { "Content-Type": "application/json" }
        : {}),
      ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
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
    // Log API error details to help debugging
    if (!suppressErrorLog) {
      console.error(
        `API Error (${response.status} ${url}):`,
        JSON.stringify(data, null, 2),
      );
    }

    const errorMsg =
      data.errors?.message?.[0] ||
      data.message ||
      data.error ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}
