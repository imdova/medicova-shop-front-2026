import { destinationSurcharges } from "@/constants";
import { MultilingualString, ShippingOptions } from "@/types";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(...inputs));
}

export function formatFullName(
  firstName: MultilingualString,
  lastName: MultilingualString,
  language: "en" | "ar" = "en",
): string {
  const getValue = (val: MultilingualString): string => {
    if (typeof val === "string") return val;
    return val?.[language] || "";
  };

  const first = getValue(firstName);
  const last = getValue(lastName);

  // Handle RTL vs LTR order if needed
  if (language === "ar") {
    return `${last} ${first}`.trim(); // In Arabic, often last comes before first
  }

  return `${first} ${last}`.trim(); // English format
}

export const getTimeAgo = (dateString: Date | string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInMonths > 0) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  } else if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else {
    return "Today";
  }
};

export const isCurrentPage = (pathname: string, href: string): boolean => {
  if (!pathname || !href) return false;

  const normalize = (path: string) => {
    let p = path === "/" ? "/" : path.replace(/\/$/, "");
    // Remove locale prefix (e.g., /ar, /en) if present
    return p.replace(/^\/(ar|en)(\/|$)/, "/").replace(/\/$/, "") || "/";
  };

  const normalizedPathname = normalize(pathname);
  const normalizedHref = normalize(href);

  // Exact match first
  if (normalizedPathname === normalizedHref) return true;

  // Special handling for admin dashboard - only match exact path
  if (normalizedHref === "/admin") {
    return normalizedPathname === "/admin";
  }

  // For other nested routes, match only direct children
  if (normalizedPathname.startsWith(normalizedHref + "/")) {
    const remainingPath = normalizedPathname.slice(normalizedHref.length);
    return remainingPath.startsWith("/") && !remainingPath.includes("/../");
  }

  return false;
};
// Ex Data
// "3 days"	Today + 3 days in ms
// "5-7 days"	Today + 5 days in ms
export function getExecuteDateFormatted(
  deliveryTime: string,
  format: string = "EEE, MMM d",
  locale: string = "en", // Accept a locale (e.g., "en" or "ar")
): string {
  const now = new Date();
  let targetDate: Date | null = null;

  // Try to parse as ISO date string
  const date = new Date(deliveryTime);
  if (!isNaN(date.getTime())) {
    targetDate = date;
  } else {
    // Match formats like "3 days" or "5-7 days"
    const daysMatch = deliveryTime.match(/(\d+)(?:\s*-\s*(\d+))?\s*days?/i);
    if (daysMatch) {
      const minDays = parseInt(daysMatch[1], 10);
      targetDate = new Date();
      targetDate.setDate(now.getDate() + minDays);
    }
  }

  if (!targetDate) {
    targetDate = now; // fallback to now if nothing matched
  }

  const options: Intl.DateTimeFormatOptions = getDateFormatOptions(format);

  return targetDate.toLocaleDateString(locale, options);
}
// Helper to map format string to Intl.DateTimeFormat options
function getDateFormatOptions(format: string): Intl.DateTimeFormatOptions {
  switch (format) {
    case "EEE, MMM d":
      return { weekday: "short", month: "short", day: "numeric" };
    case "MMMM d, yyyy":
      return { month: "long", day: "numeric", year: "numeric" };
    case "yyyy-MM-dd":
      return { year: "numeric", month: "2-digit", day: "2-digit" };
    default:
      return { weekday: "short", month: "short", day: "numeric" };
  }
}

// calculate Shipping Fee
export function calculateShippingFee(options: ShippingOptions): number {
  const { 
    shippingMethod, 
    city, 
    weightKg = 1,
    shippingCostInsideCairo,
    shippingCostRegion1,
    shippingCostRegion2
  } = options;

  // Normalize the shipping method to English
  const methodEn = shippingMethod?.en?.toLowerCase() || "";
  const methodAr = shippingMethod?.ar?.toLowerCase() || "";

  // Free shipping check (both EN/AR)
  if (methodEn === "free" || methodAr === "مجاني") {
    return 0;
  }

  // If city is not provided, return 0 shipping fee (User request)
  if (!city || city.trim() === "") {
    return 0;
  }

  // If specific costs are provided, use region-based logic
  const normalizedCity = city?.trim().toLowerCase() || "";
  
  if (shippingCostInsideCairo !== undefined && shippingCostRegion1 !== undefined && shippingCostRegion2 !== undefined) {
    // 1. Cairo (Inside Cairo)
    if (normalizedCity === "cairo" || normalizedCity === "القاهرة" || normalizedCity === "القاهره") {
      return shippingCostInsideCairo || 0;
    }
    
    // 2. Region 1: Giza, Qalyubia (Greater Cairo except Cairo)
    const isRegion1 = [
      "giza", "جيزة", "الجيزة",
      "qalyubia", "قليوبية", "القليوبية"
    ].includes(normalizedCity);
    
    if (isRegion1) {
      return shippingCostRegion1 || 0;
    }
    
    // 3. Region 2: Everywhere else
    return shippingCostRegion2 || 0;
  }

  // Fallback to legacy logic
  const baseFees: Record<string, number> = {
    standard: 5,
    express: 15,
  };

  let fee = baseFees[methodEn] ?? 0;
  fee += (destinationSurcharges as any)[options.destination] ?? 10;

  const MAX_FREE_WEIGHT = 1; 
  const WEIGHT_SURCHARGE = 2; 

  if (weightKg > MAX_FREE_WEIGHT) {
    fee += (weightKg - MAX_FREE_WEIGHT) * WEIGHT_SURCHARGE;
  }

  return Math.max(0, fee);
}
