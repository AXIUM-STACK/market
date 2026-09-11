import LoadingSkeleton from "@/components/common/LoadingSkeleton";

export default function PublicLoading() {
  return (
    <div className="axm-container py-8 md:py-12 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="skeleton h-8 w-64 rounded-xl" />
        <div className="skeleton h-4 w-96 max-w-full rounded-lg" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="product-card overflow-hidden">
            <div className="skeleton" style={{ aspectRatio: "4/3" }} />
            <div className="p-3 space-y-2">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-5 w-1/3 rounded mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
