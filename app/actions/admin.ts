"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/clerk";
import { addMonthsClamped, syncExpiredShopsStatus } from "@/lib/services/moderation.service";
import type { ActionResult } from "@/types";

/**
 * Approves a shop and sets its activity duration (1 to 12 months).
 */
export async function approveShop(
  shopId: string,
  durationMonths: number
): Promise<ActionResult<{ expiresAt: Date }>> {
  const { clerkUser } = await requireSuperAdmin();

  if (!durationMonths || durationMonths < 1 || durationMonths > 12) {
    return {
      success: false,
      error: "La durée d'activité doit être comprise entre 1 et 12 mois.",
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true, slug: true, status: true },
  });

  if (!shop) {
    return { success: false, error: "Boutique introuvable." };
  }

  const now = new Date();
  const expiresAt = addMonthsClamped(now, durationMonths);

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      status: "ACTIVE",
      approvedAt: now,
      expiresAt,
      activityMonths: durationMonths,
      rejectionReason: null,
      moderatedAt: now,
      moderatedBy: clerkUser.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/shops");
  revalidatePath("/dashboard/shops");
  revalidatePath("/shops");
  revalidatePath(`/shops/${shop.slug}`);

  return { success: true, data: { expiresAt } };
}

/**
 * Rejects a shop with an explanatory reason.
 */
export async function rejectShop(
  shopId: string,
  reason: string
): Promise<ActionResult<void>> {
  const { clerkUser } = await requireSuperAdmin();

  const trimmedReason = reason?.trim();
  if (!trimmedReason) {
    return {
      success: false,
      error: "Veuillez fournir un motif de refus explicatif.",
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true, slug: true },
  });

  if (!shop) {
    return { success: false, error: "Boutique introuvable." };
  }

  const now = new Date();

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      status: "REJECTED",
      rejectionReason: trimmedReason,
      moderatedAt: now,
      moderatedBy: clerkUser.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/shops");
  revalidatePath("/dashboard/shops");
  revalidatePath(`/shops/${shop.slug}`);

  return { success: true, data: undefined };
}

/**
 * Suspends a shop (temporary freeze).
 */
export async function suspendShop(
  shopId: string,
  reason?: string
): Promise<ActionResult<void>> {
  const { clerkUser } = await requireSuperAdmin();

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true, slug: true },
  });

  if (!shop) {
    return { success: false, error: "Boutique introuvable." };
  }

  const now = new Date();

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      status: "SUSPENDED",
      rejectionReason: reason?.trim() || "Boutique temporairement suspendue par la modération.",
      moderatedAt: now,
      moderatedBy: clerkUser.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/shops");
  revalidatePath("/dashboard/shops");
  revalidatePath("/shops");
  revalidatePath(`/shops/${shop.slug}`);

  return { success: true, data: undefined };
}

/**
 * Blocks a shop permanently.
 */
export async function blockShop(
  shopId: string,
  reason: string
): Promise<ActionResult<void>> {
  const { clerkUser } = await requireSuperAdmin();

  const trimmedReason = reason?.trim();
  if (!trimmedReason) {
    return {
      success: false,
      error: "Veuillez fournir un motif pour le blocage de la boutique.",
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true, slug: true },
  });

  if (!shop) {
    return { success: false, error: "Boutique introuvable." };
  }

  const now = new Date();

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      status: "BLOCKED",
      rejectionReason: trimmedReason,
      moderatedAt: now,
      moderatedBy: clerkUser.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/shops");
  revalidatePath("/dashboard/shops");
  revalidatePath("/shops");
  revalidatePath(`/shops/${shop.slug}`);

  return { success: true, data: undefined };
}

/**
 * Renews or extends a shop's activity period.
 */
