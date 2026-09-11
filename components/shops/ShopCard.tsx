import Link from "next/link";
import Image from "next/image";
import { Store, Package } from "lucide-react";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import { buildImageKitUrl } from "@/lib/utils";
import type { ShopCard as ShopCardType } from "@/types";

interface ShopCardProps {
  shop: ShopCardType;
  className?: string;
}

export default function ShopCard({ shop, className = "" }: ShopCardProps) {
  const logoUrl = shop.logoUrl
    ? buildImageKitUrl(shop.logoUrl, { width: 80, height: 80, quality: 80 })
    : null;

  const coverUrl = shop.coverImageUrl
    ? buildImageKitUrl(shop.coverImageUrl, { width: 600, height: 200, quality: 75 })
    : null;

  const productCount = shop._count.products;

  return (
    <Link
      href={`/shops/${shop.slug}`}
      className={`shop-card group flex flex-col block ${className}`}
    >
      {/* Cover */}
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-green-100 to-green-200">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`Couverture de ${shop.name}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Store
              className="w-8 h-8 opacity-20"
              style={{ color: "var(--color-brand-green)" }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex gap-3 flex-1">
        {/* Logo */}
        <div className="relative shrink-0 -mt-7">
          <div className="w-12 h-12 rounded-xl border-2 border-white shadow-md overflow-hidden bg-white">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`Logo de ${shop.name}`}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: "var(--color-brand-green-50)" }}
              >
                <Store
                  className="w-5 h-5"
                  style={{ color: "var(--color-brand-green)" }}
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 mt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-800 text-sm truncate group-hover:text-green-700 transition-colors">
              {shop.name}
            </h3>
            {shop.merchant.isVerified && <VerifiedBadge size="sm" showLabel={false} />}
          </div>
          {shop.merchant.displayName && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              par {shop.merchant.displayName}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2">
            <Package className="w-3 h-3 text-slate-400" aria-hidden="true" />
            <span className="text-xs text-slate-500">
              {productCount} produit{productCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
