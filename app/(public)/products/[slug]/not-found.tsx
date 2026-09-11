import Link from "next/link";
import { PackageOpen } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="axm-container py-20 flex flex-col items-center justify-center text-center">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{ backgroundColor: "var(--color-brand-green-50)" }}
      >
        <PackageOpen
          className="w-10 h-10"
          style={{ color: "var(--color-brand-green)" }}
          aria-hidden="true"
        />
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
        Produit introuvable
      </h1>
      <p className="text-slate-500 text-sm max-w-sm mb-8">
        Ce produit n&apos;existe pas ou a été retiré de la vente.
        Découvrez d&apos;autres produits sur AXIUMarket.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/products" className="btn btn-brand rounded-xl px-6">
          Voir les produits
        </Link>
        <Link href="/" className="btn btn-outline-brand rounded-xl px-6">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
