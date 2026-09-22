import Link from "next/link";
import Image from "next/image";
import { Package, Store } from "lucide-react";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import FavoriteButton from "@/components/common/FavoriteButton";
import { formatPrice, buildImageKitUrl, truncate } from "@/lib/utils";
import type { ProductCard as ProductCardType } from "@/types";

interface ProductCardProps {
  product: ProductCardType;
  currentUserId?: string | null;
  isFavorited?: boolean;
  priority?: boolean;
}

function ProductStatusBadge({ status }: { status: string }) {
  if (status === "ACTIVE") return null;

  const labels: Record<string, string> = {
    OUT_OF_STOCK: "Rupture de stock",
    DRAFT: "Brouillon",
    ARCHIVED: "Archivé",
  };

  const labelClasses: Record<string, string> = {
    OUT_OF_STOCK: "bg-red-50 text-red-700 border-red-200",
    DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
    ARCHIVED: "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
        labelClasses[status] ?? "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export default function ProductCard({
  product,
  currentUserId,
  isFavorited = false,
  priority = false,
}: ProductCardProps) {
  const primaryImage = product.images.sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const imageUrl = primaryImage
    ? buildImageKitUrl(primaryImage.url, { width: 450, height: 340, quality: 80, format: "webp" })
    : null;

  const productDetailUrl = `/products/${product.slug}`;

  return (
    <article className="product-card group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-[0_6px_20px_rgba(15,41,26,0.07)] transition-all duration-200 flex flex-col h-full">
      {/* Product Image Stage */}
      <Link href={productDetailUrl} className="block relative aspect-[4/3] bg-slate-100 overflow-hidden" tabIndex={-1} aria-hidden="true">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={primaryImage?.altText ?? product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className="img-placeholder absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300">
            <Package className="w-10 h-10 opacity-40" aria-hidden="true" />
          </div>
        )}

        {/* Status overlay */}
        {product.status !== "ACTIVE" && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <ProductStatusBadge status={product.status} />
          </div>
        )}

        {/* Favorite Button */}
        {currentUserId && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <FavoriteButton
              productId={product.id}
              isFavorited={isFavorited}
            />
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Shop row */}
          <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
            <Store className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
            <Link
              href={`/shops/${product.shop.slug}`}
              className="text-xs text-slate-500 hover:text-green-700 transition-colors font-medium truncate"
            >
              {truncate(product.shop.name, 22)}
            </Link>
            {product.shop.merchant.isVerified && (
              <VerifiedBadge showLabel={false} size="sm" />
            )}
            {product.shop.status !== "ACTIVE" && (
              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                Pausée
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link href={productDetailUrl} className="block group-hover:text-green-800 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Category Row */}
        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between gap-2 mt-auto">
          <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-[11px] font-medium text-slate-400 hover:text-green-700 transition-colors truncate max-w-[100px]"
            >
              {product.category.name}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