export async function renewShopDuration(
  shopId: string,
  additionalMonths: number
): Promise<ActionResult<{ expiresAt: Date }>> {
  const { clerkUser } = await requireSuperAdmin();

  if (!additionalMonths || additionalMonths < 1 || additionalMonths > 12) {
    return {
      success: false,
      error: "La durée d'extension doit être comprise entre 1 et 12 mois.",
    };
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true, slug: true, expiresAt: true, status: true },
  });

  if (!shop) {
    return { success: false, error: "Boutique introuvable." };
  }

  const now = new Date();
  // If the shop hasn't expired yet, extend from its current expiration date.
  // If already expired or no previous expiration date, extend from now.
  const baseDate =
    shop.expiresAt && new Date(shop.expiresAt) > now
      ? new Date(shop.expiresAt)
      : now;

  const newExpiresAt = addMonthsClamped(baseDate, additionalMonths);

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      status: "ACTIVE",
      expiresAt: newExpiresAt,
      activityMonths: additionalMonths,
      moderatedAt: now,
      moderatedBy: clerkUser.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/shops");
  revalidatePath("/dashboard/shops");
  revalidatePath("/shops");
  revalidatePath(`/shops/${shop.slug}`);

  return { success: true, data: { expiresAt: newExpiresAt } };
}

/**
 * Reactivates a shop (e.g. from suspended, paused, or expired state).
 * If the shop is already expired or has no expiration date, durationMonths (1 to 12) can be assigned.
 */
export async function reactivateShop(
  shopId: string,
  durationMonths = 3
): Promise<ActionResult<{ expiresAt: Date }>> {
  const { clerkUser } = await requireSuperAdmin();

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true, slug: true, status: true, expiresAt: true, activityMonths: true },
  });

  if (!shop) {
    return { success: false, error: "Boutique introuvable." };
  }

  const now = new Date();
  const isCurrentlyExpired = !shop.expiresAt || new Date(shop.expiresAt) <= now;

  let newExpiresAt: Date;
  let finalMonths = shop.activityMonths || 3;

  if (isCurrentlyExpired) {
    finalMonths = durationMonths >= 1 && durationMonths <= 12 ? durationMonths : 3;
    newExpiresAt = addMonthsClamped(now, finalMonths);
  } else {
    newExpiresAt = new Date(shop.expiresAt!);
  }

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      status: "ACTIVE",
      expiresAt: newExpiresAt,
      activityMonths: finalMonths,
      rejectionReason: null,
      moderatedAt: now,
      moderatedBy: clerkUser.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/shops");
  revalidatePath("/dashboard/shops");
  revalidatePath("/shops");
  revalidatePath(`/shops/${shop.slug}`);

  return { success: true, data: { expiresAt: newExpiresAt } };
}

/**
 * Batch-synchronizes all shops whose activity period has passed to status: EXPIRED.
 */
export async function triggerSyncExpiredShops(): Promise<ActionResult<{ updatedCount: number }>> {
  await requireSuperAdmin();

  const updatedCount = await syncExpiredShopsStatus();

  revalidatePath("/admin");
  revalidatePath("/admin/shops");
  revalidatePath("/dashboard/shops");
  revalidatePath("/shops");

  return { success: true, data: { updatedCount } };
}

/**
 * Blocks a specific product from public view.
 */
export async function blockProduct(
  productId: string,
  reason: string
): Promise<ActionResult<void>> {
  const { clerkUser } = await requireSuperAdmin();

  const trimmedReason = reason?.trim();
  if (!trimmedReason) {
    return {
      success: false,
      error: "Veuillez fournir un motif de blocage pour ce produit.",
    };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, shop: { select: { slug: true } } },
  });

  if (!product) {
    return { success: false, error: "Produit introuvable." };
  }

  const now = new Date();

  await prisma.product.update({
    where: { id: productId },
    data: {
      isBlocked: true,
      blockedReason: trimmedReason,
      blockedAt: now,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath(`/shops/${product.shop.slug}`);

  return { success: true, data: undefined };
}

/**
 * Unblocks a previously blocked product.
 */
export async function unblockProduct(
  productId: string
): Promise<ActionResult<void>> {
  await requireSuperAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, slug: true, shop: { select: { slug: true } } },
  });

  if (!product) {
    return { success: false, error: "Produit introuvable." };
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      isBlocked: false,
      blockedReason: null,
      blockedAt: null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath(`/shops/${product.shop.slug}`);

  return { success: true, data: undefined };
}
