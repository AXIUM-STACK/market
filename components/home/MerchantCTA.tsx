import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function MerchantCTA() {
  return (
    <section className="axm-section" aria-labelledby="merchant-cta-heading">
      <div className="axm-container">
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_rgba(15,41,26,0.05)] p-6 sm:p-10 md:p-14 overflow-hidden relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200/80 text-green-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-green-600" />
              <span>Espace Commerçants & Vendeurs Locaux</span>
            </div>

            <h2
              id="merchant-cta-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4"
            >
              Donnez à votre boutique une vitrine digitale puissante
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
              Publiez votre catalogue, touchez de nouveaux clients dans votre ville et concluez vos ventes directement sur WhatsApp sans payer de commission sur chaque transaction.
            </p>

            {/* 3 Step Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-green-700 block mb-1">Étape 1</span>
                <p className="text-xs font-semibold text-slate-800">Créez votre profil marchand</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Inscription rapide avec votre numéro WhatsApp.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-green-700 block mb-1">Étape 2</span>
                <p className="text-xs font-semibold text-slate-800">Ajoutez vos produits</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Photos, prix en CDF/USD et détails de stock.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-green-700 block mb-1">Étape 3</span>
                <p className="text-xs font-semibold text-slate-800">Vendez en direct</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Les clients vous contactent en un clic.</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/sign-up"
                className="btn-brand px-6 py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-sm text-center"
              >
                <span>Ouvrir ma boutique gratuitement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="btn-outline-brand px-6 py-3.5 text-sm font-semibold flex items-center justify-center text-center hover:bg-green-50"
              >
                Déjà inscrit ? Mon tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
