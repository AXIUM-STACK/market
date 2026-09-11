"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  productId: string;
  isFavorited: boolean;
  size?: "sm" | "md";
}

export default function FavoriteButton({
  productId,
  isFavorited,
  size = "sm",
}: FavoriteButtonProps) {
  const [optimisticFavorited, setOptimisticFavorited] = useState(isFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const btnSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";

  const handleToggle = () => {
    startTransition(async () => {
      // Optimistic update
      setOptimisticFavorited((v) => !v);

      const result = await toggleFavorite(productId);

      if (!result.success) {
        // Revert on failure
        setOptimisticFavorited((v) => !v);

        if (result.error === "UNAUTHORIZED") {
          router.push("/sign-in");
        }
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`favorite-btn ${btnSize} ${optimisticFavorited ? "favorited" : ""}`}
      aria-label={optimisticFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      aria-pressed={optimisticFavorited}
      title={optimisticFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={iconSize}
        style={{
          fill: optimisticFavorited ? "#ef4444" : "none",
          color: optimisticFavorited ? "#ef4444" : "#64748b",
        }}
        aria-hidden="true"
      />
    </button>
  );
}
