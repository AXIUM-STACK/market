import { MessageCircle, ShieldCheck, Store, Smartphone } from "lucide-react";

const trustPillars = [
  {
    icon: MessageCircle,
    title: "Vente directe sur WhatsApp",
    description:
      "Échangez directement avec le commerçant. Négociez le prix, posez vos questions et convenez du mode de livraison sans commission intermédiaire.",
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-50 border-emerald-200/80",
  },
  {
    icon: ShieldCheck,
    title: "Marchands vérifiés",
    description:
      "Les boutiques certifiées sont contrôlées par notre équipe : numéro WhatsApp professionnel validé et existence physique confirmée.",
    iconColor: "text-amber-700",
    iconBg: "bg-amber-50 border-amber-200/80",
  },
  {
    icon: Store,
    title: "Commerces de votre ville",
    description:
      "Accédez aux rayons des magasins réels de votre agglomération. Retirez vos articles sur place ou organisez une livraison locale rapide.",
    iconColor: "text-green-700",
    iconBg: "bg-green-50 border-green-200/80",
  },
  {
    icon: Smartphone,
    title: "Rapide & Économe en données",
    description:
      "Une interface légère, fluide sur tous les smartphones, pensée pour consommer un minimum de données mobiles lors de vos recherches.",
    iconColor: "text-slate-700",
    iconBg: "bg-slate-100 border-slate-200",
  },
];

export default function TrustSection() {
  return (
    <section
      className="axm-section bg-slate-50/70 border-b border-slate-200/80"
      aria-labelledby="trust-heading"
    >
      <div className="axm-container">
        {/* Heading */}
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h2
            id="trust-heading"
            className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2.5"
          >
            Pourquoi acheter sur AXIUMarket ?
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Le modèle de proximité qui unit la vitrine en ligne et la simplicité du commerce direct.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {trustPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-sm hover:border-slate-300 transition-all"
              >
                <div>
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${pillar.iconBg} ${pillar.iconColor}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {pillar.description}
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
