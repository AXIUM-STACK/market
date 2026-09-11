"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, addProductImages } from "@/app/actions/products";
import ImageUploader from "@/components/forms/ImageUploader";
import type { ImageKitUploadResult } from "@/types";
import { slugify } from "@/lib/utils";
import { Save, Loader2 } from "lucide-react";
import type { Product, ProductImage } from "@/generated/prisma";

type SerializedProduct = Omit<Product, "price"> & {
  price: string | number | Product["price"];
};

interface ProductFormProps {
  product?: SerializedProduct & { images: ProductImage[] };
  shops: { id: string; name: string }[];
  categories: { id: string; name: string; slug: string; parentId: string | null }[];
  mode: "create" | "edit";
}

const currencies = [
  { code: "CDF", label: "Franc Congolais (CDF)" },
  { code: "USD", label: "Dollar américain (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "XAF", label: "Franc CFA CEMAC (XAF)" },
  { code: "XOF", label: "Franc CFA UEMOA (XOF)" },
];

export default function ProductForm({
  product,
  shops,
  categories,
  mode,
}: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pendingImages, setPendingImages] = useState<ImageKitUploadResult[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProduct(formData)
          : await updateProduct(product!.id, formData);

      if (result.success) {
        if (mode === "create" && result.data && pendingImages.length > 0) {
          await addProductImages(
            result.data.id,
            pendingImages.map((img, idx) => ({ ...img, sortOrder: idx }))
          );
        }
        router.push("/dashboard/products");
        router.refresh();
      } else {
        setError(result.error);
        if ("fieldErrors" in result && result.fieldErrors) {
          setFieldErrors(result.fieldErrors as Record<string, string[]>);
        }
      }
    });
  };

  const topCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => c.parentId);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-slate-800 text-sm">Informations du produit</h2>

            {/* Name */}
            <div>
              <label htmlFor="name" className="form-label">
                Nom du produit <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-input"
                defaultValue={product?.name}
                placeholder="Ex: Smartphone Samsung Galaxy A54"
                required
                maxLength={200}
              />
              {fieldErrors.name && (
                <p className="form-error">{fieldErrors.name[0]}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                className="form-input resize-none"
                rows={5}
                defaultValue={product?.description ?? ""}
                placeholder="Décrivez votre produit en détail..."
                maxLength={5000}
              />
              {fieldErrors.description && (
                <p className="form-error">{fieldErrors.description[0]}</p>
              )}
            </div>

            {/* Price + Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="form-label">
                  Prix <span className="text-red-500">*</span>
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  defaultValue={product?.price?.toString()}
                  placeholder="0.00"
                  required
                />
                {fieldErrors.price && (
                  <p className="form-error">{fieldErrors.price[0]}</p>
                )}
              </div>
              <div>
                <label htmlFor="currency" className="form-label">
                  Devise
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="form-input"
                  defaultValue={product?.currency ?? "CDF"}
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="stockQuantity" className="form-label">
                Quantité en stock
              </label>
              <input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                className="form-input"
                defaultValue={product?.stockQuantity ?? 0}
              />
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <ImageUploader
              productId={product?.id}
              initialImages={product?.images ?? []}
              onImagesChange={setPendingImages}
            />
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="space-y-5">
          {/* Status + Shop */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-slate-800 text-sm">Organisation</h2>

            {/* Boutique */}
            <div>
              <label htmlFor="shopId" className="form-label">
                Boutique <span className="text-red-500">*</span>
              </label>
              <select
                id="shopId"
                name="shopId"
                className="form-input"
                defaultValue={product?.shopId ?? shops[0]?.id}
                required
              >
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="form-label">
                Catégorie
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className="form-input"
                defaultValue={product?.categoryId ?? ""}
              >
                <option value="">Sans catégorie</option>
                {topCategories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name}>
                    <option value={cat.id}>{cat.name}</option>
                    {subCategories
                      .filter((s) => s.parentId === cat.id)
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          — {sub.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="form-label">
                Statut
              </label>
              <select
                id="status"
                name="status"
                className="form-input"
                defaultValue={product?.status ?? "DRAFT"}
              >
                <option value="DRAFT">Brouillon</option>
                <option value="ACTIVE">Actif (publié)</option>
                <option value="OUT_OF_STOCK">Rupture de stock</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </div>

            {/* Featured */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                value="true"
                className="checkbox checkbox-sm"
                defaultChecked={product?.isFeatured ?? false}
              />
              <span className="text-sm text-slate-700 font-medium">
                Produit à la une
              </span>
            </label>
          </div>

          {/* Submit */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

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
                <span>{mode === "create" ? "Créer le produit" : "Enregistrer"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
