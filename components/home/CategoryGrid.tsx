import Link from "next/link";
import {
  Monitor, Shirt, Utensils, Home, Sparkles, Dumbbell, Wrench, Cpu, Package
} from "lucide-react";
import type { CategoryWithCount } from "@/types";

// Map category slugs to icons
const categoryIcons: Record<string, React.ElementType> = {
  "electronique": Monitor,
  "informatique": Cpu,
  "mode": Shirt,
  "vetements": Shirt,
  "alimentation": Utensils,
  "maison": Home,
  "beaute": Sparkles,
  "sport": Dumbbell,
  "services": Wrench,
};

function getCategoryIcon(slug: string): React.ElementType {
  const key = Object.keys(categoryIcons).find((k) =>
    slug.toLowerCase().includes(k)
  );
  return key ? categoryIcons[key] : Package;
}

interface CategoryGridProps {
  categories: CategoryWithCount[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.slug);
        const productCount = category._count.products;

        return (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group flex flex-col items-center p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 text-center transition-all duration-150 hover:border-green-600/50 hover:shadow-[0_4px_12px_rgba(15,41,26,0.06)] hover:-translate-y-0.5 focus-visible:rounded-2xl"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700 transition-colors duration-150 group-hover:bg-green-50 group-hover:text-green-700 mb-3"
            >
              <Icon
                className="w-6 h-6"
                aria-hidden="true"
              />
            </div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-green-800 transition-colors leading-snug line-clamp-1">
              {category.name}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {productCount > 0
                ? `${productCount} produit${productCount > 1 ? "s" : ""}`
                : "Voir le rayon"}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
