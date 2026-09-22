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
import { Store, Tag, ChevronRight, MessageCircle, ShieldCheck } from "lucide-react";
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
      `Découvrez ${product.name} disponible chez ${product.shop.name} sur AXIUMarket. Contact direct WhatsApp.`,
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

      <div className="axm-container py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-6 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-green-700 transition-colors">Accueil</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/products" className="hover:text-green-700 transition-colors">Produits</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-green-700 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Gallery (7 cols on lg) */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Commercial Details (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Category Tag */}
            {product.category && (
              <div>
                <Link
                  href={`/categories/${product.category.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-green-800 bg-green-50 border border-green-200/80 px-3 py-1 rounded-full hover:bg-green-100 transition-colors"
                >
                  <Tag className="w-3 h-3 text-green-700" aria-hidden="true" />
                  <span>{product.category.name}</span>
                </Link>
              </div>
            )}

            {/* Product Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-2">
                {product.name}
              </h1>
              {product.isFeatured && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 border border-amber-300 text-amber-800 px-2.5 py-1 rounded-md">
                  ★ Sélectionné à la une
                </span>
              )}
            </div>

            {/* Price & Stock Display */}
            <div className="flex items-baseline justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div>
                <span className="text-xs text-slate-400 font-semibold block mb-0.5">Prix en magasin</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {formatPrice(product.price, product.currency)}
                </span>
              </div>
              <div>
                {product.stockQuantity > 0 ? (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    En stock
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                    Rupture temporaire
                  </span>
                )}
              </div>
            </div>

            {/* Primary Action: WhatsApp Commerce Button */}
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

              <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1.5 font-medium">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Contact direct avec le marchand. Négociation et confirmation sur WhatsApp.</span>
              </p>

              {/* Utility actions: Favorite & Share */}
              <div className="flex items-center gap-3 pt-2">
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
                  label="Partager cet article"
                />
              </div>
            </div>

            {/* Merchant Identity Card */}
            <div className="rounded-2xl border border-slate-200/90 p-5 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Vendu par
                </span>
                <Link
                  href={`/shops/${shop.slug}`}
                  className="text-xs font-bold text-green-700 hover:text-green-800 transition-colors"
                >
                  Voir toute la boutique &rarr;
                </Link>
              </div>

              <Link href={`/shops/${shop.slug}`} className="flex items-center gap-3.5 group">
                <div className="w-13 h-13 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                  {shop.logoUrl ? (
                    <Image
                      src={buildImageKitUrl(shop.logoUrl, { width: 52, height: 52 })}
                      alt={`Logo ${shop.name}`}
                      width={52}
                      height={52}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-green-700 bg-green-50">
                      <Store className="w-6 h-6" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 group-hover:text-green-800 transition-colors text-sm truncate">
                      {shop.name}
                    </span>
                    {merchant.isVerified && <VerifiedBadge size="sm" showLabel={false} />}
                  </div>
                  {merchant.displayName && (
                    <p className="text-xs text-slate-500 truncate">Vendeur : {merchant.displayName}</p>
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Boutique vérifiée &middot; Réponse rapide sur WhatsApp</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="rounded-2xl border border-slate-200/80 p-5 bg-white shadow-sm space-y-2">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Détails du produit
                </h2>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-normal">
                  {product.description}
                </div>
              </div>
            )}

            {/* Meta info */}
            <p className="text-xs text-slate-400">
              Mis en ligne {formatRelativeDate(product.createdAt)} &middot; {product.viewCount} consultation{product.viewCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
