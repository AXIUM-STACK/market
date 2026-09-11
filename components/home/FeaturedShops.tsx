import Link from "next/link";
import ShopCard from "@/components/shops/ShopCard";
import type { ShopCard as ShopCardType } from "@/types";

interface FeaturedShopsProps {
  shops: ShopCardType[];
}

export default function FeaturedShops({ shops }: FeaturedShopsProps) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
      <div className="text-center mt-8">
        <Link
          href="/shops"
          className="btn btn-outline-brand rounded-xl px-8 py-2.5 text-sm font-semibold"
        >
          Voir toutes les boutiques
        </Link>
      </div>
    </div>
  );
}

