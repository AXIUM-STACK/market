"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Store,
  User,
  Settings,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  {
    label: "Vue d'ensemble",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Mes produits",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    label: "Mes boutiques",
    href: "/dashboard/shops",
    icon: Store,
  },
  {
    label: "Mon profil",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    label: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

interface DashboardSidebarProps {
  isSuperAdmin?: boolean;
}

export default function DashboardSidebar({ isSuperAdmin = false }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3"
      aria-label="Navigation du tableau de bord"
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-3 py-3 mb-2 border-b border-slate-100">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "var(--color-brand-green)" }}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-white" aria-hidden="true" />
        </div>
        <span className="text-sm font-bold text-slate-800">
          AXIU<span style={{ color: "var(--color-brand-green)" }}>Market</span>
        </span>
      </div>

      {/* Nav Items */}
      <ul className="space-y-0.5" role="list">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Super Admin Access */}
      {isSuperAdmin && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <Link
            href="/admin"
            className={`sidebar-link text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 font-semibold text-xs`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600" aria-hidden="true" />
            <span>Super Admin</span>
          </Link>
        </div>
      )}

      {/* Marketplace Link */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <Link
          href="/"
          className="sidebar-link text-xs text-slate-400"
        >
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Retour au marketplace
        </Link>
      </div>
    </nav>
  );
}
