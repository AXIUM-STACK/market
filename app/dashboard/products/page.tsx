import Link from "next/link";
import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/clerk";
import { Plus, Pencil, Eye, Package, Archive } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function DashboardProductsPage() {
  const dbUser = await getOrCreateDbUser();

  const merchantProfile = await prisma.merchantProfile.findUnique({
    where: { userId: dbUser.id },
    include: { shops: { where: { deletedAt: null }, select: { id: true } } },
  });

  if (!merchantProfile || merchantProfile.shops.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <Package className="w-10 h-10 mx-auto mb-4 text-slate-300" aria-hidden="true" />
        <h1 className="text-lg font-bold text-slate-900 mb-2">Aucune boutique</h1>
        <p className="text-sm text-slate-500 mb-5">
          Créez une boutique d&apos;abord, puis ajoutez vos produits.
        </p>
        <Link href="/dashboard/shops/new" className="btn btn-brand rounded-xl px-5">
          Créer une boutique
        </Link>
      </div>
    );
  }

  const shopIds = merchantProfile.shops.map((s) => s.id);

  const products = await prisma.product.findMany({
    where: { shopId: { in: shopIds }, deletedAt: null },
    include: {
      images: {
        select: { url: true, altText: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      shop: { select: { name: true, slug: true } },
      category: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const statusLabels: Record<string, string> = {
    ACTIVE: "Actif",
    DRAFT: "Brouillon",
    OUT_OF_STOCK: "Rupture",
    ARCHIVED: "Archivé",
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "badge-active",
    DRAFT: "badge-archived",
    OUT_OF_STOCK: "badge-out-of-stock",
    ARCHIVED: "badge-archived",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Mes produits</h1>
          <p className="text-sm text-slate-500">{products.length} produit{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="btn btn-brand rounded-xl text-sm px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nouveau produit
        </Link>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <Package className="w-10 h-10 mx-auto mb-3 text-slate-300" aria-hidden="true" />
          <p className="text-slate-600 font-medium mb-1">Aucun produit pour le moment</p>
          <p className="text-sm text-slate-400 mb-5">Ajoutez votre premier produit !</p>
          <Link href="/dashboard/products/new" className="btn btn-brand rounded-xl px-5 text-sm">
            Ajouter un produit
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Liste des produits">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Produit</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Boutique</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Prix</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Statut</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 line-clamp-1">{product.name}</p>
                      {product.category && (
                        <p className="text-xs text-slate-400">{product.category.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500">
                      {product.shop.name}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-semibold text-green-700">
                        {formatPrice(product.price, product.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge badge-sm border ${statusColors[product.status]}`}>
                        {statusLabels[product.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded"
                          aria-label={`Voir ${product.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </Link>
                        <Link
                          href={`/dashboard/products/${product.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-green-600 transition-colors rounded"
                          aria-label={`Modifier ${product.name}`}
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
