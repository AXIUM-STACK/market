"use client";

import {
  Image as IKImage,
  Video as IKVideo,
  upload,
} from "@imagekit/next";
import { useRef, useState } from "react";
import { FilePlus, Loader2, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface UploadedFile {
  filePath: string;
  url: string;
  name: string;
  fileId: string;
}

interface Props {
  type?: "image" | "video";
  onFileChange?: (file: UploadedFile | null) => void;
  onUrlChange?: (url: string) => void;
  placeholder?: string;
  folder?: string;
  variant?: "sunset" | "light" | "default";
  accept?: string;
  defaultValue?: string | null;
  className?: string;
}

const authenticator = async () => {
  // Support both /api/auth/imagekit and /api/imagekit-auth
  const response = await fetch("/api/auth/imagekit").catch(() => fetch("/api/imagekit-auth"));

  if (!response.ok) {
    throw new Error("Impossible d'obtenir les paramètres d'authentification ImageKit.");
  }

  return response.json();
};

export default function FileUpload({
  type = "image",
  onFileChange,
  onUrlChange,
  placeholder = "Ajouter une image",
  folder = "/products",
  accept,
  defaultValue = null,
  className = "",
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<UploadedFile | null>(
    defaultValue
      ? {
          filePath: defaultValue,
          url: defaultValue,
          name: "Image existante",
          fileId: "existing",
        }
      : null
  );
  const [preview, setPreview] = useState<string | null>(defaultValue);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const defaultAccept = type === "image" ? "image/*" : "video/*";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // 1. Validation du type
    if (type === "image" && !selectedFile.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image valide.");
      return;
    }

    if (type === "video" && !selectedFile.type.startsWith("video/")) {
      toast.error("Le fichier doit être une vidéo valide.");
      return;
    }

    // 2. Limites de taille
    if (type === "image" && selectedFile.size > 8 * 1024 * 1024) {
      toast.error("L'image est trop lourde (maximum 8 Mo).");
      return;
    }

    if (type === "video" && selectedFile.size > 20 * 1024 * 1024) {
      toast.error("La vidéo est trop lourde (maximum 20 Mo).");
      return;
    }

    // Preview locale immédiate
    const localPreview = URL.createObjectURL(selectedFile);
    setPreview(localPreview);

    try {
      setUploading(true);
      setProgress(0);

      // Authentification côté serveur
      const authParams = await authenticator();

      // Upload direct vers ImageKit via le SDK @imagekit/next
      const response = await upload({
        file: selectedFile,
        fileName: selectedFile.name,
        publicKey: authParams.publicKey || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
        token: authParams.token,
        signature: authParams.signature,
        expire: authParams.expire,
        folder,
        useUniqueFileName: true,
        onProgress: (event) => {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        },
      });

      const endpoint =
        process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
        "https://ik.imagekit.io/rartheophile";

      // IMPORTANT : Toujours garantir que l'URL est une URL complète et PAS un chemin local du projet
      const rawFilePath = response.filePath || "";
      const finalUrl = response.url && response.url.startsWith("http")
        ? response.url
        : `${endpoint.replace(/\/$/, "")}/${rawFilePath.replace(/^\//, "")}`;

      const uploadedFile: UploadedFile = {
        filePath: rawFilePath,
        url: finalUrl,
        name: response.name || selectedFile.name,
        fileId: response.fileId || "",
      };

      setFile(uploadedFile);
      setPreview(finalUrl);

      // Transmet l'URL complète à stocker en base de données
      onFileChange?.(uploadedFile);
      onUrlChange?.(finalUrl);

      toast.success("Fichier téléversé sur ImageKit avec succès !");
    } catch (error: unknown) {
      console.error("[ImageKit Upload Error]:", error);

      // Fallback via /api/upload si l'upload direct rencontre un problème de configuration
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("folder", folder);

        const fallbackRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          const endpoint =
            process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
            "https://ik.imagekit.io/rartheophile";

          const finalUrl = data.url && data.url.startsWith("http")
            ? data.url
            : `${endpoint.replace(/\/$/, "")}/${data.filePath.replace(/^\//, "")}`;

          const uploadedFile: UploadedFile = {
            filePath: data.filePath,
            url: finalUrl,
            name: data.fileName,
            fileId: data.fileId,
          };

          setFile(uploadedFile);
          setPreview(finalUrl);

          onFileChange?.(uploadedFile);
          onUrlChange?.(finalUrl);

          toast.success("Fichier téléversé avec succès !");
          return;
        }
      } catch {
        // Fallback also failed
      }

      toast.error("Erreur lors de l'envoi du fichier sur ImageKit.");
      setPreview(defaultValue || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreview(null);
    setProgress(0);
    onFileChange?.(null);
    onUrlChange?.("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept || defaultAccept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Button to Trigger File Selection */}
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="btn w-full rounded-xl btn-secondary border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/40 text-slate-700 hover:text-emerald-800 transition-all flex items-center justify-center gap-2 py-3.5 px-4 cursor-pointer"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">
              Téléversement en cours ({progress}%)...
            </span>
          </>
        ) : (
          <>
            <FilePlus className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium">{placeholder}</span>
          </>
        )}
      </button>

      {/* Progress Bar */}
      {uploading && progress > 0 && progress < 100 && (
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Preview Card */}
      {preview && (
        <div className="relative p-2.5 bg-white border border-slate-200 rounded-2xl shadow-2xs flex items-center gap-3">
          {type === "image" ? (
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative border border-slate-100">
              <img
                src={preview}
                alt="Aperçu"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <video
              src={preview}
              controls
              className="w-48 h-28 object-cover rounded-xl border border-slate-100"
            />
          )}

          <div className="flex-1 min-w-0 pr-8">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {file?.name || "Image sélectionnée"}
            </p>
            <p className="text-[11px] text-emerald-600 font-mono truncate mt-0.5" title={file?.url || preview}>
              {file?.url || preview}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium mt-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              URL ImageKit prête pour la base de données
            </span>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Supprimer cette image"
            aria-label="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
