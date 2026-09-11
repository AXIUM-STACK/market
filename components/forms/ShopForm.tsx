"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createShop, updateShop } from "@/app/actions/shops";
import { slugify } from "@/lib/utils";
import { Save, Loader2, Upload, X, Store, ImageIcon, Camera } from "lucide-react";
import type { Shop } from "@/generated/prisma";

interface ShopFormProps {
  shop?: Shop;
  mode: "create" | "edit";
}

export default function ShopForm({ shop, mode }: ShopFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [nameValue, setNameValue] = useState(shop?.name ?? "");
  const [slugValue, setSlugValue] = useState(shop?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(mode === "create");

  // Photos state
  const [logoUrl, setLogoUrl] = useState<string>(shop?.logoUrl ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState<string>(shop?.coverImageUrl ?? "");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value);
    if (autoSlug) {
      setSlugValue(slugify(e.target.value));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugValue(slugify(e.target.value));
    setAutoSlug(false);
  };

  const uploadImageFile = async (file: File): Promise<string> => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Le fichier doit être une image (PNG, JPG, WEBP).");
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("L'image ne peut pas dépasser 5 Mo.");
    }
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erreur lors du téléversement.");
    }
    const data = await res.json();
    return data.url;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setUploadingLogo(true);
    try {
      const url = await uploadImageFile(file);
      setLogoUrl(url);
    } catch (err: unknown) {
      setPhotoError(err instanceof Error ? err.message : "Erreur upload logo.");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setUploadingCover(true);
    try {
      const url = await uploadImageFile(file);
      setCoverImageUrl(url);
    } catch (err: unknown) {
      setPhotoError(err instanceof Error ? err.message : "Erreur upload couverture.");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("slug", slugValue);
    formData.set("logoUrl", logoUrl);
    formData.set("coverImageUrl", coverImageUrl);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createShop(formData)
          : await updateShop(shop!.id, formData);

      if (result.success) {
        router.push("/dashboard/shops");
        router.refresh();
      } else {
        setError(result.error);
        if ("fieldErrors" in result && result.fieldErrors) {
          setFieldErrors(result.fieldErrors as Record<string, string[]>);
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        {photoError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
            {photoError}
          </div>
        )}

        {/* Cover Photo */}
        <div>
          <label className="form-label mb-2">Photo de couverture de la boutique</label>
          <div
            className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center group"
          >
            {coverImageUrl ? (
              <>
                <Image
                  src={coverImageUrl}
                  alt="Couverture boutique"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                <button
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-sm"
                  aria-label="Supprimer la photo de couverture"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div
                onClick={() => coverInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-4 cursor-pointer text-slate-400 hover:text-green-600 transition-colors"
              >
                {uploadingCover ? (
                  <Loader2 className="w-7 h-7 animate-spin text-green-600 mb-1" />
                ) : (
                  <ImageIcon className="w-7 h-7 mb-1" />
                )}
                <span className="text-xs font-medium">
                  {uploadingCover ? "Téléchargement..." : "Ajouter une bannière de couverture"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Recommandé : 1200 x 400 px (max 5 Mo)</span>
              </div>
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleCoverUpload}
          />
        </div>

        {/* Logo / Profile Photo */}
        <div>
          <label className="form-label mb-2">Logo ou photo de profil</label>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
              {logoUrl ? (
                <>
                  <Image
                    src={logoUrl}
                    alt="Logo boutique"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  <button
                    type="button"
                    onClick={() => setLogoUrl("")}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-sm"
                    aria-label="Supprimer le logo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <div className="text-slate-300">
                  {uploadingLogo ? (
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                  ) : (
                    <Store className="w-8 h-8" />
                  )}
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="btn btn-secondary btn-sm rounded-xl flex items-center gap-1.5 text-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{logoUrl ? "Changer le logo" : "Choisir un logo"}</span>
              </button>
              <p className="text-[11px] text-slate-400 mt-1">Format carré conseillé (ex: 400 x 400 px)</p>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="shop-name" className="form-label">
              Nom de la boutique <span className="text-red-500">*</span>
            </label>
            <input
              id="shop-name"
              name="name"
              type="text"
              className="form-input"
              value={nameValue}
              onChange={handleNameChange}
              placeholder="Ex: Kinshasa Tech Store"
              required
              maxLength={100}
            />
            {fieldErrors.name && (
              <p className="form-error">{fieldErrors.name[0]}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="shop-slug" className="form-label">
              URL de la boutique <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="text-xs text-slate-400 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg px-3 h-10 flex items-center whitespace-nowrap">
                axiumarket.com/shops/
              </span>
              <input
                id="shop-slug"
                name="slug"
                type="text"
                className="form-input rounded-l-none flex-1"
                value={slugValue}
                onChange={handleSlugChange}
                placeholder="kinshasa-tech-store"
                required
                maxLength={100}
                pattern="[a-z0-9-]+"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Uniquement lettres minuscules, chiffres et tirets.
            </p>
            {fieldErrors.slug && (
              <p className="form-error">{fieldErrors.slug[0]}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="shop-description" className="form-label">
              Description de la boutique
            </label>
            <textarea
              id="shop-description"
              name="description"
              className="form-input resize-none"
              rows={4}
              defaultValue={shop?.description ?? ""}
              placeholder="Décrivez vos produits, vos horaires et votre localisation..."
              maxLength={2000}
            />
          </div>

          {/* Status (edit only) */}
          {mode === "edit" && (
            <div>
              <label htmlFor="shop-status" className="form-label">
                Statut
              </label>
              <select
                id="shop-status"
                name="status"
                className="form-input"
                defaultValue={shop?.status ?? "ACTIVE"}
              >
                <option value="ACTIVE">Active (visible sur la marketplace)</option>
                <option value="PAUSED">Pausée (temporairement masquée)</option>
              </select>
            </div>
          )}
        </div>

        {/* Form Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-brand w-full rounded-xl flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>{mode === "create" ? "Créer la boutique" : "Enregistrer les modifications"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
