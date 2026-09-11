import Link from "next/link";
import prisma from "@/lib/prisma";
import type { Prisma, ShopStatus } from "@/generated/prisma";
import { formatDate } from "@/lib/utils";
import ShopModerationActions from "@/components/admin/ShopModerationActions";
import { Store, Eye, Search } from "lucide-react";

interface AdminShopsPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}

export default async function AdminShopsPage({
  searchParams,
}: AdminShopsPageProps) {
  const params = await searchParams;
  const currentTab = params.status || "ALL";
  const query = params.q?.trim() || "";

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Build where condition based on active tab and search
  const where: Prisma.ShopWhereInput = {
    deletedAt: null,
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { merchant: { displayName: { contains: query, mode: "insensitive" } } },
        { merchant: { whatsappNumber: { contains: query, mode: "insensitive" } } },
      ],
    }),
  };

  if (currentTab === "PENDING_APPROVAL") {
    where.status = "PENDING_APPROVAL";
  } else if (currentTab === "ACTIVE") {
    where.status = "ACTIVE";
    where.OR = [{ expiresAt: null }, { expiresAt: { gt: now } }];
  } else if (currentTab === "EXPIRING_SOON") {
    where.status = "ACTIVE";
    where.expiresAt = { gt: now, lte: thirtyDaysFromNow };
  } else if (currentTab === "EXPIRED") {
    where.OR = [
      { status: "EXPIRED" },
      { status: "ACTIVE", expiresAt: { lte: now } },
    ];
  } else if (currentTab === "SUSPENDED_BLOCKED") {
    where.status = { in: ["SUSPENDED", "BLOCKED"] };
  } else if (currentTab === "REJECTED") {
    where.status = "REJECTED";
  }

  // Count per category tab
  const [
    totalCount,
    pendingCount,
    activeCount,
    expiringSoonCount,
    expiredCount,
    suspendedBlockedCount,
    rejectedCount,
    shops,
  ] = await Promise.all([
    prisma.shop.count({ where: { deletedAt: null } }),
    prisma.shop.count({ where: { status: "PENDING_APPROVAL", deletedAt: null } }),
    prisma.shop.count({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    }),
    prisma.shop.count({
      where: {
        status: "ACTIVE",
        deletedAt: null,
        expiresAt: { gt: now, lte: thirtyDaysFromNow },
      },
    }),
    prisma.shop.count({
      where: {
        deletedAt: null,
        OR: [{ status: "EXPIRED" }, { status: "ACTIVE", expiresAt: { lte: now } }],
      },
    }),
    prisma.shop.count({
      where: {
        status: { in: ["SUSPENDED", "BLOCKED"] },
        deletedAt: null,
      },
    }),
    prisma.shop.count({ where: { status: "REJECTED", deletedAt: null } }),

    prisma.shop.findMany({
      where,
      include: {
        merchant: {
          select: { displayName: true, whatsappNumber: true, isVerified: true },
        },
        _count: {
          select: { products: { where: { deletedAt: null } } },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    }),
  ]);

  const tabs = [
    { id: "ALL", label: "Toutes", count: totalCount },
    { id: "PENDING_APPROVAL", label: "En attente", count: pendingCount, highlight: pendingCount > 0 },
    { id: "ACTIVE", label: "Actives", count: activeCount },
    { id: "EXPIRING_SOON", label: "Expirant bientôt", count: expiringSoonCount, alert: expiringSoonCount > 0 },
    { id: "EXPIRED", label: "Expirées", count: expiredCount },
    { id: "SUSPENDED_BLOCKED", label: "Suspendues/Bloquées", count: suspendedBlockedCount },
    { id: "REJECTED", label: "Refusées", count: rejectedCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">
          Modération des boutiques
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Validez les nouvelles boutiques, définissez leur durée d&apos;activité et modérez leur statut.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-sm">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin/shops?status=${tab.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive
                    ? "bg-white/20 text-white"
                    : tab.highlight
                    ? "bg-amber-100 text-amber-800 font-bold"
                    : tab.alert
                    ? "bg-orange-100 text-orange-800 font-bold"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search Input */}
      <form method="GET" action="/admin/shops" className="max-w-md">
        <input type="hidden" name="status" value={currentTab} />
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Rechercher par nom, slug, marchand..."
            className="form-input text-xs pl-9 pr-4 py-2 rounded-xl"
          />
        </div>
      </form>

      {/* Shops Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {shops.length === 0 ? (
          <div className="p-10 text-center">
            <Store className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Aucune boutique trouvée</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Aucune boutique ne correspond aux filtres sélectionnés.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-semibold">
                <tr>
                  <th className="text-left px-5 py-3">Boutique</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Marchand</th>
                  <th className="text-left px-4 py-3">Statut</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Créée le</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Expiration</th>
                  <th className="text-left px-4 py-3 hidden xl:table-cell">Produits</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {shops.map((shop) => {
                  const isExpired = shop.expiresAt ? new Date(shop.expiresAt) < now : false;
                  const daysRemaining = shop.expiresAt
                    ? Math.ceil((new Date(shop.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                  let badge = null;
                  if (shop.status === "PENDING_APPROVAL") {
                    badge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        ⏳ En attente
                      </span>
                    );
                  } else if (shop.status === "REJECTED") {
                    badge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        ❌ Refusée
                      </span>
                    );
                  } else if (shop.status === "BLOCKED") {
                    badge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300">
                        🚫 Bloquée
                      </span>
                    );
                  } else if (shop.status === "SUSPENDED") {
                    badge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
                        ⚠️ Suspendue
                      </span>
                    );
                  } else if (shop.status === "EXPIRED" || isExpired) {
                    badge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        ⏰ Expirée
                      </span>
                    );
                  } else if (shop.status === "PAUSED") {
                    badge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        ⏸️ En pause
                      </span>
                    );
                  } else {
                    badge = (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✅ Active
                      </span>
                    );
                  }

                  return (
                    <tr key={shop.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Boutique */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-semibold text-slate-900">{shop.name}</p>
                            <p className="text-xs text-slate-400 font-mono">/shops/{shop.slug}</p>
                          </div>
                          {shop.status === "ACTIVE" && !isExpired && (
                            <Link
                              href={`/shops/${shop.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-indigo-600 p-1"
                              title="Ouvrir la page boutique"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                        {shop.rejectionReason && (
                          <p className="text-[11px] text-red-600 mt-1 max-w-xs truncate" title={shop.rejectionReason}>
                            Motif : {shop.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* Marchand */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-slate-800 text-xs font-medium">
                          {shop.merchant.displayName || "Sans nom"}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {shop.merchant.whatsappNumber}
                        </p>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3.5">
                        {badge}
                      </td>

                      {/* Créée le */}
                      <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(shop.createdAt)}
                      </td>

                      {/* Expiration */}
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {shop.expiresAt ? (
                          <div>
                            <p className="text-xs font-medium text-slate-700">
                              {formatDate(shop.expiresAt)}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {daysRemaining !== null ? (
                                daysRemaining > 0 ? (
                                  <span className={daysRemaining <= 30 ? "text-orange-600 font-bold" : "text-slate-500"}>
                                    Reste {daysRemaining} jour{daysRemaining > 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  <span className="text-rose-600 font-bold">Expirée depuis {-daysRemaining} jour(s)</span>
                                )
                              ) : null}
                              {shop.activityMonths && ` (${shop.activityMonths} mois)`}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      {/* Produits */}
                      <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-slate-600">
                        {shop._count.products}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end">
                          <ShopModerationActions
                            shopId={shop.id}
                            shopName={shop.name}
                            currentStatus={shop.status}
                            isExpired={isExpired}
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
