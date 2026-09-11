"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Search, Store, User } from "lucide-react";
import { Show } from "@clerk/nextjs";

interface NavTab {
  label: string;
  href: string;
  icon: typeof Home;
  isActive: (pathname: string) => boolean;
}

const tabs: NavTab[] = [
  {
    label: "Accueil",
    href: "/",
    icon: Home,
    isActive: (p) => p === "/",
  },
  {
    label: "Produits",
    href: "/products",
    icon: ShoppingBag,
    isActive: (p) => p.startsWith("/products") || p.startsWith("/categories"),
  },
  {
    label: "Recherche",
    href: "/search",
    icon: Search,
    isActive: (p) => p.startsWith("/search"),
  },
  {
    label: "Boutiques",
    href: "/shops",
    icon: Store,
    isActive: (p) => p.startsWith("/shops"),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-transform"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)",
      }}
      aria-label="Navigation mobile en bas"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = tab.isActive(pathname);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
                active
                  ? "text-green-600 font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <div
                className={`relative p-1 rounded-xl transition-colors ${
                  active ? "bg-green-50 text-green-600" : ""
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </Link>
          );
        })}

        {/* Account Tab (Dashboard if signed in, Sign in if signed out) */}
        <Show when="signed-in">
          {(() => {
            const active = pathname.startsWith("/dashboard");
            return (
              <Link
                href="/dashboard"
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
                  active
                    ? "text-green-600 font-bold"
                    : "text-slate-500 hover:text-slate-800 font-medium"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <div
                  className={`relative p-1 rounded-xl transition-colors ${
                    active ? "bg-green-50 text-green-600" : ""
                  }`}
                >
                  <User className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Compte</span>
              </Link>
            );
          })()}
        </Show>

        <Show when="signed-out">
          {(() => {
            const active = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
            return (
              <Link
                href="/sign-in"
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all ${
                  active
                    ? "text-green-600 font-bold"
                    : "text-slate-500 hover:text-slate-800 font-medium"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <div
                  className={`relative p-1 rounded-xl transition-colors ${
                    active ? "bg-green-50 text-green-600" : ""
                  }`}
                >
                  <User className={`w-5 h-5 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Connexion</span>
              </Link>
            );
          })()}
        </Show>
      </div>
    </nav>
  );
}
