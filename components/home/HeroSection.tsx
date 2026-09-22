"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, MessageCircle, Store, ArrowRight } from "lucide-react";
import Link from "next/link";

const popularQueries = [
  { label: "Smartphones", query: "téléphone" },
  { label: "Chaussures & Mode", query: "mode" },
  { label: "Ordinateurs & Accessoires", query: "informatique" },
  { label: "Alimentation", query: "alimentation" },
  { label: "Maison & Électroménager", query: "maison" },
];

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section
      className="relative bg-gradient-to-b from-emerald-50/80 via-slate-50/60 to-white border-b border-slate-200/80 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="axm-container py-12 sm:py-16 md:py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Market Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 shadow-xs">
            <Store className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>Place de marché pour commerces de proximité</span>
          </div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-4"
          >
            Le grand marché digital de votre ville
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
            Parcourez les rayons des boutiques locales, vérifiez la disponibilité des articles et commandez directement auprès des marchands sur WhatsApp.
          </p>

          {/* Search Console */}
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-white rounded-2xl p-1.5 shadow-[0_6px_25px_rgba(15,41,26,0.08)] border border-slate-300/80 max-w-2xl mx-auto mb-6 text-slate-800 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-600/10 transition-all"
            role="search"
            aria-label="Rechercher des produits ou boutiques"
          >
            <label htmlFor="hero-search" className="sr-only">
              Rechercher des produits ou boutiques
            </label>
            <div className="pl-3.5 text-slate-400">
              <Search className="w-5 h-5" aria-hidden="true" />
            </div>
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Que recherchez-vous ? (ex: iPhone, Robe, Sac de riz...)"
              className="flex-1 py-3 px-3 text-slate-800 outline-none bg-transparent text-sm md:text-base placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="btn-brand shrink-0 py-3 px-5 sm:px-7 text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Chercher</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </button>
          </form>

          {/* Popular Tag Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Recherches fréquentes :</span>
            {popularQueries.map((item) => (
              <Link
                key={item.label}
                href={`/search?q=${encodeURIComponent(item.query)}`}
                className="bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/90 px-3 py-1.5 rounded-lg transition-colors font-semibold shadow-xs"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Real Commerce Pillars - Light, clean, trustworthy */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-200/70 max-w-4xl mx-auto">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">Contact WhatsApp Direct</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Discutez avec le vendeur, négociez et convenez du mode de livraison sans intermédiaire.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">Marchands Certifiés</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Boutiques authentifiées avec numéro de téléphone professionnel et localisation vérifiée.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200/80 flex items-center justify-center text-green-700 shrink-0 mt-0.5">
              <Store className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">Stock Réel en Ville</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Articles disponibles physiquement dans les magasins de votre agglomération.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
