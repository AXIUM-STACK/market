export default function ProductDetailLoading() {
  return (
    <div className="axm-container py-6 md:py-10">
      {/* Breadcrumb skeleton */}
      <div className="skeleton h-4 w-64 rounded mb-6" aria-hidden="true" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery skeleton */}
        <div>
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="flex gap-2 mt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton w-16 h-16 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Details skeleton */}
        <div className="space-y-4">
          <div className="skeleton h-5 w-24 rounded-full" />
          <div className="skeleton h-9 w-4/5 rounded" />
          <div className="skeleton h-9 w-1/3 rounded" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-4 w-4/6 rounded" />
          </div>
          <div className="skeleton h-14 w-full rounded-xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
