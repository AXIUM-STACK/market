"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { deleteProductImage, addProductImages } from "@/app/actions/products";
import type { ImageKitUploadResult } from "@/types";

interface ExistingImage {
  id: string;
  url: string;
  fileName?: string | null;
  sortOrder: number;
}

interface ImageUploaderProps {
  productId?: string;
  initialImages?: ExistingImage[];
  onImagesChange?: (images: ImageKitUploadResult[]) => void;
  maxFiles?: number;
}

export default function ImageUploader({
  productId,
  initialImages = [],
  onImagesChange,
  maxFiles = 5,
}: ImageUploaderProps) {
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(initialImages);
  const [newImages, setNewImages] = useState<ImageKitUploadResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCount = existingImages.length + newImages.length;

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);

    if (totalCount + fileArray.length > maxFiles) {
      setError(`Vous ne pouvez pas ajouter plus de ${maxFiles} images au total.`);
      return;
    }

    // Validate size and mime type
    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        setError(`Le fichier "${file.name}" n'est pas une image valide.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`L'image "${file.name}" dépasse la limite de 5 Mo.`);
        return;
      }
    }

    setIsUploading(true);

    try {
      const uploadedList: ImageKitUploadResult[] = [];

      // Upload each file via server /api/upload (supports ImageKit + local storage)
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({ error: "Erreur réseau" }));
          throw new Error(errData.error || `Échec de l'envoi de ${file.name}`);
        }

        const data = await uploadRes.json();

        uploadedList.push({
          imagekitFileId: data.fileId,
          url: data.url,
          filePath: data.filePath,
          fileName: data.fileName,
          width: data.width,
          height: data.height,
        });
      }

      // If in edit mode with existing product, persist directly to DB
      if (productId) {
        const payload = uploadedList.map((img, idx) => ({
          ...img,
          sortOrder: existingImages.length + idx,
        }));
        const res = await addProductImages(productId, payload);
        if (!res.success) {
          throw new Error(res.error || "Erreur lors de l'enregistrement des images en base.");
        }
        // Update existing state
        setExistingImages((prev) => [
          ...prev,
          ...payload.map((p, idx) => ({
            id: `temp-${Date.now()}-${idx}`,
            url: p.url,
            fileName: p.fileName,
            sortOrder: p.sortOrder,
          })),
        ]);
      } else {
        const updatedNew = [...newImages, ...uploadedList];
        setNewImages(updatedNew);
        onImagesChange?.(updatedNew);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue lors de l'upload.";
      setError(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteExisting = async (imageId: string) => {
    try {
      const res = await deleteProductImage(imageId);
      if (!res.success) {
        setError(res.error || "Échec de suppression");
        return;
      }
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      setError("Impossible de supprimer cette image.");
    }
  };

  const handleDeleteNew = (index: number) => {
    const updated = newImages.filter((_, idx) => idx !== index);
    setNewImages(updated);
    onImagesChange?.(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="form-label mb-0">Photos du produit</label>
        <span className="text-xs text-slate-500">
          {totalCount} / {maxFiles} images
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of existing + newly added images */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {existingImages.map((img) => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
            >
              <Image
                src={img.url}
                alt={img.fileName || "Photo produit"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              {productId && (
                <button
                  type="button"
                  onClick={() => handleDeleteExisting(img.id)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-700"
                  aria-label="Supprimer la photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {newImages.map((img, idx) => (
            <div
              key={img.imagekitFileId || idx}
              className="relative group aspect-square rounded-xl overflow-hidden border border-green-200 bg-green-50/50"
            >
              <Image
                src={img.url}
                alt={img.fileName || "Nouvelle photo"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <button
                type="button"
                onClick={() => handleDeleteNew(idx)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-700"
                aria-label="Retirer cette photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-green-700 text-white text-[10px] rounded font-medium">
                Nouveau
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Drop Zone */}
      {totalCount < maxFiles && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) {
              handleFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-green-600 bg-green-50/50"
              : "border-slate-200 hover:border-green-500 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(e.target.files);
              }
            }}
          />

          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
              <p className="text-xs font-medium">Téléchargement vers ImageKit en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 text-slate-500">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                Glissez vos photos ici ou <span className="text-green-600 underline">parcourez</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP jusqu&apos;à 5 Mo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
