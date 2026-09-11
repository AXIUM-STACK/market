import Link from "next/link";
import { ShoppingBag, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold text-green-700 uppercase tracking-widest">
            Erreur 404
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Page introuvable
          </h1>
          <p className="text-sm text-slate-500">
            Désolé, la page, la boutique ou le produit que vous recherchez n&apos;existe pas ou a été déplacé.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="btn btn-brand w-full sm:w-auto rounded-xl flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l&apos;accueil</span>
          </Link>
          <Link
            href="/search"
            className="btn btn-secondary w-full sm:w-auto rounded-xl flex items-center justify-center gap-2 text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Rechercher un produit</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
