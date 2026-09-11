import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import type { ProductCard as ProductCardType } from "@/types";

interface RecentProductsProps {
  products: ProductCardType[];
  favoriteIds: Set<string>;
  currentUserId: string | null;
}

export default function RecentProducts({
  products,
  favoriteIds,
  currentUserId,
}: RecentProductsProps) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currentUserId={currentUserId}
            isFavorited={favoriteIds.has(product.id)}
          />
        ))}
      </div>
      <div className="text-center mt-8">
        <Link
          href="/products"
          className="btn btn-outline-brand rounded-xl px-8 py-2.5 text-sm font-semibold"
        >
          Voir tous les produits
        </Link>
      </div>
    </div>
  );
}
