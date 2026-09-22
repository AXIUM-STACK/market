import Link from "next/link";
import Image from "next/image";
import { Store, Package, ArrowUpRight } from "lucide-react";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import { buildImageKitUrl } from "@/lib/utils";
import type { ShopCard as ShopCardType } from "@/types";

interface ShopCardProps {
  shop: ShopCardType;
  className?: string;
}

export default function ShopCard({ shop, className = "" }: ShopCardProps) {
  const logoUrl = shop.logoUrl
    ? buildImageKitUrl(shop.logoUrl, { width: 96, height: 96, quality: 80 })
    : null;

  const coverUrl = shop.coverImageUrl
    ? buildImageKitUrl(shop.coverImageUrl, { width: 640, height: 240, quality: 80 })
    : null;

  const productCount = shop._count.products;

  return (
    <Link
      href={`/shops/${shop.slug}`}
      className={`group flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 hover:shadow-[0_6px_20px_rgba(15,41,26,0.08)] transition-all duration-200 ${className}`}
    >
      {/* Storefront Cover */}
      <div className="relative h-28 sm:h-32 overflow-hidden bg-emerald-900/10">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`Vitrine de ${shop.name}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300">
            <Store className="w-8 h-8 opacity-40" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Card Body */}
      <div className="p-4 flex gap-3 flex-1 relative">
        {/* Overlapping Merchant Logo */}
        <div className="relative shrink-0 -mt-8">
          <div className="w-14 h-14 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-white flex items-center justify-center">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`Logo de ${shop.name}`}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-700">
                <Store className="w-6 h-6" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-green-800 transition-colors">
              {shop.name}
            </h3>
            {shop.merchant.isVerified && <VerifiedBadge size="sm" showLabel={false} />}
          </div>

          {shop.merchant.displayName && (
            <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">
              Vendeur : {shop.merchant.displayName}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-semibold bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
              <Package className="w-3 h-3 text-slate-400" aria-hidden="true" />
              {productCount} article{productCount !== 1 ? "s" : ""}
            </span>

            <span className="text-xs text-green-700 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              <span>Visiter</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
