import Link from "next/link";
import { ShoppingBag, ShieldCheck, MapPin } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";

const footerLinks = {
  marketplace: [
    { label: "Catalogue des produits", href: "/products" },
    { label: "Boutiques certifiées", href: "/shops" },
    { label: "Recherche par mot-clé", href: "/search" },
    { label: "Produits en vedette", href: "/products?featured=true" },
  ],
  merchants: [
    { label: "Ouvrir une boutique", href: "/sign-up" },
    { label: "Tableau de bord marchand", href: "/dashboard" },
    { label: "Gestion des produits", href: "/dashboard/products" },
    { label: "Certification & confiance", href: "/dashboard/profile" },
  ],
  information: [
    { label: "Fonctionnement de la plateforme", href: "/#trust-heading" },
    { label: "Commerce sur WhatsApp", href: "/#trust-heading" },
    { label: "Conditions générales", href: "#" },
    { label: "Confidentialité & Données", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200/90 text-slate-700" role="contentinfo">
      {/* Main Footer Content */}
      <div className="axm-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Market Identity */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group focus-visible:rounded-lg">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                style={{ backgroundColor: "var(--color-brand-green)" }}
              >
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                AXIU<span style={{ color: "var(--color-brand-green)" }}>Market</span>
              </span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm mb-5">
              La place de marché de proximité qui connecte directement les commerçants locaux et les acheteurs. Consultez les catalogues en ligne et finalisez vos achats en direct sur WhatsApp.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-800 mb-6 bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-2 w-fit">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Marché local &middot; Prix en Franc Congolais (CDF) et USD</span>
            </div>

            {/* Social channels */}
            <div className="flex items-center gap-2.5">
              <a
                href="#"
                className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-xs"
                aria-label="Facebook"
              >
                <FaFacebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-xs"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-xs"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Marketplace Navigation */}
          <div>
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Place de Marché
            </p>
            <ul className="space-y-2.5" role="list">
              {footerLinks.marketplace.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-emerald-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Merchants Navigation */}
          <div>
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Espace Marchands
            </p>
            <ul className="space-y-2.5" role="list">
              {footerLinks.merchants.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-emerald-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Support */}
          <div>
            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Confiance & Sécurité
            </p>
            <ul className="space-y-2.5" role="list">
              {footerLinks.information.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-emerald-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Grounded Bottom Bar */}
      <div className="border-t border-slate-200 bg-white">
        <div className="axm-container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} AXIUMarket. Tous droits réservés.</p>
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Contact direct vérifié &middot; Zéro frais cachés</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
