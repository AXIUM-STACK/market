import Link from "next/link";
import { Store, ChevronRight, Check } from "lucide-react";

const benefits = [
  "Publiez vos produits gratuitement",
  "Recevez des clients sur WhatsApp",
  "Gérez votre boutique depuis votre téléphone",
  "Visibilité auprès de milliers d'acheteurs",
];

export default function MerchantCTA() {
  return (
    <section
      className="axm-section"
      aria-labelledby="merchant-cta-heading"
    >
      <div className="axm-container">
        <div
          className="rounded-3xl p-6 sm:p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6 md:gap-8 overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)",
            border: "1px solid #86efac",
          }}
        >
          {/* Decorative circle */}
          <div
            className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-20"
            style={{ backgroundColor: "var(--color-brand-green)" }}
            aria-hidden="true"
          />
          <div
            className="absolute -right-4 -bottom-8 w-32 h-32 rounded-full opacity-10"
            style={{ backgroundColor: "var(--color-brand-green)" }}
            aria-hidden="true"
          />

          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--color-brand-green)" }}
          >
            <Store className="w-8 h-8 text-white" aria-hidden="true" />
          </div>

          {/* Content */}
          <div className="flex-1 relative z-10">
            <h2
              id="merchant-cta-heading"
              className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3"
            >
              Vous avez une boutique ?{" "}
              <span style={{ color: "var(--color-brand-green)" }}>
                Rejoignez AXIUMarket.
              </span>
            </h2>
            <p className="text-slate-600 text-sm mb-5">
              Créez votre vitrine digitale en quelques minutes et commencez à
              recevoir des clients directement sur WhatsApp.
            </p>

            {/* Benefits */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check
                    className="w-4 h-4 shrink-0"
                    style={{ color: "var(--color-brand-green)" }}
                    aria-hidden="true"
                  />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/sign-up"
                className="btn btn-brand rounded-xl px-7 py-3 text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto text-center"
              >
                Créer ma boutique
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href="/dashboard"
                className="btn btn-outline-brand rounded-xl px-4 sm:px-7 py-3 text-sm font-semibold flex items-center justify-center w-full sm:w-auto text-center whitespace-normal sm:whitespace-nowrap"
              >
                Déjà inscrit ? Mon tableau de bord
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
