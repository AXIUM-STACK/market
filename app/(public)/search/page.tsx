import type { Metadata } from "next";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { getCurrentClerkId } from "@/lib/clerk";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import ProductCard from "@/components/products/ProductCard";
import SearchInput from "@/components/common/SearchInput";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import type { ProductCard as ProductCardType } from "@/types";
import type { Prisma } from "@/generated/prisma";

export const metadata: Metadata = {
  title: "Rechercher | AXIUMarket",
  description: "Recherchez des produits et boutiques sur AXIUMarket.",
};

const PAGE_SIZE = 20;

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string; category?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const categorySlug = params.category;
  const skip = (page - 1) * PAGE_SIZE;

  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  if (!q) {
    return (
      <div className="axm-container py-12">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2 text-center">
            Rechercher sur AXIUMarket
          </h1>
          <p className="text-slate-500 text-sm text-center mb-8">
            Produits, boutiques, catégories...
          </p>
          <SearchInput placeholder="Que cherchez-vous ?" autoFocus />
        </div>
      </div>
    );
  }

  const now = new Date();
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    isBlocked: false,
    deletedAt: null,
    shop: {
      status: "ACTIVE",
      deletedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    OR: [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { shop: { name: { contains: q, mode: "insensitive" } } },
    ],
    ...(categorySlug && { category: { slug: categorySlug } }),
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
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    getCurrentClerkId(),
  ]);

  const favoriteIds = clerkId ? await getUserFavoriteIds() : new Set<string>();
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const currentSearchParams: Record<string, string> = { q };
  if (categorySlug) currentSearchParams.category = categorySlug;

  return (
    <div className="axm-container py-8">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <SearchInput initialValue={q} placeholder="Rechercher des produits..." />
      </div>

      {/* Results Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          {total > 0 ? (
            <>
              <span style={{ color: "var(--color-brand-green)" }}>{total}</span>{" "}
              résultat{total !== 1 ? "s" : ""} pour &ldquo;{q}&rdquo;
            </>
          ) : (
            <>Aucun résultat pour &ldquo;{q}&rdquo;</>
          )}
        </h1>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <a
            href={`/search?q=${encodeURIComponent(q)}`}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              !categorySlug
                ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                : "border-slate-200 text-slate-600 hover:border-green-400"
            }`}
          >
            Tous
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/search?q=${encodeURIComponent(q)}&category=${cat.slug}`}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                categorySlug === cat.slug
                  ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                  : "border-slate-200 text-slate-600 hover:border-green-400"
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>
      )}

      {/* Results */}
      {products.length === 0 ? (
        <EmptyState
          variant="search"
          description={`Aucun produit trouvé pour "${q}". Essayez des mots-clés différents.`}
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
            basePath="/search"
            searchParams={currentSearchParams}
          />
        </>
      )}
    </div>
  );
}
