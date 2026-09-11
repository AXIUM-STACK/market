"use server";

import prisma from "@/lib/prisma";
import { getCurrentClerkId } from "@/lib/clerk";
import type { ActionResult } from "@/types";

/**
 * Toggles a product favorite for the current user.
 * - Creates if not exists
 * - Deletes if exists
 *
 * Security: user identity derived from Clerk on the server.
 */
export async function toggleFavorite(
  productId: string
): Promise<ActionResult<{ isFavorited: boolean }>> {
  const clerkId = await getCurrentClerkId();

  if (!clerkId) {
    return { success: false, error: "UNAUTHORIZED" };
  }

  // Get or create the Prisma user
  let dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: { clerkId },
      select: { id: true },
    });
  }

  // Check product exists
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!product) {
    return { success: false, error: "NOT_FOUND" };
  }

  // Check existing favorite
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId: dbUser.id,
        productId,
      },
    },
  });

  if (existing) {
    // Remove favorite
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
    return { success: true, data: { isFavorited: false } };
  } else {
    // Create favorite
    await prisma.favorite.create({
      data: {
        userId: dbUser.id,
        productId,
      },
    });
    return { success: true, data: { isFavorited: true } };
  }
}

/**
 * Returns the set of favorited product IDs for the current user.
 * Returns empty set if not authenticated.
 */
export async function getUserFavoriteIds(): Promise<Set<string>> {
  const clerkId = await getCurrentClerkId();
  if (!clerkId) return new Set();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!dbUser) return new Set();

  const favorites = await prisma.favorite.findMany({
    where: { userId: dbUser.id },
    select: { productId: true },
  });

  return new Set(favorites.map((f) => f.productId));
}
