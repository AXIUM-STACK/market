import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentClerkId } from "@/lib/clerk";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import ProductCard from "@/components/products/ProductCard";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import ShareButton from "@/components/common/ShareButton";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import { buildImageKitUrl } from "@/lib/utils";
import { Store, Package, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
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
      `Découvrez les produits de la boutique ${shop.name} sur AXIUMarket.`,
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
    ? buildImageKitUrl(shop.logoUrl, { width: 100, height: 100 })
    : null;
  const coverUrl = shop.coverImageUrl
    ? buildImageKitUrl(shop.coverImageUrl, { width: 1200, height: 400, quality: 80 })
    : null;

  return (
    <div>
      {/* Shop Header / Cover */}
      <div className="relative">
        {/* Cover Image */}
        <div
          className="h-48 md:h-64 w-full relative overflow-hidden"
          style={{
            background: coverUrl
              ? undefined
              : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)",
          }}
        >
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Shop Info Overlay */}
        <div className="axm-container">
          <div className="flex items-end gap-4 -mt-8 relative z-10">
            {/* Logo */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`Logo de ${shop.name}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-50">
                  <Store className="w-8 h-8 text-green-600" aria-hidden="true" />
                </div>
              )}
            </div>

            {/* Name & Status */}
            <div className="pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                  {shop.name}
                </h1>
                {shop.merchant.isVerified && <VerifiedBadge />}
                {shop.status === "PAUSED" && (
                  <span className="badge badge-sm badge-paused border">Pausée</span>
                )}
              </div>
              {shop.merchant.displayName && (
                <p className="text-sm text-slate-500">
                  par {shop.merchant.displayName}
                </p>
              )}
            </div>
          </div>

          {/* Shop Meta */}
          <div className="mt-4 pb-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              {shop.description && (
                <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {shop.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" aria-hidden="true" />
                  {total} produit{total !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  Depuis {formatDate(shop.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
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
                label="Partager la boutique"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="axm-container py-8">
        <h2 className="text-lg font-bold text-slate-800 mb-5">
          Produits de la boutique
        </h2>
        {products.length === 0 ? (
          <EmptyState
            variant="products"
            title="Pas encore de produits"
            description="Cette boutique n'a pas encore publié de produits."
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
              basePath={`/shops/${slug}`}
            />
          </>
        )}
      </div>
    </div>
  );
}
