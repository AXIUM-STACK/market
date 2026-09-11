import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
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
    OUT_OF_STOCK: "Rupture",
    DRAFT: "Brouillon",
    ARCHIVED: "Archivé",
  };

  const labelClasses: Record<string, string> = {
    OUT_OF_STOCK: "badge-out-of-stock",
    DRAFT: "badge-archived",
    ARCHIVED: "badge-archived",
  };

  return (
    <span
      className={`badge badge-sm border ${labelClasses[status] ?? "badge-archived"}`}
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
    ? buildImageKitUrl(primaryImage.url, { width: 400, height: 300, quality: 80, format: "webp" })
    : null;

  const productDetailUrl = `/products/${product.slug}`;

  return (
    <article className="product-card group relative">
      {/* Image */}
      <Link href={productDetailUrl} className="block" tabIndex={-1} aria-hidden="true">
        <div className="relative product-card-image overflow-hidden bg-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={primaryImage?.altText ?? product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="img-placeholder absolute inset-0">
              <Package className="w-10 h-10 opacity-30" aria-hidden="true" />
            </div>
          )}

          {/* Status overlay */}
          {product.status !== "ACTIVE" && (
            <div className="absolute top-2 left-2">
              <ProductStatusBadge status={product.status} />
            </div>
          )}

          {/* Favorite Button — top right */}
          {currentUserId && (
            <div className="absolute top-2 right-2">
              <FavoriteButton
                productId={product.id}
                isFavorited={isFavorited}
              />
            </div>
          )}
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-3">
        {/* Shop info */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <Link
            href={`/shops/${product.shop.slug}`}
            className="text-xs text-slate-500 hover:text-green-600 transition-colors font-medium truncate"
          >
            {truncate(product.shop.name, 25)}
          </Link>
          {product.shop.merchant.isVerified && (
            <VerifiedBadge showLabel={false} size="sm" />
          )}
          {product.shop.status !== "ACTIVE" && (
            <span className="text-xs text-amber-600 font-medium">Pausée</span>
          )}
        </div>

        {/* Product Name */}
        <Link href={productDetailUrl}>
          <h3 className="text-sm font-semibold text-slate-800 leading-snug mb-2 hover:text-green-700 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Price + Category */}
        <div className="flex items-center justify-between gap-2">
          <span className="price-display text-base">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-xs text-slate-400 hover:text-green-600 transition-colors truncate"
            >
              {product.category.name}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
