"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/clerk";
import { ShopSchema, ShopUpdateSchema } from "@/lib/validations/shop.schema";
import { slugify, ensureAbsoluteImageUrl } from "@/lib/utils";
import type { ActionResult } from "@/types";
import type { Shop } from "@/generated/prisma";

/**
 * Creates a new shop for the current merchant.
 */
export async function createShop(
  formData: FormData
): Promise<ActionResult<Shop>> {
  const dbUser = await getOrCreateDbUser();

  // Ensure merchant profile exists
  const merchantProfile = await prisma.merchantProfile.findUnique({
    where: { userId: dbUser.id },
    select: { id: true },
  });

  if (!merchantProfile) {
    return {
      success: false,
      error: "Vous devez d'abord créer votre profil marchand.",
    };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug:
      (formData.get("slug") as string) || slugify(formData.get("name") as string),
    description: formData.get("description") as string | null,
    logoUrl: (formData.get("logoUrl") as string) || null,
    coverImageUrl: (formData.get("coverImageUrl") as string) || null,
    status: "PENDING_APPROVAL",
  };

  const validation = ShopSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // Check slug uniqueness
  const existingSlug = await prisma.shop.findUnique({
    where: { slug: validation.data.slug },
    select: { id: true },
  });

  if (existingSlug) {
    return {
      success: false,
      error: "Ce slug est déjà utilisé. Choisissez un autre.",
      fieldErrors: { slug: ["Ce slug est déjà utilisé."] },
    };
  }

  const shop = await prisma.shop.create({
    data: {
      merchantId: merchantProfile.id,
      name: validation.data.name,
      slug: validation.data.slug,
      description: validation.data.description,
      logoUrl: ensureAbsoluteImageUrl(validation.data.logoUrl),
      coverImageUrl: ensureAbsoluteImageUrl(validation.data.coverImageUrl),
      status: "PENDING_APPROVAL",
    },
  });

  revalidatePath("/dashboard/shops");
  revalidatePath("/shops");

  return { success: true, data: shop };
}

/**
 * Updates a shop — verifies ownership before mutating.
 */
export async function updateShop(
  shopId: string,
  formData: FormData
): Promise<ActionResult<Shop>> {
  const dbUser = await getOrCreateDbUser();

  // Ownership check
  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
      merchant: { userId: dbUser.id },
    },
    select: { id: true, slug: true, status: true, expiresAt: true },
  });

  if (!shop) {
    return { success: false, error: "Boutique introuvable ou accès refusé." };
  }

  const requestedStatus = formData.get("status") as string | null;

  // Determine allowed status update for the merchant
  let finalStatus = shop.status;
  if (requestedStatus && requestedStatus !== shop.status) {
    const isExpired = shop.expiresAt ? new Date(shop.expiresAt) < new Date() : false;

    // Only allow toggling between ACTIVE and PAUSED if already approved and not expired
    if ((shop.status === "ACTIVE" || shop.status === "PAUSED") && !isExpired) {
      if (requestedStatus === "ACTIVE" || requestedStatus === "PAUSED") {
        finalStatus = requestedStatus;
      }
    }
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string | null,
    logoUrl: (formData.get("logoUrl") as string) || null,
    coverImageUrl: (formData.get("coverImageUrl") as string) || null,
    status: finalStatus,
  };

  const validation = ShopUpdateSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // Check slug uniqueness (if changed)
  if (validation.data.slug && validation.data.slug !== shop.slug) {
    const existingSlug = await prisma.shop.findUnique({
      where: { slug: validation.data.slug },
      select: { id: true },
    });

    if (existingSlug && existingSlug.id !== shopId) {
      return {
        success: false,
        error: "Ce slug est déjà utilisé.",
        fieldErrors: { slug: ["Ce slug est déjà utilisé."] },
      };
    }
  }

  const updatedShop = await prisma.shop.update({
    where: { id: shopId },
    data: {
      ...(validation.data.name && { name: validation.data.name }),
      ...(validation.data.slug && { slug: validation.data.slug }),
      ...(validation.data.description !== undefined && {
        description: validation.data.description,
      }),
      ...(validation.data.logoUrl !== undefined && {
        logoUrl: ensureAbsoluteImageUrl(validation.data.logoUrl),
      }),
      ...(validation.data.coverImageUrl !== undefined && {
        coverImageUrl: ensureAbsoluteImageUrl(validation.data.coverImageUrl),
      }),
      status: finalStatus,
    },
  });

  revalidatePath("/dashboard/shops");
  revalidatePath(`/shops/${updatedShop.slug}`);

  return { success: true, data: updatedShop };
}

/**
 * Updates shop images (logo or cover).
 * Ownership is verified before any update.
 */
export async function updateShopImages(
  shopId: string,
  images: { logoUrl?: string; coverImageUrl?: string }
): Promise<ActionResult<void>> {
  const dbUser = await getOrCreateDbUser();

  const shop = await prisma.shop.findFirst({
    where: { id: shopId, merchant: { userId: dbUser.id } },
    select: { id: true, slug: true },
  });

  if (!shop) {
    return { success: false, error: "Boutique introuvable ou accès refusé." };
  }

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      ...(images.logoUrl !== undefined && {
        logoUrl: ensureAbsoluteImageUrl(images.logoUrl),
      }),
      ...(images.coverImageUrl !== undefined && {
        coverImageUrl: ensureAbsoluteImageUrl(images.coverImageUrl),
      }),
    },
  });

  revalidatePath(`/shops/${shop.slug}`);
  revalidatePath("/dashboard/shops");

  return { success: true, data: undefined };
}
