import { CheckCircle } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export default function VerifiedBadge({
  size = "sm",
  showLabel = true,
  className = "",
}: VerifiedBadgeProps) {
  return (
    <span
      className={`verified-badge ${className}`}
      title="Marchand vérifié"
      role="img"
      aria-label="Marchand vérifié"
    >
      <CheckCircle
        className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"}
        aria-hidden="true"
      />
      {showLabel && <span>Vérifié</span>}
    </span>
  );
}
