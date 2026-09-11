"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { ProductSortOption } from "@/types";

interface FilterPanelProps {
  categories: { id: string; name: string; slug: string }[];
  currentSort: ProductSortOption;
  currentCategory?: string;
  currentInStock?: boolean;
}

export default function ProductFiltersPanel({
  categories,
  currentSort,
  currentCategory,
  currentInStock,
}: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Reset to page 1 on filter change
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 font-semibold text-slate-700">
        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
        <span>Filtres</span>
      </div>

      {/* Sort */}
      <div>
        <label
          htmlFor="sort-select"
          className="form-label"
        >
          Trier par
        </label>
        <select
          id="sort-select"
          className="form-input text-sm"
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          <option value="newest">Plus récents</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="popular">Popularité</option>
        </select>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label htmlFor="category-select" className="form-label">
            Catégorie
          </label>
          <select
            id="category-select"
            className="form-input text-sm"
            value={currentCategory ?? ""}
            onChange={(e) => updateParam("category", e.target.value || null)}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            style={{ accentColor: "var(--color-brand-green)" }}
            checked={currentInStock ?? false}
            onChange={(e) => updateParam("inStock", e.target.checked ? "true" : null)}
          />
          <span className="text-sm font-medium text-slate-700 group-hover:text-green-700 transition-colors">
            En stock uniquement
          </span>
        </label>
      </div>

      {/* Reset */}
      <button
        onClick={() => router.push(pathname)}
        className="text-sm text-slate-500 hover:text-red-500 transition-colors underline underline-offset-2"
        type="button"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}
