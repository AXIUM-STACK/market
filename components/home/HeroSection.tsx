"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Store, TrendingUp } from "lucide-react";
import Link from "next/link";

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
    <section className="hero-section relative" aria-labelledby="hero-heading">
      <div className="axm-container py-20 md:py-28 relative z-10">
        {/* Eyebrow */}
        <div className="flex items-center justify-center mb-5">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-4 py-1.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            La marketplace de votre quartier
          </span>
        </div>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white text-center leading-tight mb-5 max-w-4xl mx-auto"
        >
          Découvrez les produits des commerces{" "}
          <span className="text-green-300">près de chez vous</span>
        </h1>

        {/* Subheadline */}
        <p className="text-base md:text-lg text-green-100 text-center mb-10 max-w-xl mx-auto leading-relaxed">
          Explorez les boutiques locales, trouvez ce que vous cherchez et contactez
          directement les marchands sur{" "}
          <strong className="text-white">WhatsApp</strong>.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto mb-8"
          role="search"
          aria-label="Rechercher des produits"
        >
          <label htmlFor="hero-search" className="sr-only">
            Rechercher des produits ou boutiques
          </label>
          <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" aria-hidden="true" />
          <input
            id="hero-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Téléphone, vêtements, alimentation..."
            className="flex-1 py-4 px-3 text-slate-700 outline-none bg-transparent text-sm md:text-base placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="btn-brand shrink-0 py-3 px-6 text-sm font-bold rounded-none rounded-r-2xl m-0.5"
          >
            Rechercher
          </button>
        </form>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-green-200 text-sm">Explorer :</span>
          {["Électronique", "Mode", "Alimentation", "Beauté"].map((cat) => (
            <Link
              key={cat}
              href={`/search?q=${encodeURIComponent(cat)}`}
              className="text-sm bg-white/10 border border-white/20 text-white/90 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 mt-12 pt-12 border-t border-white/10">
          {[
            { label: "Boutiques", value: "100+" },
            { label: "Produits", value: "1 000+" },
            { label: "Marchands", value: "50+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-extrabold text-white">{stat.value}</div>
              <div className="text-xs text-green-200 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
    </section>
  );
}
