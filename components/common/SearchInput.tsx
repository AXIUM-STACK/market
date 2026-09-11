"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  initialValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchInput({
  initialValue = "",
  placeholder = "Rechercher...",
  autoFocus = false,
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim()) {
        router.push(`/search?q=${encodeURIComponent(value.trim())}`);
      }
    },
    [value, router]
  );

  const handleClear = useCallback(() => {
    setValue("");
    router.push("/search");
  }, [router]);

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center"
      role="search"
      aria-label="Rechercher des produits"
    >
      <label htmlFor="search-input" className="sr-only">
        Rechercher des produits
      </label>
      <Search
        className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none"
        aria-hidden="true"
      />
      <input
        id="search-input"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="search-input w-full py-3.5 pl-12 pr-24 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-24 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Effacer la recherche"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
      <button
        type="submit"
        className="absolute right-1.5 btn btn-brand btn-sm rounded-full px-4 text-sm"
      >
        Chercher
      </button>
    </form>
  );
}
