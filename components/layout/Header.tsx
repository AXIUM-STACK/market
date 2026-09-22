import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { ShoppingBag, Store, Search, PlusCircle } from "lucide-react";
import MobileNav from "./MobileNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(15,41,26,0.03)]">
      <div className="axm-container">
        <div className="flex items-center justify-between h-16 md:h-18 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group focus-visible:rounded-lg"
            aria-label="AXIUMarket — Accueil"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-xs"
              style={{ backgroundColor: "var(--color-brand-green)" }}
            >
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                AXIU<span style={{ color: "var(--color-brand-green)" }}>Market</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5 hidden sm:block">
                Marché Local
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar (Direct Utility) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <form
              action="/search"
              method="GET"
              className="relative w-full flex items-center"
              role="search"
            >
              <label htmlFor="header-search-input" className="sr-only">
                Rechercher un produit ou une boutique
              </label>
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
              <input
                id="header-search-input"
                name="q"
                type="search"
                placeholder="Rechercher un produit, une boutique..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/10 transition-all"
              />
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Navigation principale">
            <Link
              href="/products"
              className="nav-link px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Produits
            </Link>
            <Link
              href="/shops"
              className="nav-link px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50"
            >
              Boutiques
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-slate-700 hover:text-green-700 transition-colors px-3 py-1.5"
              >
                Connexion
              </Link>
              <Link
                href="/sign-up"
                className="btn-brand text-sm px-4 py-2 flex items-center gap-1.5 shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-emerald-200" />
                <span>Ouvrir ma boutique</span>
              </Link>
            </Show>

            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-green-700 transition-colors px-3.5 py-1.5 rounded-lg hover:bg-green-50 border border-slate-200/80"
              >
                <Store className="w-4 h-4 text-green-700" />
                <span>Mon Espace Vendeur</span>
              </Link>
              <div className="pl-1 border-l border-slate-200">
                <UserButton />
              </div>
            </Show>
          </div>

          {/* Mobile Right Controls: Search + Auth + Drawer */}
          <div className="md:hidden flex items-center gap-1.5">
            <Link
              href="/search"
              className="p-2 rounded-lg text-slate-600 hover:text-green-700 hover:bg-slate-100 transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </Link>
            <Show when="signed-in">
              <UserButton />
            </Show>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
