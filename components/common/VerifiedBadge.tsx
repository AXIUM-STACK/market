import { ShieldCheck } from "lucide-react";

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
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border transition-colors ${
        isSm
          ? "text-[11px] px-2 py-0.5"
          : "text-xs px-2.5 py-1"
      } bg-amber-50/90 text-amber-900 border-amber-300/80 shadow-[0_1px_2px_rgba(217,119,6,0.08)] ${className}`}
      title="Marchand certifié AXIUMarket : numéro WhatsApp et activité commerciale contrôlés"
      role="status"
      aria-label="Marchand certifié"
    >
      <ShieldCheck
        className={`${isSm ? "w-3 h-3 text-amber-600" : "w-3.5 h-3.5 text-amber-600"} shrink-0`}
        aria-hidden="true"
      />
      {showLabel && <span className="tracking-tight">Certifié</span>}
    </span>
  );
}
