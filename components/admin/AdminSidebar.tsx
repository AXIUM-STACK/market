"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  ShieldCheck,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  {
    label: "Vue d'ensemble",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Modération Boutiques",
    href: "/admin/shops",
    icon: Store,
  },
  {
    label: "Modération Produits",
    href: "/admin/products",
    icon: Package,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3"
      aria-label="Navigation Super Admin"
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-3 py-3 mb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-tight">
            Super Admin
          </p>
          <p className="text-[10px] text-slate-400">Modération AXIUMarket</p>
        </div>
      </div>

      {/* Nav Items */}
      <ul className="space-y-1" role="list">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Navigation links back to Merchant & Marketplace */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Espace Marchand</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Retour au marketplace</span>
        </Link>
      </div>
    </nav>
  );
}
