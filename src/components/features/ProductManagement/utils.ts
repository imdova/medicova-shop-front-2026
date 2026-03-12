import { ApiProduct } from "@/services/productService";
import { LanguageType } from "@/util/translations";

export function getSellerName(
  product: ApiProduct,
  sellerMap?: Record<string, string>,
): string {
  const seller =
    product.seller || product.sellers || product.store || product.sellerId;
  if (!seller) return product.createdBy || "—";

  if (typeof seller === "object") {
    const sellerObject = seller as {
      name?: string;
      store_name?: string;
      storeName?: string;
      firstName?: string;
      lastName?: string;
    };
    const name = sellerObject.name || sellerObject.store_name || sellerObject.storeName;
    if (name) return name;
    if (sellerObject.firstName || sellerObject.lastName) {
      return [sellerObject.firstName, sellerObject.lastName]
        .filter(Boolean)
        .join(" ");
    }
  }

  if (typeof seller === "string") {
    if (seller === "admin") return "Admin";
    if (sellerMap?.[seller]) return sellerMap[seller];
    return seller.slice(0, 12) + "…";
  }

  return String(seller);
}

function getLookupName(
  value: unknown,
  locale: LanguageType,
  lookup?: Record<string, { en: string; ar: string }>,
): string {
  if (!value) return "—";

  if (typeof value === "object") {
    const mapped = value as {
      title?: Partial<Record<LanguageType, string>>;
      nameAr?: Partial<Record<LanguageType, string>>;
      name?: string;
    };
    return (
      mapped.title?.[locale] ??
      mapped.nameAr?.[locale] ??
      mapped.name ??
      "—"
    );
  }

  if (typeof value === "string" && lookup?.[value]) {
    return lookup[value][locale] || lookup[value].en || "—";
  }

  return "—";
}

export function getCategoryName(
  product: ApiProduct,
  locale: LanguageType,
  lookup?: Record<string, { en: string; ar: string }>,
): string {
  return getLookupName(
    product.category || product.classification?.category,
    locale,
    lookup,
  );
}

export function getSubCategoryName(
  product: ApiProduct,
  locale: LanguageType,
  lookup?: Record<string, { en: string; ar: string }>,
): string {
  return getLookupName(
    product.subcategory || product.classification?.subcategory,
    locale,
    lookup,
  );
}

export function getChildCategoryName(
  product: ApiProduct,
  locale: LanguageType,
  lookup?: Record<string, { en: string; ar: string }>,
): string {
  return getLookupName(
    product.childCategory || product.classification?.childCategory,
    locale,
    lookup,
  );
}

export function formatCreatedAt(
  createdAt: string | null | undefined,
  locale: LanguageType,
): string {
  if (!createdAt) return "—";
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(createdAt));
  } catch {
    return "—";
  }
}

export function formatNumber(value: number, locale: LanguageType): string {
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(
      value,
    );
  } catch {
    return String(value);
  }
}

export function formatPrice(
  value: number | string | null | undefined,
  locale: LanguageType,
): string {
  if (value === null || value === undefined) return "—";
  try {
    const number = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  } catch {
    return typeof value === "number" ? value.toFixed(2) : String(value);
  }
}

export function formatCurrency(amount: number, locale: LanguageType): string {
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function getInitials(name: string): string {
  const cleaned = (name || "").trim();
  if (!cleaned) return "—";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? (parts[1]?.[0] ?? "") : (parts[0]?.[1] ?? "");
  const initials = (first + second).toUpperCase();
  return initials || "—";
}

export function getStockStatus(product: ApiProduct): {
  label: string;
  dot: "green" | "red" | "orange";
} {
  const quantity =
    product.stock ?? product.stockQuantity ?? product.inventory?.stockQuantity;
  if (quantity === null || quantity === undefined) {
    return { label: "—", dot: "green" };
  }
  if (quantity === 0) return { label: "Out of Stock", dot: "red" };
  if (quantity < 10) return { label: `${quantity} in stock (Low)`, dot: "orange" };
  return { label: `${quantity} in stock`, dot: "green" };
}
