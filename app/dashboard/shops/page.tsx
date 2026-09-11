import Link from "next/link";
import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/clerk";
import { Plus, Pencil, Eye, Store } from "lucide-react";

export default async function DashboardShopsPage() {
  const dbUser = await getOrCreateDbUser();

  const merchantProfile = await prisma.merchantProfile.findUnique({
    where: { userId: dbUser.id },
    include: {
      shops: {
        where: { deletedAt: null },
        include: {
          _count: {
            select: { products: { where: { status: "ACTIVE", deletedAt: null } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!merchantProfile) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <Store className="w-10 h-10 mx-auto mb-4 text-slate-300" aria-hidden="true" />
        <h1 className="text-lg font-bold text-slate-900 mb-2">Profil marchand requis</h1>
        <p className="text-sm text-slate-500 mb-5">
          Créez votre profil marchand avant de créer une boutique.
        </p>
        <Link href="/dashboard/profile" className="btn btn-brand rounded-xl px-5">
          Créer mon profil
        </Link>
      </div>
    );
  }

  const shops = merchantProfile.shops;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Mes boutiques</h1>
          <p className="text-sm text-slate-500">{shops.length} boutique{shops.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/shops/new"
          className="btn btn-brand rounded-xl text-sm px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nouvelle boutique
        </Link>
      </div>

      {shops.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <Store className="w-10 h-10 mx-auto mb-3 text-slate-300" aria-hidden="true" />
          <p className="text-slate-600 font-medium mb-1">Aucune boutique</p>
          <p className="text-sm text-slate-400 mb-5">Créez votre première boutique pour commencer.</p>
          <Link href="/dashboard/shops/new" className="btn btn-brand rounded-xl px-5 text-sm">
            Créer une boutique
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <ul className="divide-y divide-slate-100" role="list">
            {shops.map((shop) => {
              const isExpired = shop.expiresAt ? new Date(shop.expiresAt) < new Date() : false;
              const daysRemaining = shop.expiresAt
                ? Math.ceil((new Date(shop.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              let statusBadge = null;
              if (shop.status === "PENDING_APPROVAL") {
                statusBadge = (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800">
                    ⏳ En attente de validation
                  </span>
                );
              } else if (shop.status === "REJECTED") {
                statusBadge = (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 border border-red-200 text-red-700">
                    ❌ Refusée
                  </span>
                );
              } else if (shop.status === "BLOCKED") {
                statusBadge = (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 border border-red-300 text-red-900">
                    🚫 Bloquée
                  </span>
                );
              } else if (shop.status === "SUSPENDED") {
                statusBadge = (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 border border-orange-200 text-orange-700">
                    ⚠️ Suspendue
                  </span>
                );
              } else if (shop.status === "EXPIRED" || isExpired) {
                statusBadge = (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700">
                    ⏰ Expirée
                  </span>
                );
              } else if (shop.status === "PAUSED") {
                statusBadge = (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                    ⏸️ En pause
                  </span>
                );
              } else {
                statusBadge = (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                    ✅ Validée & Active
                  </span>
                );
              }

              return (
                <li key={shop.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: "var(--color-brand-green-50)" }}
                      >
                        <Store
                          className="w-5 h-5"
                          style={{ color: "var(--color-brand-green)" }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-base">{shop.name}</p>
                          {statusBadge}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {shop._count.products} produit{shop._count.products !== 1 ? "s" : ""} actif{shop._count.products !== 1 ? "s" : ""}
                          {shop.status === "ACTIVE" && !isExpired && daysRemaining !== null && (
                            <span className="text-emerald-700 font-medium">
                              {" · "}Expire dans {daysRemaining} jour{daysRemaining > 1 ? "s" : ""}
                            </span>
                          )}
                        </p>
                        {shop.status === "PENDING_APPROVAL" && (
                          <p className="text-xs text-amber-700 mt-1.5 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-block">
                            Votre boutique est en cours d&apos;examen par notre équipe de modération avant d&apos;être visible sur la marketplace.
                          </p>
                        )}
                        {(shop.status === "REJECTED" || shop.status === "BLOCKED" || shop.status === "SUSPENDED") && shop.rejectionReason && (
                          <p className="text-xs text-red-700 mt-1.5 bg-red-50/80 px-2.5 py-1 rounded-lg border border-red-200/60 inline-block">
                            Motif : {shop.rejectionReason}
                          </p>
                        )}
                        {isExpired && (
                          <p className="text-xs text-rose-700 mt-1.5 bg-rose-50/80 px-2.5 py-1 rounded-lg border border-rose-200/60 inline-block">
                            La période d&apos;activité de cette boutique a expiré. Contactez l&apos;administration pour le renouvellement.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {shop.status === "ACTIVE" && !isExpired && (
                        <Link
                          href={`/shops/${shop.slug}`}
                          className="btn btn-secondary btn-sm rounded-xl text-xs flex items-center gap-1.5"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Voir</span>
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/shops/${shop.id}/edit`}
                        className="btn btn-secondary btn-sm rounded-xl text-xs flex items-center gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Modifier</span>
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
