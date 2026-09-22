import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import ShopCard from "@/components/shops/ShopCard";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import type { ShopCard as ShopCardType } from "@/types";

export const metadata: Metadata = {
  title: "Toutes les boutiques | AXIUMarket",
  description: "Découvrez l'annuaire des commerces de proximité et boutiques vérifiées sur AXIUMarket.",
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
    <div className="axm-container py-8 sm:py-10">
      <div className="mb-8 pb-5 border-b border-slate-200/80">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Boutiques & Commerces Locaux
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          {total} boutique{total !== 1 ? "s" : ""} référencée{total !== 1 ? "s" : ""} dans votre ville
        </p>
      </div>

      {shops.length === 0 ? (
        <EmptyState
          variant="shops"
          title="Aucune boutique disponible"
          description="Les commerces sont actuellement en cours d'approbation."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {shops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop as unknown as ShopCardType}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath="/shops"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
