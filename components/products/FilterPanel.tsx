"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
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

  const hasActiveFilters = Boolean(currentCategory || currentInStock || currentSort !== "newest");

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-green-700" aria-hidden="true" />
          <span>Filtres de recherche</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => router.push(pathname)}
            className="text-xs text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 font-medium"
            type="button"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Effacer</span>
          </button>
        )}
      </div>

      {/* Sort Option */}
      <div>
        <label
          htmlFor="sort-select"
          className="form-label"
        >
          Trier les résultats
        </label>
        <select
          id="sort-select"
          className="form-input text-sm cursor-pointer"
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          <option value="newest">Plus récents d&apos;abord</option>
          <option value="price_asc">Prix croissant (CDF)</option>
          <option value="price_desc">Prix décroissant (CDF)</option>
          <option value="popular">Articles populaires</option>
        </select>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <label htmlFor="category-select" className="form-label">
            Rayon / Catégorie
          </label>
          <select
            id="category-select"
            className="form-input text-sm cursor-pointer"
            value={currentCategory ?? ""}
            onChange={(e) => updateParam("category", e.target.value || null)}
          >
            <option value="">Tous les rayons</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* In Stock Toggle */}
      <div className="pt-1">
        <label className="flex items-center gap-2.5 cursor-pointer group select-none">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-green-700 focus:ring-green-600 focus:ring-offset-0 cursor-pointer"
            checked={currentInStock ?? false}
            onChange={(e) => updateParam("inStock", e.target.checked ? "true" : null)}
          />
          <span className="text-sm font-medium text-slate-700 group-hover:text-green-800 transition-colors">
            En stock uniquement
          </span>
        </label>
      </div>
    </div>
  );
}
