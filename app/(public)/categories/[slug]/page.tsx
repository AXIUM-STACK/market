import type { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentClerkId } from "@/lib/clerk";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import ProductCard from "@/components/products/ProductCard";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import type { ProductCard as ProductCardType } from "@/types";
import type { Prisma } from "@/generated/prisma";

const PAGE_SIZE = 20;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  if (!category) return { title: "Catégorie introuvable | AXIUMarket" };
  return {
    title: `${category.name} | AXIUMarket`,
    description:
      category.description ??
      `Découvrez tous les produits de la catégorie ${category.name} sur AXIUMarket.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: { children: { where: { isActive: true } } },
  });

  if (!category) notFound();

  // Include products from this category AND its subcategories
  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const now = new Date();
  const where: Prisma.ProductWhereInput = {
    categoryId: { in: categoryIds },
    status: "ACTIVE",
    isBlocked: false,
    deletedAt: null,
    shop: {
      status: "ACTIVE",
      deletedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  };

  const [products, total, clerkId] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: {
          select: { url: true, altText: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        shop: {
          select: {
            id: true, name: true, slug: true, logoUrl: true, status: true,
            merchant: { select: { isVerified: true, whatsappNumber: true } },
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    getCurrentClerkId(),
  ]);

  const favoriteIds = clerkId ? await getUserFavoriteIds() : new Set<string>();
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="axm-container py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {category.description}
          </p>
        )}
        <p className="text-sm text-slate-400 mt-1">
          {total} produit{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {category.children.map((child) => (
            <a
              key={child.id}
              href={`/categories/${child.slug}`}
              className="text-sm border border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-700 px-3 py-1.5 rounded-full transition-colors"
            >
              {child.name}
            </a>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          variant="products"
          title="Pas de produits dans cette catégorie"
          description="Aucun produit actif trouvé dans cette catégorie pour le moment."
          actionLabel="Voir tous les produits"
          actionHref="/products"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product as unknown as ProductCardType}
                currentUserId={clerkId}
                isFavorited={favoriteIds.has(product.id)}
              />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/categories/${slug}`}
          />
        </>
      )}
    </div>
  );
}
