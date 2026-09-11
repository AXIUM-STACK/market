"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveShop,
  rejectShop,
  suspendShop,
  blockShop,
  renewShopDuration,
  reactivateShop,
} from "@/app/actions/admin";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ban,
  Clock,
  Loader2,
  X,
  RotateCcw,
} from "lucide-react";
import type { ShopStatus } from "@/generated/prisma";
import { useAdminToast } from "@/components/admin/AdminToastContext";

interface ShopModerationActionsProps {
  shopId: string;
  shopName: string;
  currentStatus: ShopStatus;
  isExpired?: boolean;
  expiresAt?: Date | string | null;
}

type ModalMode = "approve" | "reject" | "suspend" | "block" | "renew" | "reactivate" | null;

export default function ShopModerationActions({
  shopId,
  shopName,
  currentStatus,
  isExpired,
}: ShopModerationActionsProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminToast();
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isActuallyExpired = isExpired || currentStatus === "EXPIRED";
  const isSuspended = currentStatus === "SUSPENDED";

  const closeModal = () => {
    setModalMode(null);
    setReason("");
    setError(null);
  };

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      const res = await approveShop(shopId, durationMonths);
      if (res.success) {
        showSuccess(`La boutique "${shopName}" a été validée pour ${durationMonths} mois.`);
        closeModal();
        router.refresh();
      } else {
        setError(res.error);
        showError(res.error);
      }
    });
  };

  const handleRenew = () => {
    setError(null);
    startTransition(async () => {
      const res = await renewShopDuration(shopId, durationMonths);
      if (res.success) {
        showSuccess(`Durée d'activité prolongée de ${durationMonths} mois pour "${shopName}".`);
        closeModal();
        router.refresh();
      } else {
        setError(res.error);
        showError(res.error);
      }
    });
  };

  const handleReactivate = () => {
    setError(null);
    startTransition(async () => {
      const res = await reactivateShop(shopId, durationMonths);
      if (res.success) {
        showSuccess(`La boutique "${shopName}" a été réactivée avec succès pour ${durationMonths} mois.`);
        closeModal();
        router.refresh();
      } else {
        setError(res.error);
        showError(res.error);
      }
    });
  };

  const handleReject = () => {
    if (!reason.trim()) {
      setError("Veuillez indiquer un motif de refus.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await rejectShop(shopId, reason);
      if (res.success) {
        showSuccess(`La boutique "${shopName}" a été refusée.`);
        closeModal();
        router.refresh();
      } else {
        setError(res.error);
        showError(res.error);
      }
    });
  };

  const handleSuspend = () => {
    setError(null);
    startTransition(async () => {
      const res = await suspendShop(shopId, reason);
      if (res.success) {
        showSuccess(`La boutique "${shopName}" a été suspendue.`);
        closeModal();
        router.refresh();
      } else {
        setError(res.error);
        showError(res.error);
      }
    });
  };

  const handleBlock = () => {
    if (!reason.trim()) {
      setError("Veuillez indiquer un motif de blocage.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await blockShop(shopId, reason);
      if (res.success) {
        showSuccess(`La boutique "${shopName}" a été bloquée.`);
        closeModal();
        router.refresh();
      } else {
        setError(res.error);
        showError(res.error);
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap justify-end">
        {/* 1. Valider (for pending or rejected shops) */}
        {(currentStatus === "PENDING_APPROVAL" || currentStatus === "REJECTED") && (
          <button
            type="button"
            onClick={() => setModalMode("approve")}
            className="btn btn-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1 shadow-2xs"
            title="Approuver et définir la durée d'activité"
          >
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Valider</span>
          </button>
        )}

        {/* 2. Refuser (for pending shops) */}
        {currentStatus === "PENDING_APPROVAL" && (
          <button
            type="button"
            onClick={() => setModalMode("reject")}
            className="btn btn-xs rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 font-medium flex items-center gap-1"
            title="Refuser la boutique avec un motif"
          >
            <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Refuser</span>
          </button>
        )}

        {/* 3. Réactiver (for suspended or expired shops) */}
        {(isSuspended || isActuallyExpired) && (
          <button
            type="button"
            onClick={() => setModalMode("reactivate")}
            className="btn btn-xs rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-medium flex items-center gap-1 shadow-2xs"
            title="Réactiver la boutique et accorder une durée"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Réactiver</span>
          </button>
        )}

        {/* 4. Prolonger (for active, non-expired shops) */}
        {currentStatus === "ACTIVE" && !isActuallyExpired && (
          <button
            type="button"
            onClick={() => setModalMode("renew")}
            className="btn btn-xs rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-medium flex items-center gap-1"
            title="Ajouter des mois d'activité"
          >
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Prolonger</span>
          </button>
        )}

        {/* 5. Suspendre (for active shops) */}
        {currentStatus === "ACTIVE" && !isActuallyExpired && (
          <button
            type="button"
            onClick={() => setModalMode("suspend")}
            className="btn btn-xs rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium flex items-center gap-1"
            title="Suspendre temporairement la boutique"
          >
            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Suspendre</span>
          </button>
        )}

        {/* 6. Bloquer (for non-blocked shops) */}
        {currentStatus !== "BLOCKED" && (
          <button
            type="button"
            onClick={() => setModalMode("block")}
            className="btn btn-xs rounded-lg bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-700 border border-slate-200 font-medium flex items-center gap-1"
            title="Bloquer définitivement la boutique"
          >
            <Ban className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Bloquer</span>
          </button>
        )}
      </div>

      {/* Modal Dialog */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative">
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Validation / Approval */}
            {modalMode === "approve" && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Valider la boutique
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Définissez la durée d&apos;activité accordée à <strong>{shopName}</strong> (de 1 à 12 mois). La boutique deviendra active immédiatement.
                </p>

                <div className="space-y-3 mb-5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Choisir une durée (1 à 12 mois) :
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDurationMonths(m)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                          durationMonths === m
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {m} mois
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">Ou durée exacte :</span>
                    <select
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(parseInt(e.target.value, 10))}
                      className="form-input text-xs py-1 px-2.5 rounded-lg w-28"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {m} mois
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mb-4">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="btn btn-secondary flex-1 rounded-xl text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isPending}
                    className="btn flex-1 rounded-xl text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Confirmer ({durationMonths} mois)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Reactivation (for suspended or expired) */}
            {modalMode === "reactivate" && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Réactiver la boutique
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Confirmez la réactivation de <strong>{shopName}</strong> et définissez sa nouvelle durée d&apos;activité. La boutique et ses produits redeviendront visibles en ligne.
                </p>

                <div className="space-y-3 mb-5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Durée d&apos;activité accordée (1 à 12 mois) :
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDurationMonths(m)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                          durationMonths === m
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {m} mois
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">Ou durée exacte :</span>
                    <select
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(parseInt(e.target.value, 10))}
                      className="form-input text-xs py-1 px-2.5 rounded-lg w-28"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {m} mois
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mb-4">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="btn btn-secondary flex-1 rounded-xl text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleReactivate}
                    disabled={isPending}
                    className="btn flex-1 rounded-xl text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    <span>Confirmer la réactivation</span>
                  </button>
                </div>
              </div>
            )}

            {/* Prolongation */}
            {modalMode === "renew" && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Prolonger la durée d&apos;activité
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Ajouter des mois d&apos;activité supplémentaire pour <strong>{shopName}</strong>.
                </p>

                <div className="space-y-3 mb-5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Nombre de mois à ajouter :
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDurationMonths(m)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors ${
                          durationMonths === m
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        +{m} mois
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">Ou durée exacte :</span>
                    <select
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(parseInt(e.target.value, 10))}
                      className="form-input text-xs py-1 px-2.5 rounded-lg w-28"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          +{m} mois
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mb-4">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="btn btn-secondary flex-1 rounded-xl text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleRenew}
                    disabled={isPending}
                    className="btn flex-1 rounded-xl text-sm bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span>Confirmer (+{durationMonths} mois)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Refus */}
            {modalMode === "reject" && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                  <XCircle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Refuser la boutique
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Indiquez au marchand pourquoi sa boutique ne peut pas être validée en l&apos;état.
                </p>

                <div className="mb-4">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Motif du refus <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Documents non conformes, produits illicites, informations de contact erronées..."
                    className="form-input text-sm rounded-xl"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mb-4">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="btn btn-secondary flex-1 rounded-xl text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isPending}
                    className="btn flex-1 rounded-xl text-sm bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>Confirmer le refus</span>
                  </button>
                </div>
              </div>
            )}

            {/* Suspend */}
            {modalMode === "suspend" && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Suspendre la boutique
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Attention : <strong>{shopName}</strong> et l&apos;ensemble de ses produits seront immédiatement masqués du public jusqu&apos;à réactivation par un Super Admin.
                </p>

                <div className="mb-4">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Motif de la suspension (optionnel) :
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Signalement client en cours d'investigation, litige non résolu..."
                    className="form-input text-sm rounded-xl"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mb-4">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="btn btn-secondary flex-1 rounded-xl text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSuspend}
                    disabled={isPending}
                    className="btn flex-1 rounded-xl text-sm bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-1.5"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    <span>Confirmer la suspension</span>
                  </button>
                </div>
              </div>
            )}

            {/* Block */}
            {modalMode === "block" && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-3">
                  <Ban className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Bloquer définitivement la boutique
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Attention : cette action répressive bloque la boutique <strong>{shopName}</strong> et l&apos;exclut de la plateforme.
                </p>

                <div className="mb-4">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Motif du blocage <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Fraude avérée, vente de contrefaçons, récidive d'infractions..."
                    className="form-input text-sm rounded-xl"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 mb-4">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="btn btn-secondary flex-1 rounded-xl text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleBlock}
                    disabled={isPending}
                    className="btn flex-1 rounded-xl text-sm bg-red-700 hover:bg-red-800 text-white flex items-center justify-center gap-1.5"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                    <span>Bloquer la boutique</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
