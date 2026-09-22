import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { getCurrentClerkId } from "@/lib/clerk";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import ProductCard from "@/components/products/ProductCard";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import ShareButton from "@/components/common/ShareButton";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import { buildImageKitUrl, formatDate } from "@/lib/utils";
import { Store, Package, Calendar } from "lucide-react";
import type { ProductCard as ProductCardType } from "@/types";

const PAGE_SIZE = 12;

interface ShopPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { slug } = await params;
  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: { name: true, description: true, coverImageUrl: true, logoUrl: true },
  });
  if (!shop) return { title: "Boutique introuvable | AXIUMarket" };

  const rawShareImage = shop.coverImageUrl || shop.logoUrl;
  const ogShareImage = rawShareImage
    ? buildImageKitUrl(rawShareImage, { width: 1200, height: 630, quality: 85, format: "jpg" })
    : undefined;

  return {
    title: `${shop.name} | AXIUMarket`,
    description:
      shop.description?.slice(0, 155) ??
      `Découvrez les produits de la boutique ${shop.name} sur AXIUMarket. Contact direct WhatsApp.`,
    openGraph: {
      title: `${shop.name} | AXIUMarket`,
      description: shop.description?.slice(0, 155) ?? "",
      images: ogShareImage
        ? [{ url: ogShareImage, width: 1200, height: 630, alt: shop.name }]
        : [],
    },
  };
}

export default async function ShopDetailPage({ params, searchParams }: ShopPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { merchant: true },
  });

  const isExpired = shop?.expiresAt ? new Date(shop.expiresAt) < new Date() : false;
  if (
    !shop ||
    shop.status === "ARCHIVED" ||
    shop.status === "REJECTED" ||
    shop.status === "BLOCKED" ||
    shop.status === "SUSPENDED" ||
    shop.status === "PENDING_APPROVAL" ||
    isExpired ||
    shop.deletedAt
  ) {
    notFound();
  }

  const [products, total, clerkId] = await Promise.all([
    prisma.product.findMany({
      where: { shopId: shop.id, status: "ACTIVE", isBlocked: false, deletedAt: null },
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
    prisma.product.count({ where: { shopId: shop.id, status: "ACTIVE", isBlocked: false, deletedAt: null } }),
    getCurrentClerkId(),
  ]);

  const favoriteIds = clerkId ? await getUserFavoriteIds() : new Set<string>();
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const logoUrl = shop.logoUrl
    ? buildImageKitUrl(shop.logoUrl, { width: 120, height: 120, quality: 80 })
    : null;
  const coverUrl = shop.coverImageUrl
    ? buildImageKitUrl(shop.coverImageUrl, { width: 1400, height: 400, quality: 80 })
    : null;

  return (
    <div>
      {/* Storefront Cover Banner */}
      <div className="relative">
        <div className="h-44 sm:h-60 md:h-72 w-full relative overflow-hidden bg-forest-950" style={{ backgroundColor: "var(--color-forest-950)" }}>
          {coverUrl && (
            <Image
              src={coverUrl}
              alt={`Couverture de ${shop.name}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Shop Info Overlay Card */}
        <div className="axm-container">
          <div className="relative z-10 -mt-12 sm:-mt-16 bg-white rounded-3xl border border-slate-200/90 shadow-[0_6px_25px_rgba(15,41,26,0.06)] p-5 sm:p-7">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              {/* Left: Avatar + Title */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl border-3 border-white shadow-md overflow-hidden bg-white shrink-0 -mt-10 sm:-mt-12">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={`Logo de ${shop.name}`}
                      width={88}
                      height={88}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-700">
                      <Store className="w-9 h-9" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      {shop.name}
                    </h1>
                    {shop.merchant.isVerified && <VerifiedBadge size="md" />}
                    {shop.status === "PAUSED" && (
                      <span className="badge badge-sm badge-paused border">Pausée</span>
                    )}
                  </div>
                  {shop.merchant.displayName && (
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      Gérant : {shop.merchant.displayName}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                <WhatsAppButton
                  variant="shop"
                  shopName={shop.name}
                  whatsappNumber={shop.merchant.whatsappNumber}
                  size="md"
                />
                <ShareButton
                  details={{
                    type: "shop",
                    name: shop.name,
                    merchantName: shop.merchant.displayName || undefined,
                    totalProducts: total,
                    description: shop.description,
                    imageUrl: shop.coverImageUrl
                      ? buildImageKitUrl(shop.coverImageUrl, { width: 1200, height: 600, quality: 85 })
                      : shop.logoUrl
                      ? buildImageKitUrl(shop.logoUrl, { width: 500, height: 500, quality: 85 })
                      : null,
                    url: `/shops/${shop.slug}`,
                  }}
                  size="md"
                  label="Partager"
                />
              </div>
            </div>

            {/* Shop Bio & Stats */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
              {shop.description && (
                <p className="text-slate-600 leading-relaxed max-w-2xl text-xs sm:text-sm">
                  {shop.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs shrink-0">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Package className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  {total} article{total !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  Membre depuis {formatDate(shop.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Catalog Grid */}
      <div className="axm-container py-10">
        <div className="mb-6 pb-3 border-b border-slate-200/80 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Rayon de la boutique ({total})
          </h2>
        </div>

        {products.length === 0 ? (
          <EmptyState
            variant="products"
            title="Aucun article en rayon"
            description="Cette boutique n'a pas encore publié d'articles actifs."
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
                  basePath={`/shops/${slug}`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
