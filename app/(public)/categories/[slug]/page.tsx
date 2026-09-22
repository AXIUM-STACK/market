import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentClerkId } from "@/lib/clerk";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import ProductCard from "@/components/products/ProductCard";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import { ChevronRight } from "lucide-react";
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
  if (!category) return { title: "Rayon introuvable | AXIUMarket" };
  return {
    title: `${category.name} | AXIUMarket`,
    description:
      category.description ??
      `Découvrez tous les articles du rayon ${category.name} sur AXIUMarket.`,
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
    <div className="axm-container py-8 sm:py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-6 flex-wrap" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-green-700 transition-colors">Accueil</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/products" className="hover:text-green-700 transition-colors">Produits</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-8 pb-5 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Rayon : {category.name}
        </h1>
        {category.description && (
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            {category.description}
          </p>
        )}
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-medium">
          {total} article{total !== 1 ? "s" : ""} référencé{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-slate-400 font-semibold mr-1">Sous-catégories :</span>
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/categories/${child.slug}`}
              className="text-xs border border-slate-200 bg-white text-slate-700 hover:border-green-600 hover:text-green-800 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState
          variant="products"
          title="Aucun article dans ce rayon"
          description="Aucun produit actif n'est disponible dans cette catégorie pour le moment."
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
                basePath={`/categories/${slug}`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
