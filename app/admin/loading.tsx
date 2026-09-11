export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Chargement du tableau de bord">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="skeleton h-7 w-60 rounded-xl bg-slate-200" />
        <div className="skeleton h-4 w-96 rounded-lg bg-slate-200" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3"
          >
            <div className="skeleton h-9 w-9 rounded-xl bg-slate-200" />
            <div className="skeleton h-7 w-16 rounded bg-slate-200" />
            <div className="skeleton h-3 w-28 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-5 w-48 rounded bg-slate-200" />
          <div className="skeleton h-4 w-20 rounded bg-slate-200" />
        </div>
        <div className="space-y-2.5 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
