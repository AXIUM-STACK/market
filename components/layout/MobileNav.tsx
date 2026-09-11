"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Menu, X, ShoppingBag, Store, LogIn, UserPlus } from "lucide-react";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="p-2 rounded-md text-slate-600 hover:text-green-600 hover:bg-green-50 transition-colors"
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Render drawer via Portal directly to body */}
      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 transition-opacity"
              onClick={close}
              aria-hidden="true"
            />

            {/* Drawer */}
            <nav
              id="mobile-nav-menu"
              className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200"
              aria-label="Navigation mobile"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-brand-green)" }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-extrabold text-slate-900">
                    AXIU<span className="text-green-600">Market</span>
                  </span>
                </div>
                <button
                  onClick={close}
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Fermer le menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <Link href="/" onClick={close} className="sidebar-link">
                  <ShoppingBag className="w-4 h-4" />
                  Accueil
                </Link>
                <Link href="/products" onClick={close} className="sidebar-link">
                  <ShoppingBag className="w-4 h-4" />
                  Produits
                </Link>
                <Link href="/shops" onClick={close} className="sidebar-link">
                  <Store className="w-4 h-4" />
                  Boutiques
                </Link>
                <Link href="/search" onClick={close} className="sidebar-link">
                  <span className="w-4 h-4 text-center text-sm">🔍</span>
                  Rechercher
                </Link>

                <div className="border-t border-slate-100 my-3" />

                <Show when="signed-in">
                  <Link href="/dashboard" onClick={close} className="sidebar-link">
                    <Store className="w-4 h-4" />
                    Mon Dashboard
                  </Link>
                  <Link href="/dashboard/settings" onClick={close} className="sidebar-link">
                    <span className="w-4 h-4 text-center text-sm">⚙️</span>
                    Paramètres
                  </Link>
                </Show>

                <Show when="signed-out">
                  <Link href="/sign-in" onClick={close} className="sidebar-link">
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </Link>
                  <Link href="/sign-up" onClick={close} className="sidebar-link font-semibold text-green-600">
                    <UserPlus className="w-4 h-4" />
                    S&apos;inscrire
                  </Link>
                </Show>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center">
                  © {new Date().getFullYear()} AXIUMarket
                </p>
              </div>
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
