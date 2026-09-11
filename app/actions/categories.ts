"use server";

import prisma from "@/lib/prisma";
import type { CategoryWithCount } from "@/types";

/**
 * Returns all active categories with product counts.
 * Used for homepage category grid, filter panel, and product forms.
 */
export async function getActiveCategories(): Promise<CategoryWithCount[]> {
  return prisma.category.findMany({
    where: { isActive: true, parentId: null }, // Top-level only
    include: {
      _count: { select: { products: true } },
      children: {
        select: { id: true, name: true, slug: true },
        where: { isActive: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  }) as Promise<CategoryWithCount[]>;
}

/**
 * Returns all categories including subcategories (for flat list).
 */
export async function getAllCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, parentId: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
}
