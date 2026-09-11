import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { formatPrice, buildImageKitUrl } from "@/lib/utils";
import ProductModerationActions from "@/components/admin/ProductModerationActions";
import { Package, Search, Eye, Ban } from "lucide-react";

interface AdminProductsPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;
  const currentTab = params.status || "ALL";
  const query = params.q?.trim() || "";

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(query && {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { shop: { name: { contains: query, mode: "insensitive" } } },
      ],
    }),
  };

  if (currentTab === "BLOCKED") {
    where.isBlocked = true;
  } else if (currentTab === "ACTIVE") {
    where.status = "ACTIVE";
    where.isBlocked = false;
  }

  const [totalCount, blockedCount, activeCount, products] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { isBlocked: true, deletedAt: null } }),
    prisma.product.count({
      where: { status: "ACTIVE", isBlocked: false, deletedAt: null },
    }),
    prisma.product.findMany({
      where,
      include: {
        images: {
          select: { url: true, altText: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        shop: {
          select: { id: true, name: true, slug: true, status: true },
        },
        category: {
          select: { name: true },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 50,
    }),
  ]);

  const tabs = [
    { id: "ALL", label: "Tous les produits", count: totalCount },
    { id: "BLOCKED", label: "Produits bloqués", count: blockedCount, alert: blockedCount > 0 },
    { id: "ACTIVE", label: "Produits actifs", count: activeCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">
          Modération des produits
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Contrôlez et bloquez les produits ne respectant pas les règles de la plateforme.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-sm">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin/products?status=${tab.id}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
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
                    : tab.alert
                    ? "bg-red-100 text-red-800 font-bold"
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
      <form method="GET" action="/admin/products" className="max-w-md">
        <input type="hidden" name="status" value={currentTab} />
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Rechercher par nom de produit, boutique..."
            className="form-input text-xs pl-9 pr-4 py-2 rounded-xl"
          />
        </div>
      </form>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Aucun produit trouvé</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Aucun produit ne correspond aux filtres sélectionnés.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-semibold">
                <tr>
                  <th className="text-left px-5 py-3">Produit</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Boutique</th>
                  <th className="text-left px-4 py-3">Prix</th>
                  <th className="text-left px-4 py-3">Modération</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((product) => {
                  const imageUrl = product.images[0]?.url
                    ? buildImageKitUrl(product.images[0].url, { width: 48, height: 48 })
                    : null;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Produit Thumbnail + Info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-xs">
                              {product.name}
                            </p>
                            {product.category && (
                              <p className="text-xs text-slate-400 truncate">
                                {product.category.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Boutique */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <Link
                          href={`/shops/${product.shop.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                        >
                          {product.shop.name}
                        </Link>
                      </td>

                      {/* Prix */}
                      <td className="px-4 py-3.5 text-xs font-semibold text-slate-800 whitespace-nowrap">
                        {formatPrice(product.price, product.currency)}
                      </td>

                      {/* Statut Modération */}
                      <td className="px-4 py-3.5">
                        {product.isBlocked ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                              <Ban className="w-3 h-3 mr-1" /> Bloqué
                            </span>
                            {product.blockedReason && (
                              <p className="text-[11px] text-red-600 mt-0.5 max-w-xs truncate" title={product.blockedReason}>
                                {product.blockedReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Normal
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!product.isBlocked && product.status === "ACTIVE" && (
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                              title="Voir le produit"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          <ProductModerationActions
                            productId={product.id}
                            productName={product.name}
                            isBlocked={product.isBlocked}
                            blockedReason={product.blockedReason}
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
