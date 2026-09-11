/**
 * AXIUMarket — Shared TypeScript Types
 *
 * These types are derived from Prisma models to avoid duplication.
 * Import from here, not from individual Prisma client types directly.
 */

import type {
  Product,
  ProductImage,
  Shop,
  MerchantProfile,
  Category,
  Favorite,
  ShopStatus,
  ProductStatus,
  UserRole,
} from "@/generated/prisma";

// Re-export enums for convenience
export type { ShopStatus, ProductStatus, UserRole };

// ============================================================
// PRODUCT TYPES
// ============================================================

/** Product with its primary image and shop info (for cards) */
export type ProductCard = Product & {
  images: Pick<ProductImage, "url" | "altText" | "sortOrder">[];
  shop: Pick<Shop, "id" | "name" | "slug" | "logoUrl" | "status"> & {
    merchant: Pick<MerchantProfile, "isVerified" | "whatsappNumber">;
  };
  category: Pick<Category, "id" | "name" | "slug"> | null;
  _count: { favorites: number };
};

/** Full product detail with all relations */
export type ProductDetail = Product & {
  images: ProductImage[];
  shop: Shop & {
    merchant: MerchantProfile;
  };
  category: Category | null;
  _count: { favorites: number };
};

// ============================================================
// SHOP TYPES
// ============================================================

/** Shop with product count and merchant info (for listing cards) */
export type ShopCard = Shop & {
  merchant: Pick<MerchantProfile, "isVerified" | "whatsappNumber" | "displayName">;
  _count: { products: number };
};

/** Full shop profile with products and merchant */
export type ShopDetail = Shop & {
  merchant: MerchantProfile;
  products: ProductCard[];
  _count: { products: number };
};

// ============================================================
// CATEGORY TYPES
// ============================================================

export type CategoryWithCount = Category & {
  _count: { products: number };
  children: Pick<Category, "id" | "name" | "slug">[];
};

// ============================================================
// FAVORITE TYPES
// ============================================================

export type FavoriteWithProduct = Favorite & {
  product: ProductCard;
};

// ============================================================
// SEARCH / FILTER TYPES
// ============================================================

export interface ProductFilters {
  categorySlug?: string;
  shopSlug?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  q?: string;
}

export type ProductSortOption =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "popular";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ============================================================
// SERVER ACTION RESULTS
// ============================================================

export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ============================================================
// IMAGEKIT UPLOAD TYPES
// ============================================================

export interface ImageKitUploadResult {
  imagekitFileId: string;
  url: string;
  filePath: string;
  fileName: string;
  width: number;
  height: number;
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface MerchantDashboardStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  totalShops: number;
  activeShops: number;
  totalViews: number;
}
