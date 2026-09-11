import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentClerkId } from "@/lib/clerk";
import { incrementProductView } from "@/app/actions/products";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import WhatsAppButton from "@/components/common/WhatsAppButton";
import FavoriteButton from "@/components/common/FavoriteButton";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import ProductGallery from "@/components/products/ProductGallery";
import { formatPrice, formatRelativeDate, buildImageKitUrl } from "@/lib/utils";
import { Package, Store, Tag, ArrowLeft } from "lucide-react";
import ShareButton from "@/components/common/ShareButton";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  const now = new Date();
  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      isBlocked: false,
      deletedAt: null,
      shop: {
        status: "ACTIVE",
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    },
    select: {
      name: true,
      description: true,
      images: { select: { url: true }, take: 1 },
      shop: { select: { name: true } },
    },
  });

  if (!product) return { title: "Produit introuvable | AXIUMarket" };

  const rawImageUrl = product.images[0]?.url;
  const ogImageUrl = rawImageUrl
    ? buildImageKitUrl(rawImageUrl, { width: 800, height: 600, quality: 85, format: "jpg" })
    : undefined;

  return {
    title: `${product.name} — ${product.shop.name} | AXIUMarket`,
    description:
      product.description?.slice(0, 155) ??
      `Découvrez ${product.name} disponible chez ${product.shop.name} sur AXIUMarket.`,
    openGraph: {
      title: `${product.name} — ${product.shop.name} | AXIUMarket`,
      description: product.description?.slice(0, 155) ?? "",
      images: ogImageUrl
        ? [{ url: ogImageUrl, width: 800, height: 600, alt: product.name }]
        : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const now = new Date();

  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
      isBlocked: false,
      deletedAt: null,
      shop: {
        status: "ACTIVE",
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      shop: {
        include: { merchant: true },
      },
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { favorites: true } },
    },
  });

  if (!product) notFound();

  // Increment view count (non-blocking)
  incrementProductView(product.id);

  const [clerkId] = await Promise.all([getCurrentClerkId()]);
  const favoriteIds = clerkId ? await getUserFavoriteIds() : new Set<string>();
  const isFavorited = favoriteIds.has(product.id);

  const { shop } = product;
  const merchant = shop.merchant;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? "",
    image: product.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: product.price.toString(),
      priceCurrency: product.currency,
      availability:
        product.status === "ACTIVE"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    seller: {
      "@type": "Organization",
      name: shop.name,
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="axm-container py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-green-600 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-green-600 transition-colors">Produits</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-green-600 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-700 truncate max-w-[150px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Gallery */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-5">
            {/* Category */}
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full w-fit hover:bg-green-100 transition-colors"
              >
                <Tag className="w-3 h-3" aria-hidden="true" />
                {product.category.name}
              </Link>
            )}

            {/* Product Name */}
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-snug mb-2">
                {product.name}
              </h1>
              {product.isFeatured && (
                <span className="inline-block text-xs font-semibold bg-amber-100 border border-amber-300 text-amber-800 px-2.5 py-1 rounded-full">
                  ⭐ Produit à la une
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="price-display-lg">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.stockQuantity > 0 ? (
                <span className="badge badge-sm badge-active border">En stock</span>
              ) : (
                <span className="badge badge-sm badge-out-of-stock border">Rupture de stock</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="text-sm text-slate-600 leading-relaxed border-t border-b border-slate-100 py-4">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <WhatsAppButton
                variant="product"
                productName={product.name}
                shopName={shop.name}
                whatsappNumber={merchant.whatsappNumber}
                productSlug={product.slug}
                size="lg"
                fullWidth
              />
              <div className="flex items-center gap-2.5 flex-wrap">
                {clerkId && (
                  <FavoriteButton
                    productId={product.id}
                    isFavorited={isFavorited}
                    size="md"
                  />
                )}
                <ShareButton
                  details={{
                    type: "product",
                    name: product.name,
                    price: formatPrice(product.price, product.currency),
                    currency: product.currency,
                    shopName: shop.name,
                    categoryName: product.category?.name,
                    inStock: product.stockQuantity > 0,
                    description: product.description,
                    imageUrl: product.images[0]?.url
                      ? buildImageKitUrl(product.images[0].url, { width: 800, height: 600, quality: 85 })
                      : null,
                    url: `/products/${product.slug}`,
                  }}
                  size="md"
                  label="Partager ce produit"
                />
                {clerkId && product._count.favorites > 0 && (
                  <span className="text-xs text-slate-500">
                    {product._count.favorites} personne{product._count.favorites !== 1 ? "s" : ""} a mis ce produit en favori
                  </span>
                )}
              </div>
            </div>

            {/* Shop Card */}
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Boutique
              </p>
              <Link href={`/shops/${shop.slug}`} className="flex items-center gap-3 group">
                {shop.logoUrl ? (
                  <Image
                    src={buildImageKitUrl(shop.logoUrl, { width: 48, height: 48 })}
                    alt={`Logo ${shop.name}`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-200"
                    style={{ backgroundColor: "var(--color-brand-green-50)" }}
                  >
                    <Store
                      className="w-5 h-5"
                      style={{ color: "var(--color-brand-green)" }}
                      aria-hidden="true"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 group-hover:text-green-700 transition-colors">
                      {shop.name}
                    </span>
                    {merchant.isVerified && <VerifiedBadge size="sm" showLabel={false} />}
                  </div>
                  {merchant.displayName && (
                    <p className="text-xs text-slate-500">par {merchant.displayName}</p>
                  )}
                </div>
              </Link>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <WhatsAppButton
                  variant="shop"
                  shopName={shop.name}
                  whatsappNumber={merchant.whatsappNumber}
                  size="sm"
                />
                <ShareButton
                  details={{
                    type: "shop",
                    name: shop.name,
                    merchantName: merchant.displayName || undefined,
                    description: shop.description,
                    imageUrl: shop.logoUrl
                      ? buildImageKitUrl(shop.logoUrl, { width: 500, height: 500, quality: 85 })
                      : shop.coverImageUrl
                      ? buildImageKitUrl(shop.coverImageUrl, { width: 800, height: 400, quality: 85 })
                      : null,
                    url: `/shops/${shop.slug}`,
                  }}
                  size="sm"
                  label="Partager la boutique"
                />
              </div>
            </div>

            {/* Meta info */}
            <p className="text-xs text-slate-400">
              Ajouté {formatRelativeDate(product.createdAt)} · {product.viewCount} vue{product.viewCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
