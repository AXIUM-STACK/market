import Link from "next/link";
import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/clerk";
import { Package, Store, Eye, TrendingUp, Plus, ChevronRight } from "lucide-react";

export default async function DashboardOverviewPage() {
  const dbUser = await getOrCreateDbUser();

  const merchantProfile = await prisma.merchantProfile.findUnique({
    where: { userId: dbUser.id },
    include: {
      shops: {
        where: { deletedAt: null },
        include: {
          _count: {
            select: {
              products: {
                where: { status: "ACTIVE", deletedAt: null },
              },
            },
          },
        },
      },
    },
  });

  if (!merchantProfile) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "var(--color-brand-green-50)" }}
        >
          <Store
            className="w-8 h-8"
            style={{ color: "var(--color-brand-green)" }}
            aria-hidden="true"
          />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Bienvenue sur AXIUMarket !
        </h1>
        <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
          Créez votre profil marchand pour commencer à publier vos produits et
          recevoir des clients sur WhatsApp.
        </p>
        <Link
          href="/dashboard/profile"
          className="btn btn-brand rounded-xl px-6"
        >
          Créer mon profil marchand
        </Link>
      </div>
    );
  }

  // Aggregate stats
  const shopIds = merchantProfile.shops.map((s) => s.id);

  const [totalProducts, activeProducts, draftProducts, totalViews] = await Promise.all([
    prisma.product.count({
      where: { shopId: { in: shopIds }, deletedAt: null },
    }),
    prisma.product.count({
      where: { shopId: { in: shopIds }, status: "ACTIVE", deletedAt: null },
    }),
    prisma.product.count({
      where: { shopId: { in: shopIds }, status: "DRAFT", deletedAt: null },
    }),
    prisma.product.aggregate({
      where: { shopId: { in: shopIds }, deletedAt: null },
      _sum: { viewCount: true },
    }),
  ]);

  const stats = [
    {
      label: "Produits totaux",
      value: totalProducts,
      icon: Package,
      color: "var(--color-brand-green)",
      bg: "var(--color-brand-green-50)",
      href: "/dashboard/products",
    },
    {
      label: "Produits actifs",
      value: activeProducts,
      icon: TrendingUp,
      color: "#2563eb",
      bg: "#eff6ff",
      href: "/dashboard/products?status=ACTIVE",
    },
    {
      label: "Boutiques",
      value: merchantProfile.shops.length,
      icon: Store,
      color: "#9333ea",
      bg: "#fdf4ff",
      href: "/dashboard/shops",
    },
    {
      label: "Vues totales",
      value: totalViews._sum.viewCount ?? 0,
      icon: Eye,
      color: "#f59e0b",
      bg: "#fffbeb",
      href: undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            Vue d&apos;ensemble
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Bonjour, {merchantProfile.displayName ?? "marchand"} 👋
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="btn btn-brand rounded-xl text-sm px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Nouveau produit</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const card = (
            <div
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: stat.bg }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: stat.color }}
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mb-0.5">
                {stat.value.toLocaleString("fr")}
              </div>
              <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
          );

          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {card}
            </Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      {/* Shops List */}
      {merchantProfile.shops.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800 text-sm">Mes boutiques</h2>
            <Link
              href="/dashboard/shops"
              className="text-xs text-green-600 hover:text-green-700 font-medium"
            >
              Voir tout
            </Link>
          </div>
          <ul className="divide-y divide-slate-50">
            {merchantProfile.shops.slice(0, 5).map((shop) => (
              <li key={shop.id}>
                <Link
                  href={`/dashboard/shops/${shop.id}/edit`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{shop.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {shop._count.products} produit{shop._count.products !== 1 ? "s" : ""} actif{shop._count.products !== 1 ? "s" : ""}
                      {" · "}
                      <span
                        className={
                          shop.status === "ACTIVE" ? "text-green-600" : "text-amber-600"
                        }
                      >
                        {shop.status === "ACTIVE" ? "Active" : shop.status === "PAUSED" ? "Pausée" : shop.status}
                      </span>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      {draftProducts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {draftProducts} produit{draftProducts > 1 ? "s" : ""} en brouillon
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Publiez-les pour qu&apos;ils soient visibles sur le marketplace.
            </p>
          </div>
          <Link
            href="/dashboard/products?status=DRAFT"
            className="shrink-0 text-sm font-semibold text-amber-800 hover:text-amber-900 underline"
          >
            Voir les brouillons
          </Link>
        </div>
      )}
    </div>
  );
}
