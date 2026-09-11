"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertMerchantProfile } from "@/app/actions/profile";
import { Save, Loader2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import type { MerchantProfile } from "@/generated/prisma";

interface MerchantProfileFormProps {
  profile: MerchantProfile | null;
}

export default function MerchantProfileForm({ profile }: MerchantProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await upsertMerchantProfile(formData);

      if (result.success) {
        setSuccess(true);
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
    <form onSubmit={handleSubmit} noValidate className="max-w-lg">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-800 text-sm">Informations de contact</h2>

        {/* WhatsApp Number */}
        <div>
          <label htmlFor="whatsappNumber" className="form-label">
            Numéro WhatsApp <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <FaWhatsapp
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500"
              aria-hidden="true"
            />
            <input
              id="whatsappNumber"
              name="whatsappNumber"
              type="tel"
              className="form-input pl-10"
              defaultValue={profile?.whatsappNumber ?? ""}
              placeholder="+243 xxx xxx xxx"
              required
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Les clients vous contacteront via ce numéro WhatsApp.
          </p>
          {fieldErrors.whatsappNumber && (
            <p className="form-error">{fieldErrors.whatsappNumber[0]}</p>
          )}
        </div>

        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="form-label">
            Nom d&apos;affichage
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            className="form-input"
            defaultValue={profile?.displayName ?? ""}
            placeholder="Aaron Muamba"
            maxLength={100}
          />
          {fieldErrors.displayName && (
            <p className="form-error">{fieldErrors.displayName[0]}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="form-label">
            Biographie
          </label>
          <textarea
            id="bio"
            name="bio"
            className="form-input resize-none"
            rows={4}
            defaultValue={profile?.bio ?? ""}
            placeholder="Décrivez-vous en quelques mots..."
            maxLength={1000}
          />
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
            ✓ Profil mis à jour avec succès !
          </div>
        )}

        {/* Error */}
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
              <span>{profile ? "Mettre à jour" : "Créer mon profil"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
