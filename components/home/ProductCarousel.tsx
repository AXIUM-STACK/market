"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import type { ProductCard as ProductCardType } from "@/types";

interface ProductCarouselProps {
  products: ProductCardType[];
  favoriteIds?: Set<string>;
  currentUserId?: string | null;
}

export default function ProductCarousel({
  products,
  favoriteIds = new Set(),
  currentUserId = null,
}: ProductCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Check scroll position to enable/disable arrow states
  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16
      : 1;
    const index = Math.round(scrollLeft / cardWidth);
    setCurrentIndex(Math.min(index, products.length - 1));
  }, [products.length]);

  // Scroll by step
  const scroll = useCallback(
    (direction: "left" | "right") => {
      const el = containerRef.current;
      if (!el) return;

      const card = el.firstElementChild as HTMLElement | null;
      const step = card ? (card.offsetWidth + 16) * 2 : el.clientWidth * 0.75;

      if (direction === "left") {
        el.scrollBy({ left: -step, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    },
    []
  );

  // Listen to scroll events to update arrow buttons
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="relative group/carousel">
      {/* Navigation Arrows (Desktop & Tablet) */}
      <button
        type="button"
        aria-label="Voir les produits précédents"
        onClick={() => scroll("left")}
        disabled={!canScrollLeft}
        className={`hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-green-700 hover:border-green-600 transition-all ${
          !canScrollLeft ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label="Voir les produits suivants"
        onClick={() => scroll("right")}
        disabled={!canScrollRight}
        className={`hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-green-700 hover:border-green-600 transition-all ${
          !canScrollRight ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Horizontal Carousel Track */}
      <div
        ref={containerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 pt-1 px-1 -mx-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            className="w-[calc(50%-6px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] shrink-0 snap-start"
          >
            <ProductCard
              product={product}
              currentUserId={currentUserId}
              isFavorited={favoriteIds.has(product.id)}
              priority={i < 4}
            />
          </div>
        ))}
      </div>

      {/* Progress Dots Indicator (Subtle status without jumping) */}
      {products.length > 4 && (
        <div className="flex justify-center items-center gap-1.5 mt-4" aria-hidden="true">
          {Array.from({ length: Math.min(6, Math.ceil(products.length / 2)) }).map((_, dotIdx) => {
            const isActive = Math.floor(currentIndex / 2) === dotIdx;
            return (
              <span
                key={dotIdx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  isActive
                    ? "w-5 bg-green-700"
                    : "w-1.5 bg-slate-200"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
