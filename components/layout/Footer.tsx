import Link from "next/link";
import { ShoppingBag, MessageCircle, Store, Shield, ChevronRight } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";

const footerLinks = {
  marketplace: [
    { label: "Tous les produits", href: "/products" },
    { label: "Toutes les boutiques", href: "/shops" },
    { label: "Rechercher", href: "/search" },
  ],
  merchants: [
    { label: "Créer une boutique", href: "/dashboard/shops/new" },
    { label: "Mon tableau de bord", href: "/dashboard" },
    { label: "Mes produits", href: "/dashboard/products" },
    { label: "Mon profil", href: "/dashboard/profile" },
  ],
  legal: [
    { label: "À propos", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Conditions d'utilisation", href: "/terms" },
    { label: "Politique de confidentialité", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white" role="contentinfo">
      {/* CTA Banner */}
      <div
        className="border-b border-white/10 py-10"
        style={{ backgroundColor: "var(--color-brand-green)" }}
      >
        <div className="axm-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Vous avez une boutique ? Rejoignez AXIUMarket.
              </h2>
              <p className="text-green-100 mt-1 text-sm">
                Publiez vos produits gratuitement et recevez des clients directement sur WhatsApp.
              </p>
            </div>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shrink-0 text-sm"
            >
              Créer mon compte
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="axm-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--color-brand-green)" }}
              >
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-white">
                AXIU<span style={{ color: "var(--color-brand-green-light)" }}>Market</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              La marketplace de confiance pour découvrir les produits des commerces de votre quartier.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Marketplace
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.marketplace.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Merchant Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Marchands
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.merchants.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Informations
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-green-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="axm-container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} AXIUMarket. Tous droits réservés.</p>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              <span>Transactions sécurisées via WhatsApp</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
