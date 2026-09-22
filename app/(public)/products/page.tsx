import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getCurrentClerkId } from "@/lib/clerk";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import ProductCard from "@/components/products/ProductCard";
import ProductFiltersPanel from "@/components/products/FilterPanel";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/common/EmptyState";
import type { ProductCard as ProductCardType, ProductSortOption } from "@/types";
import type { Prisma } from "@/generated/prisma";

export const metadata: Metadata = {
  title: "Catalogue des produits | AXIUMarket",
  description: "Explorez tous les articles disponibles dans les boutiques de proximité sur AXIUMarket.",
};

const PAGE_SIZE = 20;

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    shop?: string;
    sort?: string;
    q?: string;
    inStock?: string;
    featured?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const sort: ProductSortOption = (params.sort as ProductSortOption) ?? "newest";
  const categorySlug = params.category;
  const shopSlug = params.shop;
  const q = params.q;
  const inStock = params.inStock === "true";
  const featured = params.featured === "true";

  const skip = (page - 1) * PAGE_SIZE;

  const now = new Date();
  // Build where clause
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    isBlocked: false,
    deletedAt: null,
    shop: {
      status: "ACTIVE",
      deletedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(shopSlug && { shop: { slug: shopSlug } }),
    ...(inStock && { stockQuantity: { gt: 0 } }),
    ...(featured && { isFeatured: true }),
  };

  // Build orderBy
  const orderByMap: Record<ProductSortOption, Prisma.ProductOrderByWithRelationInput[]> = {
    newest: [{ createdAt: "desc" }],
    oldest: [{ createdAt: "asc" }],
    price_asc: [{ price: "asc" }],
    price_desc: [{ price: "desc" }],
    popular: [{ viewCount: "desc" }, { createdAt: "desc" }],
  };

  const [products, total, categories, clerkId] = await Promise.all([
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
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            status: true,
            merchant: {
              select: { isVerified: true, whatsappNumber: true },
            },
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: orderByMap[sort],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    getCurrentClerkId(),
  ]);

  const favoriteIds = clerkId ? await getUserFavoriteIds() : new Set<string>();
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const currentSearchParams: Record<string, string> = {};
  if (sort !== "newest") currentSearchParams.sort = sort;
  if (categorySlug) currentSearchParams.category = categorySlug;
  if (shopSlug) currentSearchParams.shop = shopSlug;
  if (q) currentSearchParams.q = q;
  if (inStock) currentSearchParams.inStock = "true";
  if (featured) currentSearchParams.featured = "true";

  return (
    <div className="axm-container py-8 sm:py-10">
      {/* Catalog Title Header */}
      <div className="mb-6 sm:mb-8 pb-5 border-b border-slate-200/80">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          {q ? `Résultats pour "${q}"` : featured ? "Articles en vedette" : "Tous les produits"}
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          {total} article{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""} en magasin
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Sticky Filters Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24">
          <ProductFiltersPanel
            categories={categories}
            currentSort={sort}
            currentCategory={categorySlug}
            currentInStock={inStock}
          />
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0 w-full">
          {products.length === 0 ? (
            <EmptyState
              variant="products"
              title="Aucun article trouvé"
              description="Aucun produit ne correspond à ces critères dans les boutiques actives."
              actionLabel="Voir tout le catalogue"
              actionHref="/products"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product as unknown as ProductCardType}
                    currentUserId={clerkId}
                    isFavorited={favoriteIds.has(product.id)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    basePath="/products"
                    searchParams={currentSearchParams}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
