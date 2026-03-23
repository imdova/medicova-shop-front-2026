import { apiClient } from "@/lib/apiClient";

export type PackagePayload = {
  name: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
};

export type SellerPackage = {
  id: string;
  name: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
};

function parseNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function packageKey(pkg: SellerPackage): string {
  const id = String(pkg.id || "").trim();
  if (id) return `id:${id}`;

  const name = String(pkg.name || "").trim().toLowerCase();
  return `shape:${name}|${pkg.weightKg ?? ""}|${pkg.lengthCm ?? ""}|${pkg.widthCm ?? ""}|${pkg.heightCm ?? ""}`;
}

function normalizePackage(item: any, fallbackId: string): SellerPackage | null {
  const name = String(item?.name || "").trim();
  if (!name) return null;

  const id = String(
    item?._id || item?.id || item?.packageId || fallbackId,
  ).trim();

  return {
    id: id || fallbackId,
    name,
    weightKg: parseNumber(item?.weightKg),
    lengthCm: parseNumber(item?.lengthCm),
    widthCm: parseNumber(item?.widthCm),
    heightCm: parseNumber(item?.heightCm),
  };
}

function extractPackages(response: any): any[] {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.packages)) return data.packages;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(response?.packages)) return response.packages;
  return [];
}

function dedupePackages(items: SellerPackage[]): SellerPackage[] {
  const seen = new Set<string>();
  const output: SellerPackage[] = [];

  items.forEach((item) => {
    const key = packageKey(item);
    if (seen.has(key)) return;
    seen.add(key);
    output.push(item);
  });

  return output;
}

export async function getPackages(token?: string): Promise<SellerPackage[]> {
  const normalizedToken = token?.trim();
  if (!normalizedToken) return [];

  const candidateEndpoints = ["/packages?limit=1000", "/packages"];
  const merged: SellerPackage[] = [];

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await apiClient<any>({
        endpoint,
        method: "GET",
        token: normalizedToken,
        suppressErrorLog: true,
      });

      const parsed = extractPackages(response)
        .map((item, index) =>
          normalizePackage(item, `pkg-${index + 1}`),
        )
        .filter(Boolean) as SellerPackage[];

      if (parsed.length) merged.push(...parsed);
    } catch {
      // Ignore failed endpoint and continue with the next candidate.
    }
  }

  return dedupePackages(merged);
}

export async function createPackage(
  payload: PackagePayload,
  token?: string,
): Promise<SellerPackage> {
  const normalizedToken = token?.trim();
  if (!normalizedToken) throw new Error("Unauthorized");

  const body: PackagePayload = {
    name: payload.name.trim(),
    weightKg: parseNumber(payload.weightKg),
    lengthCm: parseNumber(payload.lengthCm),
    widthCm: parseNumber(payload.widthCm),
    heightCm: parseNumber(payload.heightCm),
  };

  const response = await apiClient<any>({
    endpoint: "/packages",
    method: "POST",
    body: body as any,
    token: normalizedToken,
  });

  const candidate = response?.data ?? response;
  const normalized = normalizePackage(
    candidate,
    `pkg-${Date.now().toString(36)}`,
  );
  if (!normalized) throw new Error("Failed to parse package response");
  return normalized;
}

export async function deletePackage(id: string, token?: string): Promise<void> {
  const normalizedToken = token?.trim();
  if (!normalizedToken) throw new Error("Unauthorized");

  await apiClient<void>({
    endpoint: `/packages/${id}`,
    method: "DELETE",
    token: normalizedToken,
  });
}
