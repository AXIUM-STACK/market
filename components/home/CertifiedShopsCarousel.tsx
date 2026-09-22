"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ShopCard from "@/components/shops/ShopCard";
import type { ShopCard as ShopCardType } from "@/types";

interface CertifiedShopsCarouselProps {
  shops: ShopCardType[];
}

export default function CertifiedShopsCarousel({ shops }: CertifiedShopsCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;

    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : 300;

    if (direction === "left") {
      el.scrollBy({ left: -step, behavior: "smooth" });
    } else {
      el.scrollBy({ left: step, behavior: "smooth" });
    }
  }, []);

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

  if (!shops || shops.length === 0) {
    return null;
  }

  return (
    <div className="relative group/shops">
      {/* Navigation Buttons for Desktop */}
      <div className="hidden sm:flex items-center gap-2 absolute right-0 -top-14">
        <button
          type="button"
          aria-label="Boutiques précédentes"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`w-9 h-9 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-green-600 transition-all ${
            !canScrollLeft ? "opacity-40 cursor-not-allowed" : "opacity-100 cursor-pointer"
          }`}
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Boutiques suivantes"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`w-9 h-9 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-green-600 transition-all ${
            !canScrollRight ? "opacity-40 cursor-not-allowed" : "opacity-100 cursor-pointer"
          }`}
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Horizontal Scrollable Track */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-1 -mx-1"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="w-[280px] sm:w-[320px] shrink-0 snap-start"
          >
            <ShopCard shop={shop} />
          </div>
        ))}
      </div>
    </div>
  );
}
