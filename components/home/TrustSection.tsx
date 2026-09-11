import { Shield, MessageCircle, Search, Zap } from "lucide-react";

const trustPoints = [
  {
    icon: Search,
    title: "Découverte facile",
    description:
      "Parcourez des centaines de produits par catégorie, par boutique ou par recherche.",
    color: "#2563eb",
  },
  {
    icon: MessageCircle,
    title: "Contact direct WhatsApp",
    description:
      "Contactez les marchands directement sur WhatsApp. Pas d'intermédiaire, pas de commission.",
    color: "#16a34a",
  },
  {
    icon: Shield,
    title: "Marchands vérifiés",
    description:
      "Les marchands vérifiés sont identifiés par notre badge de confiance.",
    color: "#f59e0b",
  },
  {
    icon: Zap,
    title: "Rapide et simple",
    description:
      "Trouvez ce que vous cherchez en quelques secondes. Pas de compte requis pour parcourir.",
    color: "#9333ea",
  },
];

export default function TrustSection() {
  return (
    <section
      className="axm-section bg-slate-900 text-white"
      aria-labelledby="trust-heading"
    >
      <div className="axm-container">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            id="trust-heading"
            className="text-2xl md:text-3xl font-extrabold text-white mb-3"
          >
            Pourquoi choisir AXIUMarket ?
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Une expérience commerce simple, directe et humaine.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="flex flex-col gap-4 p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/8 transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${point.color}20` }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: point.color }}
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1.5">
                    {point.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
