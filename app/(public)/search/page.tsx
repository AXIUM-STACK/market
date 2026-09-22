import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import Link from "next/link";
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
  description: "Recherchez des articles et boutiques sur AXIUMarket.",
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
      <div className="axm-container py-16">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">
            Rechercher sur AXIUMarket
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Trouvez les articles et boutiques disponibles près de chez vous
          </p>
          <SearchInput placeholder="Entrez un produit (ex: iPhone, Robe, Sac de riz)..." autoFocus />

          {/* Quick Categories */}
          {categories.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200/80">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Parcourir les rayons
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="text-xs bg-white border border-slate-200 text-slate-700 hover:border-green-600 hover:text-green-800 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
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
    <div className="axm-container py-8 sm:py-10">
      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <SearchInput initialValue={q} placeholder="Rechercher des articles ou des boutiques..." />
      </div>

      {/* Results Header */}
      <div className="mb-6 pb-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {total > 0 ? (
            <>
              <span className="text-green-700">{total}</span> résultat{total !== 1 ? "s" : ""} pour &ldquo;{q}&rdquo;
            </>
          ) : (
            <>Aucun résultat pour &ldquo;{q}&rdquo;</>
          )}
        </h1>
        {total > 0 && (
          <span className="text-xs text-slate-400 font-medium">
            Page {page} sur {Math.max(1, totalPages)}
          </span>
        )}
      </div>

      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-slate-400 font-semibold mr-1">Filtrer par :</span>
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-semibold ${
              !categorySlug
                ? "border-green-600 bg-green-50 text-green-800 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            Tous
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/search?q=${encodeURIComponent(q)}&category=${cat.slug}`}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-semibold ${
                categorySlug === cat.slug
                  ? "border-green-600 bg-green-50 text-green-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {products.length === 0 ? (
        <EmptyState
          variant="search"
          description={`Aucun article trouvé pour "${q}". Essayez des mots-clés plus simples ou vérifiez l'orthographe.`}
          actionLabel="Voir tout le catalogue"
          actionHref="/products"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
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
                basePath="/search"
                searchParams={currentSearchParams}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
