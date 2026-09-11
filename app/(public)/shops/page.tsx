import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Store, Package } from "lucide-react";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import { buildImageKitUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Toutes les boutiques | AXIUMarket",
  description: "Découvrez toutes les boutiques disponibles sur AXIUMarket.",
};

const PAGE_SIZE = 12;

interface ShopsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ShopsPage({ searchParams }: ShopsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;
  const now = new Date();
  const activeShopWhere = {
    status: "ACTIVE" as const,
    deletedAt: null,
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where: activeShopWhere,
      include: {
        merchant: {
          select: { isVerified: true, displayName: true, whatsappNumber: true },
        },
        _count: {
          select: { products: { where: { status: "ACTIVE", isBlocked: false, deletedAt: null } } },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip,
      take: PAGE_SIZE,
    }),
    prisma.shop.count({ where: activeShopWhere }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="axm-container py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Toutes les boutiques
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {total} boutique{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
        </p>
      </div>

      {shops.length === 0 ? (
        <EmptyState variant="shops" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {shops.map((shop) => {
              const logoUrl = shop.logoUrl
                ? buildImageKitUrl(shop.logoUrl, { width: 80, height: 80 })
                : null;
              const coverUrl = shop.coverImageUrl
                ? buildImageKitUrl(shop.coverImageUrl, { width: 600, height: 200 })
                : null;
              const productCount = shop._count.products;

              return (
                <Link
                  key={shop.id}
                  href={`/shops/${shop.slug}`}
                  className="shop-card group block"
                >
                  {/* Cover */}
                  <div className="relative h-28 bg-gradient-to-br from-green-50 to-green-100 overflow-hidden">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={`Couverture ${shop.name}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Store className="w-8 h-8 opacity-15 text-green-600" aria-hidden="true" />
                      </div>
                    )}
                    {shop.isFeatured && (
                      <div className="absolute top-2 left-2">
                        <span className="text-xs bg-amber-100 border border-amber-300 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                          ⭐ En vedette
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex gap-3">
                    <div className="relative -mt-7 shrink-0">
                      <div className="w-12 h-12 rounded-xl border-2 border-white shadow-md overflow-hidden bg-white">
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt={`Logo ${shop.name}`}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-green-50">
                            <Store className="w-5 h-5 text-green-600" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 mt-1">
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-semibold text-sm text-slate-800 truncate group-hover:text-green-700 transition-colors">
                          {shop.name}
                        </h2>
                        {shop.merchant.isVerified && <VerifiedBadge size="sm" showLabel={false} />}
                      </div>
                      {shop.merchant.displayName && (
                        <p className="text-xs text-slate-500 truncate">
                          {shop.merchant.displayName}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5">
                        <Package className="w-3 h-3 text-slate-400" aria-hidden="true" />
                        <span className="text-xs text-slate-500">
                          {productCount} produit{productCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/shops"
          />
        </>
      )}
    </div>
  );
}
