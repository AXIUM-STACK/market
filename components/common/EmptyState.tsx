import { PackageOpen, Store, Search, AlertCircle } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  variant?: "products" | "shops" | "search" | "favorites" | "generic";
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

const variants = {
  products: {
    icon: PackageOpen,
    defaultTitle: "Aucun produit trouvé",
    defaultDescription: "Essayez d'autres filtres ou revenez plus tard.",
  },
  shops: {
    icon: Store,
    defaultTitle: "Aucune boutique trouvée",
    defaultDescription: "Il n'y a pas encore de boutiques dans cette catégorie.",
  },
  search: {
    icon: Search,
    defaultTitle: "Aucun résultat",
    defaultDescription: "Votre recherche n'a pas retourné de résultats. Essayez d'autres mots-clés.",
  },
  favorites: {
    icon: PackageOpen,
    defaultTitle: "Aucun favori",
    defaultDescription: "Vous n'avez pas encore de produits favoris. Explorez et ajoutez-en!",
  },
  generic: {
    icon: AlertCircle,
    defaultTitle: "Rien à afficher",
    defaultDescription: "Il n'y a rien à afficher pour le moment.",
  },
};

export default function EmptyState({
  variant = "generic",
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: "var(--color-brand-green-50)" }}
      >
        <Icon
          className="w-8 h-8"
          style={{ color: "var(--color-brand-green)" }}
          aria-hidden="true"
        />
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--color-neutral-800)" }}
      >
        {title ?? config.defaultTitle}
      </h3>
      <p
        className="text-sm max-w-sm leading-relaxed"
        style={{ color: "var(--color-neutral-500)" }}
      >
        {description ?? config.defaultDescription}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 btn btn-brand btn-sm rounded-lg px-5"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
