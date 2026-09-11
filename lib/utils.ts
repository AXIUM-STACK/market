/**
 * AXIUMarket — Shared Utilities
 */

/**
 * Formats a Decimal/number price with the appropriate currency.
 * Uses Intl.NumberFormat for locale-aware formatting.
 */
export function formatPrice(
  price: number | string | { toString(): string },
  currency = "CDF"
): string {
  const numericPrice = typeof price === "number" ? price : parseFloat(price.toString());

  if (isNaN(numericPrice)) return "—";

  // Map ISO 4217 currency codes to their locales
  const currencyLocaleMap: Record<string, string> = {
    CDF: "fr-CD",
    USD: "en-US",
    EUR: "fr-FR",
    XAF: "fr-CM",
    XOF: "fr-SN",
    ZAR: "en-ZA",
    NGN: "en-NG",
    GHS: "en-GH",
    KES: "en-KE",
  };

  const locale = currencyLocaleMap[currency] ?? "fr-CD";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericPrice);
  } catch {
    // Fallback if currency code is unrecognized
    return `${numericPrice.toLocaleString("fr")} ${currency}`;
  }
}

/**
 * Generates a URL-safe slug from arbitrary text.
 * Handles accented characters common in Francophone text.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Combines class names (lightweight cn utility — no clsx dependency needed).
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Truncates text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Formats a date in a human-readable French locale format.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-CD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Formats a date as relative time (e.g., "il y a 3 jours").
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? "s" : ""}`;
  if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
  return `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? "s" : ""}`;
}

/**
 * Builds a full ImageKit-optimized image URL.
 * Supports ImageKit transformation query parameters (e.g., ?tr=w-640,c-at_max).
 * Example: https://ik.imagekit.io/rartheophile/events/image.jpg?tr=w-640,c-at_max
 */
export function buildImageKitUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "jpg" | "png";
    crop?: "at_max" | "maintain_ratio" | "force";
  } = {}
): string {
  if (!url || !url.includes("ik.imagekit.io")) return url;

  const transformations: string[] = [];

  if (options.width) transformations.push(`w-${options.width}`);
  if (options.height) transformations.push(`h-${options.height}`);
  if (options.quality) transformations.push(`q-${options.quality}`);
  if (options.format) transformations.push(`f-${options.format}`);
  if (options.crop) transformations.push(`c-${options.crop}`);

  if (transformations.length === 0) return url;

  const transformStr = transformations.join(",");

  try {
    const urlObj = new URL(url);
    // Clean up any existing path-based /tr:... if present
    urlObj.pathname = urlObj.pathname.replace(/\/tr:[^/]+/, "");
    // Set query-based transformation (?tr=w-640,c-at_max)
    urlObj.searchParams.set("tr", transformStr);
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Returns a placeholder image URL for products without images.
 */
export function getProductImagePlaceholder(): string {
  return "/placeholder-product.svg";
}

/**
 * Returns a placeholder image URL for shops without logos.
 */
export function getShopLogoPlaceholder(): string {
  return "/placeholder-shop.svg";
}

/**
 * Checks if a shop's activity period has expired.
 */
export function isShopExpired(expiresAt: Date | string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

/**
 * Returns the number of days remaining until expiration.
 * Returns negative number if already expired, or null if no expiration set.
 */
export function getDaysUntilExpiration(expiresAt: Date | string | null | undefined): number | null {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Ensures an image URL stored in the database is always a full absolute URL
 * (e.g. https://ik.imagekit.io/rartheophile/...) and never a local relative project path.
 */
export function ensureAbsoluteImageUrl(url?: string | null): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const endpoint =
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
    "https://ik.imagekit.io/rartheophile";

  return `${endpoint.replace(/\/$/, "")}/${trimmed.replace(/^\//, "")}`;
}


