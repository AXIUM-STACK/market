"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Share2,
  Copy,
  Check,
  X,
  Mail,
  Loader2,
  FileText,
  ImageIcon,
} from "lucide-react";
import { FaWhatsapp, FaFacebook, FaXTwitter } from "react-icons/fa6";
import { slugify } from "@/lib/utils";

export interface ShareDetails {
  type: "product" | "shop";
  name: string;
  price?: string;
  currency?: string;
  shopName?: string;
  merchantName?: string;
  categoryName?: string;
  inStock?: boolean;
  totalProducts?: number;
  description?: string | null;
  imageUrl?: string | null;
  url?: string;
}

export interface ShareButtonProps {
  // Can accept rich details or simple props for backward compatibility
  details?: ShareDetails;
  title?: string;
  url?: string;
  description?: string | null;
  imageUrl?: string | null;
  label?: string;
  variant?: "outline" | "solid" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: "text-xs py-1.5 px-3 gap-1.5",
  md: "text-sm py-2.5 px-4 gap-2",
  lg: "text-base py-3 px-5 gap-2",
};

const iconSizes = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-4.5 h-4.5",
};

/**
 * Builds a clean, beautifully formatted text message for WhatsApp and social sharing
 */
function buildStructuredMessage(details: ShareDetails, fullUrl: string): string {
  const lines: string[] = [];

  if (details.type === "product") {
    lines.push(`🛍️ *${details.name}*`);
    lines.push("━━━━━━━━━━━━━━━━━━");

    if (details.price) {
      lines.push(`💰 *Prix :* ${details.price}`);
    }
    if (details.shopName) {
      lines.push(`🏪 *Boutique :* ${details.shopName}`);
    }
    if (details.categoryName) {
      lines.push(`📂 *Catégorie :* ${details.categoryName}`);
    }
    if (details.inStock !== undefined) {
      lines.push(`📦 *Disponibilité :* ${details.inStock ? "✅ En stock" : "⚠️ Rupture de stock"}`);
    }

    if (details.description?.trim()) {
      lines.push("");
      lines.push(`📝 *Description :*`);
      lines.push(
        details.description.trim().slice(0, 220) +
          (details.description.trim().length > 220 ? "…" : "")
      );
    }

    if (details.imageUrl) {
      lines.push("");
      lines.push(`📸 *Photo du produit :*`);
      lines.push(details.imageUrl);
    }

    lines.push("");
    lines.push(`🔗 *Voir les détails et commander sur AXIUMarket :*`);
    lines.push(fullUrl);
  } else {
    lines.push(`🏪 *Boutique : ${details.name}*`);
    lines.push("━━━━━━━━━━━━━━━━━━");

    if (details.merchantName) {
      lines.push(`👤 *Géré par :* ${details.merchantName}`);
    }
    if (details.totalProducts !== undefined) {
      lines.push(`📦 *Catalogue :* ${details.totalProducts} produit${details.totalProducts > 1 ? "s" : ""} en ligne`);
    }

    if (details.description?.trim()) {
      lines.push("");
      lines.push(`📝 *À propos :*`);
      lines.push(
        details.description.trim().slice(0, 220) +
          (details.description.trim().length > 220 ? "…" : "")
      );
    }

    if (details.imageUrl) {
      lines.push("");
      lines.push(`📸 *Photo de la boutique :*`);
      lines.push(details.imageUrl);
    }

    lines.push("");
    lines.push(`🔗 *Découvrir la boutique sur AXIUMarket :*`);
    lines.push(fullUrl);
  }

  return lines.join("\n");
}

