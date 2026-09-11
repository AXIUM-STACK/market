"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Super Admin Dashboard Error:", error);
  }, [error]);

  return (
    <div className="bg-white rounded-2xl border border-red-100 p-8 text-center max-w-lg mx-auto my-12 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h2 className="text-lg font-extrabold text-slate-900 mb-1">
        Erreur de chargement administrative
      </h2>
      <p className="text-xs text-slate-500 mb-6">
        Une erreur est survenue lors du chargement des données de modération. Vous pouvez réessayer ou revenir au tableau de bord.
      </p>

      {error?.digest && (
        <p className="text-[11px] font-mono text-slate-400 mb-4 bg-slate-50 py-1 px-2 rounded-lg inline-block">
          Code erreur : {error.digest}
        </p>
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="btn btn-sm btn-brand rounded-xl flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Réessayer</span>
        </button>
        <Link
          href="/admin"
          className="btn btn-sm btn-secondary rounded-xl flex items-center gap-1.5 text-xs"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Vue générale</span>
        </Link>
      </div>
    </div>
  );
}
