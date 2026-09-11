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

// Gentle color palette for category cards
const cardColors = [
  { bg: "#f0fdf4", border: "#bbf7d0", icon: "#16a34a" },
  { bg: "#eff6ff", border: "#bfdbfe", icon: "#2563eb" },
  { bg: "#fff7ed", border: "#fed7aa", icon: "#ea580c" },
  { bg: "#fdf4ff", border: "#e9d5ff", icon: "#9333ea" },
  { bg: "#fefce8", border: "#fef08a", icon: "#ca8a04" },
  { bg: "#f0f9ff", border: "#bae6fd", icon: "#0284c7" },
  { bg: "#fff1f2", border: "#fecdd3", icon: "#e11d48" },
  { bg: "#f7fee7", border: "#d9f99d", icon: "#65a30d" },
];

interface CategoryGridProps {
  categories: CategoryWithCount[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
      {categories.map((category, i) => {
        const Icon = getCategoryIcon(category.slug);
        const color = cardColors[i % cardColors.length];
        const productCount = category._count.products;

        return (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            style={{
              backgroundColor: color.bg,
              borderColor: color.border,
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: `${color.icon}15` }}
            >
              <Icon
                className="w-6 h-6"
                style={{ color: color.icon }}
                aria-hidden="true"
              />
            </div>
            <div>
              <p
                className="text-sm font-semibold leading-snug"
                style={{ color: "var(--color-neutral-800)" }}
              >
                {category.name}
              </p>
              {productCount > 0 && (
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--color-neutral-500)" }}
                >
                  {productCount} produit{productCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
