import Link from "next/link";
import Image from "next/image";
import { Show, UserButton } from "@clerk/nextjs";
import { ShoppingBag, Store, Search } from "lucide-react";
import MobileNav from "./MobileNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="axm-container">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="AXIUMarket — Accueil">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-brand-green)" }}
            >
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-lg font-extrabold tracking-tight hidden sm:block"
              style={{ color: "var(--color-neutral-900)" }}
            >
              AXIU<span style={{ color: "var(--color-brand-green)" }}>Market</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
            <Link href="/products" className="nav-link px-3 py-2 rounded-md text-sm">
              Produits
            </Link>
            <Link href="/shops" className="nav-link px-3 py-2 rounded-md text-sm">
              Boutiques
            </Link>
            <Link href="/search" className="nav-link px-3 py-2 rounded-md text-sm">
              Rechercher
            </Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search Icon */}
            <Link
              href="/search"
              className="p-2 rounded-full text-slate-500 hover:text-green-600 hover:bg-green-50 transition-colors"
              aria-label="Rechercher"
            >
              <Search className="w-4 h-4" />
            </Link>

            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors px-3 py-2"
              >
                Connexion
              </Link>
              <Link
                href="/sign-up"
                className="btn btn-brand btn-sm rounded-lg px-4 text-sm"
              >
                S&apos;inscrire
              </Link>
            </Show>

            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-green-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-green-50"
              >
                <Store className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <UserButton />
            </Show>
          </div>

          {/* Mobile: Search + UserButton + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/search"
              className="p-2 rounded-full text-slate-500 hover:text-green-600 transition-colors"
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
