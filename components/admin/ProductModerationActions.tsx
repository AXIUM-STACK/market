"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { blockProduct, unblockProduct } from "@/app/actions/admin";
import { Ban, CheckCircle2, Loader2, X } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastContext";

interface ProductModerationActionsProps {
  productId: string;
  productName: string;
  isBlocked: boolean;
  blockedReason?: string | null;
}

export default function ProductModerationActions({
  productId,
  productName,
  isBlocked,
}: ProductModerationActionsProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminToast();
  const [modalMode, setModalMode] = useState<"block" | "unblock" | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const closeModal = () => {
    setModalMode(null);
    setReason("");
    setError(null);
  };

  const handleBlock = () => {
    if (!reason.trim()) {
      setError("Veuillez indiquer un motif de blocage.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await blockProduct(productId, reason);
      if (res.success) {
        showSuccess(`Le produit "${productName}" a été bloqué.`);
        closeModal();
        router.refresh();
      } else {
        setError(res.error);
        showError(res.error);
      }
    });
  };

  const handleUnblock = () => {
    setError(null);
    startTransition(async () => {
      const res = await unblockProduct(productId);
      if (res.success) {
        showSuccess(`Le produit "${productName}" a été débloqué et réactivé.`);
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
      <div className="flex items-center gap-1.5">
        {isBlocked ? (
          <button
            type="button"
            onClick={() => setModalMode("unblock")}
            className="btn btn-xs rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-medium flex items-center gap-1 shadow-2xs"
            title="Débloquer ce produit"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Débloquer</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setModalMode("block")}
            className="btn btn-xs rounded-lg bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-700 border border-slate-200 font-medium flex items-center gap-1"
            title="Bloquer ce produit"
          >
            <Ban className="w-3.5 h-3.5" />
            <span>Bloquer</span>
          </button>
        )}
      </div>

      {/* Confirmation Modals */}
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

            {/* Block Modal */}
            {modalMode === "block" && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-3">
                  <Ban className="w-5 h-5" />
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Bloquer le produit
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Le produit <strong>{productName}</strong> sera immédiatement masqué du catalogue public et ne pourra plus être commandé.
                </p>

                <div className="mb-4">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Motif du blocage <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ex: Produit contrefait, images non conformes, description trompeuse..."
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
                    <span>Confirmer le blocage</span>
                  </button>
                </div>
              </div>
            )}

            {/* Unblock Modal */}
            {modalMode === "unblock" && (
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Débloquer le produit
                </h2>
                <p className="text-sm text-slate-500 mb-4">
                  Confirmez le déblocage de <strong>{productName}</strong>. Si sa boutique est active, le produit redeviendra immédiatement visible et commandable sur la marketplace.
                </p>

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
                    onClick={handleUnblock}
                    disabled={isPending}
                    className="btn flex-1 rounded-xl text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Confirmer le déblocage</span>
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
