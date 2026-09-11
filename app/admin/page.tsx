import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Store,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  ArrowRight,
  Package,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import ShopModerationActions from "@/components/admin/ShopModerationActions";

export default async function AdminDashboardPage() {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    totalShopsCount,
    pendingCount,
    activeCount,
    suspendedCount,
    expiredCount,
    expiringSoonCount,
    blockedProductsCount,
    pendingShops,
    expiringShops,
  ] = await Promise.all([
    // 1. Total shops
    prisma.shop.count({
      where: { deletedAt: null },
    }),

    // 2. Pending approval
    prisma.shop.count({
      where: { status: "PENDING_APPROVAL", deletedAt: null },
    }),

    // 3. Active & non-expired shops
    prisma.shop.count({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    }),

    // 4. Suspended shops
    prisma.shop.count({
      where: { status: "SUSPENDED", deletedAt: null },
    }),

    // 5. Expired shops
    prisma.shop.count({
      where: {
        deletedAt: null,
        OR: [
          { status: "EXPIRED" },
          { status: "ACTIVE", expiresAt: { lte: now } },
        ],
      },
    }),

    // 6. Expiring soon (within next 30 days)
    prisma.shop.count({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        expiresAt: { gt: now, lte: thirtyDaysFromNow },
      },
    }),

    // 7. Blocked products count
    prisma.product.count({
      where: { isBlocked: true, deletedAt: null },
    }),

    // Recent shops pending validation
    prisma.shop.findMany({
      where: { status: "PENDING_APPROVAL", deletedAt: null },
      include: {
        merchant: {
          select: { displayName: true, whatsappNumber: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Shops expiring soon
    prisma.shop.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        expiresAt: { gt: now, lte: thirtyDaysFromNow },
      },
      include: {
        merchant: {
          select: { displayName: true, whatsappNumber: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { expiresAt: "asc" },
      take: 5,
    }),
  ]);

  const stats = [
    {
      label: "Total des boutiques",
      value: totalShopsCount,
      icon: Store,
      color: "#4f46e5",
      bg: "#eef2ff",
      href: "/admin/shops?status=ALL",
    },
    {
      label: "En attente de validation",
      value: pendingCount,
      icon: Clock,
      color: "#d97706",
      bg: "#fef3c7",
      href: "/admin/shops?status=PENDING_APPROVAL",
      highlight: pendingCount > 0,
    },
    {
      label: "Boutiques actives",
      value: activeCount,
      icon: CheckCircle2,
      color: "#059669",
      bg: "#d1fae5",
      href: "/admin/shops?status=ACTIVE",
    },
    {
      label: "Boutiques suspendues",
      value: suspendedCount,
      icon: AlertTriangle,
      color: "#d97706",
      bg: "#fef3c7",
      href: "/admin/shops?status=SUSPENDED_BLOCKED",
    },
    {
      label: "Boutiques expirées",
      value: expiredCount,
      icon: Ban,
      color: "#e11d48",
      bg: "#ffe4e6",
      href: "/admin/shops?status=EXPIRED",
    },
    {
      label: "Expirent bientôt (≤30j)",
      value: expiringSoonCount,
      icon: AlertTriangle,
      color: "#ea580c",
      bg: "#ffedd5",
      href: "/admin/shops?status=EXPIRING_SOON",
      alert: expiringSoonCount > 0,
    },
    {
      label: "Produits bloqués",
      value: blockedProductsCount,
      icon: Package,
      color: "#dc2626",
      bg: "#fee2e2",
      href: "/admin/products?status=BLOCKED",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">
          Tableau de bord Super Admin
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Modération des boutiques, durées d&apos;activité et contrôle des produits.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`bg-white rounded-2xl border shadow-xs p-4 hover:shadow-md transition-shadow block relative overflow-hidden ${
                stat.highlight
                  ? "border-amber-300 ring-1 ring-amber-200"
                  : stat.alert
                  ? "border-orange-300 ring-1 ring-orange-200"
                  : "border-slate-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: stat.bg }}
                >
                  <Icon className="w-4 h-4" style={{ color: stat.color }} aria-hidden="true" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-0.5">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 font-medium leading-tight">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Pending Approval Shops */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Boutiques en attente d&apos;approbation</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  {pendingCount}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Boutiques créées par des marchands nécessitant validation et durée d&apos;activité.
            </p>
          </div>
          <Link
            href="/admin/shops?status=PENDING_APPROVAL"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Voir tout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingShops.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-700">Aucune boutique en attente</p>
            <p className="text-xs text-slate-400 mt-0.5">Toutes les boutiques ont été traitées.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-semibold">
                <tr>
                  <th className="text-left px-5 py-3">Boutique</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Marchand</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Créée le</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pendingShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{shop.name}</p>
                      <p className="text-xs text-slate-400 font-mono">/shops/{shop.slug}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-slate-800 text-xs font-medium">
                        {shop.merchant.displayName || "Sans nom"}
                      </p>
                      <p className="text-xs text-slate-400">{shop.merchant.whatsappNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-slate-500">
                      {formatDate(shop.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end">
                        <ShopModerationActions
                          shopId={shop.id}
                          shopName={shop.name}
                          currentStatus={shop.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expiring Soon Shops */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Boutiques arrivant à expiration (≤ 30 jours)</span>
              {expiringSoonCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                  {expiringSoonCount}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ces boutiques deviendront inactives dès dépassement de leur période d&apos;activité.
            </p>
          </div>
          <Link
            href="/admin/shops?status=EXPIRING_SOON"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Voir tout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {expiringShops.length === 0 ? (
          <div className="p-8 text-center">
            <Store className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Aucune boutique n&apos;expire prochainement</p>
            <p className="text-xs text-slate-400 mt-0.5">Toutes les durées d&apos;activité sont encore confortables.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-semibold">
                <tr>
                  <th className="text-left px-5 py-3">Boutique</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Marchand</th>
                  <th className="text-left px-4 py-3">Expire dans</th>
                  <th className="text-right px-5 py-3">Prolonger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expiringShops.map((shop) => {
                  const daysRemaining = shop.expiresAt
                    ? Math.ceil((new Date(shop.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <tr key={shop.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{shop.name}</p>
                        <p className="text-xs text-slate-400 font-mono">/shops/{shop.slug}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-slate-800 text-xs font-medium">
                          {shop.merchant.displayName || "Sans nom"}
                        </p>
                        <p className="text-xs text-slate-400">{shop.merchant.whatsappNumber}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          {daysRemaining} jour{daysRemaining > 1 ? "s" : ""}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {shop.expiresAt ? formatDate(shop.expiresAt) : ""}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end">
                          <ShopModerationActions
                            shopId={shop.id}
                            shopName={shop.name}
                            currentStatus={shop.status}
                            expiresAt={shop.expiresAt}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
