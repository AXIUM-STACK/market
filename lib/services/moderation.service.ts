import prisma from "@/lib/prisma";
import type { Prisma, ShopStatus } from "@/generated/prisma";

/**
 * Robust date arithmetic: adds N months to a date with end-of-month clamping.
 * Prevents rollover bugs (e.g. Jan 31 + 1 month = Feb 28/29, NOT March 2/3).
 */
export function addMonthsClamped(startDate: Date, months: number): Date {
  const result = new Date(startDate.getTime());
  const expectedMonth = (result.getMonth() + months) % 12;
  result.setMonth(result.getMonth() + months);

  if (result.getMonth() !== expectedMonth) {
    result.setDate(0);
  }
  return result;
}

/**
 * Checks if a shop's activity period has expired.
 */
export function isShopExpired(expiresAt: Date | string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}

/**
 * Checks if a shop is within its expiration warning window (e.g., within 30 days).
 */
export function isShopExpiringSoon(
  expiresAt: Date | string | null | undefined,
  daysThreshold = 30
): boolean {
  if (!expiresAt) return false;
  const expTime = new Date(expiresAt).getTime();
  const now = Date.now();
  const windowMs = daysThreshold * 24 * 60 * 60 * 1000;

  return expTime > now && expTime <= now + windowMs;
}

/**
 * Returns number of days remaining until expiration.
 * Negative if expired, null if no expiration date is defined.
 */
export function getShopDaysRemaining(
  expiresAt: Date | string | null | undefined
): number | null {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export type ComputedShopStatus =
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "PAUSED"
  | "SUSPENDED"
  | "BLOCKED"
  | "REJECTED";

/**
 * Determines the comprehensive, authoritative status of a shop.
 */
export function getShopAuthoritativeStatus(shop: {
  status: ShopStatus;
  expiresAt: Date | string | null;
}): {
  statusCode: ComputedShopStatus;
  label: string;
  isPubliclyVisible: boolean;
  daysRemaining: number | null;
} {
  const expired = isShopExpired(shop.expiresAt);
  const expiringSoon = isShopExpiringSoon(shop.expiresAt);
  const daysRemaining = getShopDaysRemaining(shop.expiresAt);

  if (shop.status === "PENDING_APPROVAL") {
    return {
      statusCode: "PENDING_APPROVAL",
      label: "En attente de validation",
      isPubliclyVisible: false,
      daysRemaining: null,
    };
  }

  if (shop.status === "REJECTED") {
    return {
      statusCode: "REJECTED",
      label: "Refusée",
      isPubliclyVisible: false,
      daysRemaining: null,
    };
  }

  if (shop.status === "BLOCKED") {
    return {
      statusCode: "BLOCKED",
      label: "Bloquée",
      isPubliclyVisible: false,
      daysRemaining: null,
    };
  }

  if (shop.status === "SUSPENDED") {
    return {
      statusCode: "SUSPENDED",
      label: "Suspendue",
      isPubliclyVisible: false,
      daysRemaining: null,
    };
  }

  if (shop.status === "EXPIRED" || (shop.status === "ACTIVE" && expired)) {
    return {
      statusCode: "EXPIRED",
      label: "Expirée",
      isPubliclyVisible: false,
      daysRemaining,
    };
  }

  if (shop.status === "PAUSED") {
    return {
      statusCode: "PAUSED",
      label: "En pause",
      isPubliclyVisible: false,
      daysRemaining,
    };
  }

  if (expiringSoon) {
    return {
      statusCode: "EXPIRING_SOON",
      label: `Expire bientôt (${daysRemaining}j)`,
      isPubliclyVisible: true,
      daysRemaining,
    };
  }

  return {
    statusCode: "ACTIVE",
    label: "Active & Validée",
    isPubliclyVisible: true,
    daysRemaining,
  };
}

/**
 * Returns Prisma where clause for shops that are officially approved, active, and unexpired.
 * This guarantees that expired or unapproved shops can NEVER be visible publicly.
 */
export function getActiveShopPublicWhere(now = new Date()): Prisma.ShopWhereInput {
  return {
    status: "ACTIVE",
    deletedAt: null,
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
}

/**
 * Returns Prisma where clause for active, unblocked products from active, unexpired shops.
 */
export function getActiveProductPublicWhere(now = new Date()): Prisma.ProductWhereInput {
  return {
    status: "ACTIVE",
    isBlocked: false,
    deletedAt: null,
    shop: getActiveShopPublicWhere(now),
  };
}

/**
 * Queries shops that will expire soon (default: within 30 days).
 */
export async function getExpiringShops(daysThreshold = 30) {
  const now = new Date();
  const maxDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

  return prisma.shop.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      expiresAt: {
        gt: now,
        lte: maxDate,
      },
    },
    include: {
      merchant: {
        select: { displayName: true, whatsappNumber: true },
      },
      _count: { select: { products: true } },
    },
    orderBy: { expiresAt: "asc" },
  });
}

/**
 * Queries shops whose activity period has passed.
 */
export async function getExpiredShops() {
  const now = new Date();

  return prisma.shop.findMany({
    where: {
      deletedAt: null,
      OR: [
        { status: "EXPIRED" },
        { status: "ACTIVE", expiresAt: { lte: now } },
      ],
    },
    include: {
      merchant: {
        select: { displayName: true, whatsappNumber: true },
      },
      _count: { select: { products: true } },
    },
    orderBy: { expiresAt: "desc" },
  });
}

/**
 * Batch updates shops whose expiresAt is past to status: EXPIRED in the database.
 */
export async function syncExpiredShopsStatus(): Promise<number> {
  const now = new Date();
  const result = await prisma.shop.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
      deletedAt: null,
    },
    data: {
      status: "EXPIRED",
    },
  });

  return result.count;
}
