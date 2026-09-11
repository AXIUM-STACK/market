"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/clerk";
import { ProductSchema, ProductUpdateSchema } from "@/lib/validations/product.schema";
import { slugify, ensureAbsoluteImageUrl } from "@/lib/utils";
import type { ActionResult, ImageKitUploadResult } from "@/types";
import type { Product } from "@/generated/prisma";

/**
 * Creates a new product for a merchant's shop.
 * Security: auth → DB user → shop ownership → Zod → Prisma
 */
export async function createProduct(
  formData: FormData
): Promise<ActionResult<Product>> {
  const dbUser = await getOrCreateDbUser();

  const shopId = formData.get("shopId") as string;

  // Ownership check — shop must belong to this merchant
  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
      merchant: { userId: dbUser.id },
      deletedAt: null,
    },
    select: { id: true, slug: true },
  });

  if (!shop) {
    return { success: false, error: "Boutique introuvable ou accès refusé." };
  }

  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string | null,
    price: formData.get("price") as string,
    currency: (formData.get("currency") as string) || "CDF",
    stockQuantity: parseInt((formData.get("stockQuantity") as string) || "0", 10),
    categoryId: (formData.get("categoryId") as string) || null,
    shopId,
    status: (formData.get("status") as string) || "DRAFT",
    isFeatured: formData.get("isFeatured") === "true",
  };

  const validation = ProductSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // Generate unique slug within shop
  const baseSlug = slugify(validation.data.name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { shopId_slug: { shopId, slug } },
      select: { id: true },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  const product = await prisma.product.create({
    data: {
      shopId,
      categoryId: validation.data.categoryId || null,
      name: validation.data.name,
      slug,
      description: validation.data.description,
      price: validation.data.price,
      currency: validation.data.currency,
      stockQuantity: validation.data.stockQuantity,
      status: validation.data.status as "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED",
      isFeatured: validation.data.isFeatured,
    },
  });

  revalidatePath("/dashboard/products");
  revalidatePath("/products");

  return { success: true, data: product };
}

/**
 * Updates an existing product.
 * Security: auth → shop ownership → Zod → Prisma
 */
export async function updateProduct(
  productId: string,
  formData: FormData
): Promise<ActionResult<Product>> {
  const dbUser = await getOrCreateDbUser();

  // Ownership check via shop relation
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shop: { merchant: { userId: dbUser.id } },
      deletedAt: null,
    },
    select: { id: true, shopId: true, slug: true, shop: { select: { slug: true } } },
  });

  if (!product) {
    return { success: false, error: "Produit introuvable ou accès refusé." };
  }

  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string | null,
    price: formData.get("price") as string,
    currency: (formData.get("currency") as string) || "CDF",
    stockQuantity: parseInt((formData.get("stockQuantity") as string) || "0", 10),
    categoryId: (formData.get("categoryId") as string) || null,
    shopId: product.shopId,
    status: (formData.get("status") as string) || "DRAFT",
    isFeatured: formData.get("isFeatured") === "true",
  };

  const validation = ProductUpdateSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      name: validation.data.name,
      description: validation.data.description,
      price: validation.data.price,
      currency: validation.data.currency,
      stockQuantity: validation.data.stockQuantity,
      categoryId: validation.data.categoryId || null,
      status: validation.data.status as "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED",
      isFeatured: validation.data.isFeatured,
    },
  });

  revalidatePath("/dashboard/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath(`/shops/${product.shop.slug}`);

  return { success: true, data: updated };
}

/**
 * Archives a product (soft-equivalent via status).
 * Does NOT delete the product from the DB.
 */
export async function archiveProduct(
  productId: string
): Promise<ActionResult<void>> {
  const dbUser = await getOrCreateDbUser();

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shop: { merchant: { userId: dbUser.id } },
      deletedAt: null,
    },
    select: { id: true, shop: { select: { slug: true } } },
  });

  if (!product) {
    return { success: false, error: "Produit introuvable ou accès refusé." };
  }

  await prisma.product.update({
    where: { id: productId },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/dashboard/products");
  revalidatePath(`/shops/${product.shop.slug}`);

  return { success: true, data: undefined };
}

/**
 * Adds product images to a product (after ImageKit upload).
 * Ownership verified before any DB write.
 */
export async function addProductImages(
  productId: string,
  images: (ImageKitUploadResult & { altText?: string; sortOrder: number })[]
): Promise<ActionResult<void>> {
  const dbUser = await getOrCreateDbUser();

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shop: { merchant: { userId: dbUser.id } },
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!product) {
    return { success: false, error: "Produit introuvable ou accès refusé." };
  }

  await prisma.productImage.createMany({
    data: images.map((img) => ({
      productId,
      imagekitFileId: img.imagekitFileId,
      url: ensureAbsoluteImageUrl(img.url) || img.url,
      filePath: img.filePath,
      fileName: img.fileName,
      width: img.width,
      height: img.height,
      altText: img.altText ?? null,
      sortOrder: img.sortOrder,
    })),
  });

  revalidatePath("/dashboard/products");

  return { success: true, data: undefined };
}

/**
 * Deletes a product image. Verifies product ownership.
 */
export async function deleteProductImage(
  imageId: string
): Promise<ActionResult<void>> {
  const dbUser = await getOrCreateDbUser();

  const image = await prisma.productImage.findFirst({
    where: {
      id: imageId,
      product: {
        shop: { merchant: { userId: dbUser.id } },
        deletedAt: null,
      },
    },
    select: { id: true },
  });

  if (!image) {
    return { success: false, error: "Image introuvable ou accès refusé." };
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  revalidatePath("/dashboard/products");

  return { success: true, data: undefined };
}

/**
 * Increments the view count for a product (no auth required).
 */
export async function incrementProductView(productId: string): Promise<void> {
  await prisma.product.update({
    where: { id: productId },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {
    // Non-critical — silently fail if product doesn't exist
  });
}
