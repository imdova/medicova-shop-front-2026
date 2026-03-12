import { ApiProduct } from "@/services/productService";

function normalizeId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const v = value as {
      _id?: string;
      id?: string;
      email?: string;
      name?: string;
      storeName?: string;
    };
    return v._id || v.id || v.email || v.name || v.storeName || null;
  }
  return null;
}

function collectProductOwnerIds(product: ApiProduct): string[] {
  const ids = new Set<string>();

  const directCandidates = [
    normalizeId(product.store),
    normalizeId(product.sellerId),
    normalizeId(product.seller),
    normalizeId((product as ApiProduct & { sellers?: unknown }).sellers),
  ];

  directCandidates.forEach((id) => id && ids.add(id));

  const createdBy = String(product.createdBy || "").trim();
  if (createdBy && createdBy !== "admin" && createdBy !== "seller") {
    ids.add(createdBy);
  }

  return Array.from(ids);
}

export function collectCurrentSellerIds(user: unknown): string[] {
  const safeUser =
    typeof user === "object" && user !== null
      ? (user as Record<string, unknown>)
      : {};
  const ids = new Set<string>();
  [
    safeUser.id,
    safeUser._id,
    safeUser.storeId,
    safeUser.sellerId,
    safeUser.store,
    safeUser.brandId,
    safeUser.email,
    safeUser.name,
  ].forEach((value) => {
    const id = normalizeId(value);
    if (id) ids.add(id);
  });
  return Array.from(ids);
}

export function productBelongsToSeller(
  product: ApiProduct,
  sellerIds: string[],
): boolean {
  if (!sellerIds.length) return false;
  const ownerIds = collectProductOwnerIds(product);
  if (!ownerIds.length) return false;

  const ownerSet = new Set(ownerIds.map((id) => String(id)));
  return sellerIds.some((id) => ownerSet.has(String(id)));
}
