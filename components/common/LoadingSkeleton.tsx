interface LoadingSkeletonProps {
  variant?: "product-card" | "shop-card" | "product-detail" | "text";
  count?: number;
}

function ProductCardSkeleton() {
  return (
    <div className="product-card overflow-hidden" aria-hidden="true">
      <div className="skeleton" style={{ aspectRatio: "4/3" }} />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-5 w-1/3 rounded mt-3" />
      </div>
    </div>
  );
}

function ShopCardSkeleton() {
  return (
    <div className="shop-card overflow-hidden" aria-hidden="true">
      <div className="skeleton" style={{ height: "120px" }} />
      <div className="p-4 space-y-2">
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="skeleton rounded-2xl" style={{ aspectRatio: "1/1" }} />
      <div className="space-y-3">
        <div className="skeleton h-7 w-4/5 rounded" />
        <div className="skeleton h-5 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
      </div>
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-5/6 rounded" />
      <div className="skeleton h-4 w-4/6 rounded" />
    </div>
  );
}

export default function LoadingSkeleton({
  variant = "product-card",
  count = 1,
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  const renderSkeleton = () => {
    switch (variant) {
      case "product-card":
        return <ProductCardSkeleton />;
      case "shop-card":
        return <ShopCardSkeleton />;
      case "product-detail":
        return <ProductDetailSkeleton />;
      case "text":
        return <TextSkeleton />;
    }
  };

  return (
    <div role="status" aria-label="Chargement en cours...">
      {items.map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}