export default function ShareButton({
  details: propDetails,
  title: propTitle,
  url: propUrl,
  description: propDescription,
  imageUrl: propImageUrl,
  label = "Partager",
  variant = "outline",
  size = "md",
  className = "",
  fullWidth = false,
}: ShareButtonProps) {
  // Normalize details from either the details object or individual props
  const details: ShareDetails = propDetails || {
    type: "product",
    name: propTitle || "AXIUMarket",
    description: propDescription,
    imageUrl: propImageUrl,
    url: propUrl,
  };

  const [showModal, setShowModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Resolves the absolute URL safely on the client
  const getResolvedUrl = useCallback((): string => {
    const targetUrl = details.url || propUrl;
    if (typeof window === "undefined") return targetUrl || "";
    if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
      return targetUrl;
    }
    const origin = window.location.origin;
    if (targetUrl) {
      return `${origin}${targetUrl.startsWith("/") ? "" : "/"}${targetUrl}`;
    }
    return window.location.href;
  }, [details.url, propUrl]);

  const handleShare = async () => {
    const fullUrl = getResolvedUrl();
    const structuredText = buildStructuredMessage(details, fullUrl);

    // Pre-copy the structured text to the clipboard so that if WhatsApp Web/Desktop
    // attaches the image but leaves "Add a message..." empty, the user can immediately
    // paste (Ctrl+V) the full details directly into the caption box!
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(structuredText);
      }
    } catch {
      // Ignore clipboard error
    }

    // 1. Try Web Share API (Primary choice for mobile & supported devices)
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      setIsLoadingFile(true);
      let fileToShare: File | null = null;

      // Try fetching the image as a File so WhatsApp/system share attaches the actual photo
      if (details.imageUrl) {
        try {
          const res = await fetch(details.imageUrl, { mode: "cors" });
          if (res.ok) {
            const blob = await res.blob();
            const mime = blob.type || "image/jpeg";
            const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
            fileToShare = new File(
              [blob],
              `${slugify(details.name || "partage")}.${ext}`,
              { type: mime }
            );
          }
        } catch {
          // If image download fails (CORS or network), proceed without file
          fileToShare = null;
        }
      }
      setIsLoadingFile(false);

      const sharePayload: ShareData = {
        title: details.name,
        text: structuredText,
      };

      // If file can be shared natively (Level 2 Web Share)
      if (
        fileToShare &&
        navigator.canShare &&
        navigator.canShare({ files: [fileToShare] })
      ) {
        sharePayload.files = [fileToShare];
      } else {
        sharePayload.url = fullUrl;
      }

      try {
        await navigator.share(sharePayload);
        setFeedback("Photo attachée !");
        setTimeout(() => setFeedback(null), 3000);
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        // If sharing with file failed, try simple share with text and url
        try {
          await navigator.share({
            title: details.name,
            text: structuredText,
            url: fullUrl,
          });
          setFeedback("Partagé !");
          setTimeout(() => setFeedback(null), 2500);
          return;
        } catch {
          // If native share completely fails, open fallback modal
          setShowModal(true);
          return;
        }
      }
    }

    // 2. Fallback for Desktop & Unsupported Browsers
    setShowModal(true);
  };

  const copyToClipboard = async (text: string, isLinkOnly: boolean) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      if (isLinkOnly) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2500);
      }
    } catch {
      alert("Impossible de copier automatiquement.");
    }
  };

  const resolvedUrl = getResolvedUrl();
  const structuredText = buildStructuredMessage(details, resolvedUrl);

  // Social share URLs
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(structuredText)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resolvedUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(details.name)}&url=${encodeURIComponent(resolvedUrl)}`;
  const mailShareUrl = `mailto:?subject=${encodeURIComponent(details.name)}&body=${encodeURIComponent(structuredText)}`;

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        disabled={isLoadingFile}
        className={`inline-flex items-center justify-center font-medium rounded-xl transition-colors cursor-pointer select-none ${
          variant === "solid"
            ? "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
            : variant === "icon"
            ? "p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/80 shadow-2xs"
        } ${variant !== "icon" ? sizeClasses[size] : ""} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        aria-label={`${label} "${details.name}"`}
        title={label}
      >
        {isLoadingFile ? (
          <>
            <Loader2 className={`${iconSizes[size]} animate-spin text-emerald-600`} />
            {variant !== "icon" && <span>Préparation...</span>}
          </>
        ) : feedback ? (
          <>
            <Check className={`${iconSizes[size]} text-emerald-600 animate-in zoom-in`} />
            {variant !== "icon" && (
              <span className="text-emerald-700 font-semibold">{feedback}</span>
            )}
          </>
        ) : (
          <>
            <Share2 className={iconSizes[size]} aria-hidden="true" />
            {variant !== "icon" && <span>{label}</span>}
          </>
        )}
      </button>

      {/* Clean Fallback Modal for Desktop / Unsupported Browsers */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Fermer la fenêtre de partage"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 pr-6">
                <h3
                  id="share-modal-title"
                  className="text-base font-bold text-slate-900 truncate"
                >
                  Partager {details.type === "product" ? "ce produit" : "cette boutique"}
                </h3>
                <p className="text-xs text-slate-500 truncate">{details.name}</p>
              </div>
            </div>

            {/* Rich Preview Card */}
            <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              {details.imageUrl ? (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-slate-200 relative shrink-0">
                  <Image
                    src={details.imageUrl}
                    alt={details.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{details.name}</p>
                {details.price && (
                  <p className="text-xs font-semibold text-emerald-700">{details.price}</p>
                )}
                {details.shopName && (
                  <p className="text-[11px] text-slate-500 truncate">Boutique : {details.shopName}</p>
                )}
                {details.merchantName && (
                  <p className="text-[11px] text-slate-500 truncate">Par {details.merchantName}</p>
                )}
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  📸 Photo et fiche complète incluses
                </span>
              </div>
            </div>

            {/* Primary Action: Direct WhatsApp Share with full structured details & photo */}
            <div className="mb-4">
              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors group"
              >
                <FaWhatsapp className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                <span>Partager sur WhatsApp avec la photo</span>
              </a>
            </div>

            {/* Copy Link & Full Message */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="text"
                  readOnly
                  value={resolvedUrl}
                  className="bg-transparent text-xs text-slate-600 px-2 flex-1 outline-hidden font-mono truncate"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(resolvedUrl, true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    copiedLink
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs"
                  }`}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Lien copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier lien</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(structuredText, false)}
                className="w-full text-xs text-slate-600 hover:text-slate-900 font-medium py-1.5 px-3 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 bg-white flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Message complet copié !</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copier le texte formaté avec la photo pour l&apos;envoyer</span>
                  </>
                )}
              </button>
            </div>

            {/* Other Social Networks */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Autres réseaux :
              </p>
              <div className="grid grid-cols-3 gap-2">
                {/* Facebook */}
                <a
                  href={facebookShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-medium transition-colors"
                >
                  <FaFacebook className="w-4 h-4 text-blue-600" />
                  <span>Facebook</span>
                </a>

                {/* X */}
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-medium transition-colors"
                >
                  <FaXTwitter className="w-4 h-4" />
                  <span>X (Twitter)</span>
                </a>

                {/* Email */}
                <a
                  href={mailShareUrl}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                >
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
