"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { buildImageKitUrl } from "@/lib/utils";
import type { ProductImage } from "@/generated/prisma";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className="aspect-square rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200"
        style={{ backgroundColor: "var(--color-neutral-50)" }}
      >
        <Package
          className="w-16 h-16 mb-3 opacity-20"
          style={{ color: "var(--color-neutral-400)" }}
          aria-hidden="true"
        />
        <p className="text-sm text-slate-400">Pas d&apos;image disponible</p>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const optimizedUrl = buildImageKitUrl(currentImage.url, {
    width: 800,
    height: 800,
    quality: 85,
    format: "webp",
  });

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(images.length - 1, index)));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
        <Image
          src={optimizedUrl}
          alt={currentImage.altText ?? `${productName} — image ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />

        {/* Navigation arrows (shown if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" aria-hidden="true" />
            </button>
            <button
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Sélecteur d'images"
        >
          {images.map((img, i) => {
            const thumbUrl = buildImageKitUrl(img.url, {
              width: 100,
              height: 100,
              quality: 70,
            });
            return (
              <button
                key={img.id}
                role="tab"
                aria-selected={i === currentIndex}
                onClick={() => setCurrentIndex(i)}
                className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === currentIndex
                    ? "border-green-500 shadow-md"
                    : "border-transparent hover:border-slate-300"
                }`}
                aria-label={`Voir image ${i + 1}`}
              >
                <Image
                  src={thumbUrl}
                  alt={img.altText ?? `Miniature ${i + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
