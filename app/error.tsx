"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors for debugging
    console.error("AXIUMarket Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Une erreur inattendue est survenue
          </h1>
          <p className="text-sm text-slate-500">
            Nous avons rencontré un problème lors du chargement de cette page. Veuillez réessayer ou retourner à l&apos;accueil.
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-slate-400">Code: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="btn btn-brand w-full sm:w-auto rounded-xl flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
          <Link
            href="/"
            className="btn btn-secondary w-full sm:w-auto rounded-xl flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            <span>Accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
