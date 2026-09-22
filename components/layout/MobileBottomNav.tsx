"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Store, User } from "lucide-react";
import { Show } from "@clerk/nextjs";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isHomeActive = pathname === "/";
  const isProductsActive = pathname.startsWith("/products") || pathname.startsWith("/categories") || pathname.startsWith("/search");
  const isShopsActive = pathname.startsWith("/shops");
  const isAccountActive = pathname.startsWith("/dashboard") || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(15,41,26,0.06)] px-3 py-1.5 transition-transform"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 0.6rem)",
      }}
      aria-label="Navigation mobile principale"
    >
      <div className="grid grid-cols-4 items-center justify-around max-w-md mx-auto">
        {/* Tab 1: Accueil */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            isHomeActive
              ? "text-green-700 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
          aria-current={isHomeActive ? "page" : undefined}
        >
          <div
            className={`p-1.5 rounded-xl transition-colors ${
              isHomeActive ? "bg-green-50 text-green-700" : ""
            }`}
          >
            <Home className={`w-5 h-5 ${isHomeActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          </div>
          <span className="text-[11px] tracking-tight mt-0.5">Accueil</span>
        </Link>

        {/* Tab 2: Produits */}
        <Link
          href="/products"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            isProductsActive
              ? "text-green-700 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
          aria-current={isProductsActive ? "page" : undefined}
        >
          <div
            className={`p-1.5 rounded-xl transition-colors ${
              isProductsActive ? "bg-green-50 text-green-700" : ""
            }`}
          >
            <ShoppingBag className={`w-5 h-5 ${isProductsActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          </div>
          <span className="text-[11px] tracking-tight mt-0.5">Produits</span>
        </Link>

        {/* Tab 3: Boutiques */}
        <Link
          href="/shops"
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            isShopsActive
              ? "text-green-700 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
          aria-current={isShopsActive ? "page" : undefined}
        >
          <div
            className={`p-1.5 rounded-xl transition-colors ${
              isShopsActive ? "bg-green-50 text-green-700" : ""
            }`}
          >
            <Store className={`w-5 h-5 ${isShopsActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          </div>
          <span className="text-[11px] tracking-tight mt-0.5">Boutiques</span>
        </Link>

        {/* Tab 4: Compte / Connexion */}
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              isAccountActive
                ? "text-green-700 font-bold"
                : "text-slate-500 hover:text-slate-800 font-medium"
            }`}
            aria-current={isAccountActive ? "page" : undefined}
          >
            <div
              className={`p-1.5 rounded-xl transition-colors ${
                isAccountActive ? "bg-green-50 text-green-700" : ""
              }`}
            >
              <User className={`w-5 h-5 ${isAccountActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
            </div>
            <span className="text-[11px] tracking-tight mt-0.5">Vendeur</span>
          </Link>
        </Show>

        <Show when="signed-out">
          <Link
            href="/sign-in"
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              isAccountActive
                ? "text-green-700 font-bold"
                : "text-slate-500 hover:text-slate-800 font-medium"
            }`}
            aria-current={isAccountActive ? "page" : undefined}
          >
            <div
              className={`p-1.5 rounded-xl transition-colors ${
                isAccountActive ? "bg-green-50 text-green-700" : ""
              }`}
            >
              <User className={`w-5 h-5 ${isAccountActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
            </div>
            <span className="text-[11px] tracking-tight mt-0.5">Connexion</span>
          </Link>
        </Show>
      </div>
    </nav>
  );
}
