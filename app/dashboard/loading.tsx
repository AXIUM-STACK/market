export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-4 w-72 rounded-lg" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-7 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <div className="skeleton h-5 w-36 rounded" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
