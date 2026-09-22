import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { getCurrentClerkId } from "@/lib/clerk";
import { getUserFavoriteIds } from "@/app/actions/favorites";
import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductCarousel from "@/components/home/ProductCarousel";
import CertifiedShopsCarousel from "@/components/home/CertifiedShopsCarousel";
import RecentProducts from "@/components/home/RecentProducts";
import TrustSection from "@/components/home/TrustSection";
import MerchantCTA from "@/components/home/MerchantCTA";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import type { CategoryWithCount, ProductCard, ShopCard } from "@/types";

export const metadata: Metadata = {
  title: "AXIUMarket — Découvrez les produits des boutiques près de vous",
  description:
    "AXIUMarket est la marketplace de confiance pour découvrir et acheter les produits des commerces de votre quartier. Contactez les marchands directement via WhatsApp.",
  openGraph: {
    title: "AXIUMarket — Marketplace locale",
    description: "Découvrez les produits des boutiques près de vous.",
    type: "website",
  },
};

// Data fetching queries — parallel, server-side
async function getHomePageData() {
  try {
    const now = new Date();
    const activeShopWhere = {
      status: "ACTIVE" as const,
      deletedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    };

    const [categories, featuredProducts, certifiedShops, recentProducts] =
      await Promise.all([
        // Active categories with product counts
        prisma.category.findMany({
          where: { isActive: true, parentId: null },
          include: {
            _count: {
              select: {
                products: {
                  where: {
                    status: "ACTIVE",
                    isBlocked: false,
                    deletedAt: null,
                    shop: activeShopWhere,
                  },
                },
              },
            },
            children: {
              select: { id: true, name: true, slug: true },
              where: { isActive: true },
            },
          },
          orderBy: { name: "asc" },
          take: 8,
        }),

        // Active products for carousel (featured first)
        prisma.product.findMany({
          where: {
            status: "ACTIVE",
            isBlocked: false,
            deletedAt: null,
            shop: activeShopWhere,
          },
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
          orderBy: [{ isFeatured: "desc" }, { viewCount: "desc" }, { createdAt: "desc" }],
          take: 16,
        }),

        // Certified + active shops, ordered from newest to oldest
        prisma.shop.findMany({
          where: {
            ...activeShopWhere,
            merchant: {
              isVerified: true,
              isActive: true,
            },
          },
          include: {
            merchant: {
              select: { isVerified: true, whatsappNumber: true, displayName: true },
            },
            _count: {
              select: {
                products: {
                  where: { status: "ACTIVE", isBlocked: false, deletedAt: null },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 12,
        }),

        // Recently added active products
        prisma.product.findMany({
          where: {
            status: "ACTIVE",
            isBlocked: false,
            deletedAt: null,
            shop: activeShopWhere,
          },
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
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
      ]);

    const serializedFeaturedProducts = featuredProducts.map((product) => ({
      ...product,
      price: Number(product.price),
    }));

    const serializedRecentProducts = recentProducts.map((product) => ({
      ...product,
      price: Number(product.price),
    }));

    return {
      categories,
      featuredProducts: serializedFeaturedProducts,
      certifiedShops,
      recentProducts: serializedRecentProducts,
    };
  } catch (error) {
    console.error("[Homepage Data Fetch Error]:", error);
    return {
      categories: [],
      featuredProducts: [],
      certifiedShops: [],
      recentProducts: [],
    };
  }
}

export default async function HomePage() {
  const [{ categories, featuredProducts, certifiedShops, recentProducts }, clerkId] =
    await Promise.all([getHomePageData(), getCurrentClerkId()]);

  const favoriteIds = clerkId ? await getUserFavoriteIds() : new Set<string>();

  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Popular Categories */}
      {categories.length > 0 && (
        <section className="axm-section border-b border-slate-200/60 bg-white" aria-labelledby="categories-heading">
          <div className="axm-container">
            <div className="mb-6 sm:mb-8">
              <h2 id="categories-heading" className="section-title">
                Parcourir par rayon
              </h2>
              <p className="section-subtitle">
                Explorez les spécialités disponibles auprès des commerçants
              </p>
            </div>
            <CategoryGrid categories={categories as CategoryWithCount[]} />
          </div>
        </section>
      )}

      {/* 3. Section 1 — Carousel de produits à la une */}
      {featuredProducts.length > 0 && (
        <section className="axm-section border-b border-slate-200/60" aria-labelledby="featured-heading">
          <div className="axm-container">
            <div className="flex items-end justify-between mb-6 sm:mb-8">
              <div>
                <h2 id="featured-heading" className="section-title">
                  Produits à la une
                </h2>
                <p className="section-subtitle">
                  Sélectionnés parmi les commerces actifs de votre ville
                </p>
              </div>
              <Link
                href="/products?featured=true"
                className="hidden sm:inline-flex text-sm font-bold text-green-700 hover:text-green-800 transition-colors items-center gap-1.5"
              >
                <span>Tout voir</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductCarousel
              products={featuredProducts as unknown as ProductCard[]}
              favoriteIds={favoriteIds}
              currentUserId={clerkId}
            />
          </div>
        </section>
      )}

      {/* 4. Section 2 — Carousel horizontal des boutiques certifiées */}
      {certifiedShops.length > 0 && (
        <section className="axm-section border-b border-slate-200/60 bg-white" aria-labelledby="certified-shops-heading">
          <div className="axm-container">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h2 id="certified-shops-heading" className="section-title">
                    Boutiques certifiées
                  </h2>
                  <VerifiedBadge size="sm" showLabel={true} />
                </div>
                <p className="section-subtitle">
                  Marchands authentifiés avec numéro professionnel vérifié
                </p>
              </div>
              <Link
                href="/shops"
                className="hidden sm:inline-flex text-sm font-bold text-green-700 hover:text-green-800 transition-colors items-center gap-1.5"
              >
                <span>Toutes les boutiques</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <CertifiedShopsCarousel shops={certifiedShops as unknown as ShopCard[]} />
          </div>
        </section>
      )}

      {/* 5. Recent Products */}
      {recentProducts.length > 0 && (
        <section className="axm-section border-b border-slate-200/60" aria-labelledby="recent-heading">
          <div className="axm-container">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 id="recent-heading" className="section-title">
                  Nouveautés en rayon
                </h2>
                <p className="section-subtitle">
                  Les derniers articles publiés par les marchands
                </p>
              </div>
            </div>
            <RecentProducts
              products={recentProducts as unknown as ProductCard[]}
              favoriteIds={favoriteIds}
              currentUserId={clerkId}
            />
          </div>
        </section>
      )}

      {/* 6. Trust Section */}
      <TrustSection />

      {/* 7. Merchant CTA */}
      <MerchantCTA />
    </>
  );
}
