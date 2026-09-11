"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AdminToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const AdminToastContext = createContext<AdminToastContextType | undefined>(undefined);

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: "success" | "error" | "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showSuccess = useCallback((message: string) => {
    addToast(message, "success");
  }, [addToast]);

  const showError = useCallback((message: string) => {
    addToast(message, "error");
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AdminToastContext.Provider value={{ showSuccess, showError }}>
      {children}

      {/* Floating Toasts */}
      <div
        className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-lg border text-sm transition-all duration-300 transform translate-y-0 ${
              toast.type === "success"
                ? "bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20"
                : toast.type === "error"
                ? "bg-red-900 text-white border-red-700 shadow-red-950/20"
                : "bg-slate-900 text-white border-slate-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs uppercase tracking-wider opacity-80 mb-0.5">
                {toast.type === "success" ? "Succès" : "Attention"}
              </p>
              <p className="text-xs leading-relaxed text-white/95">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white p-0.5 rounded-lg shrink-0"
              aria-label="Fermer la notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(AdminToastContext);
  if (!context) {
    return {
      showSuccess: (msg: string) => {
        if (typeof window !== "undefined") console.log("[Success]", msg);
      },
      showError: (msg: string) => {
        if (typeof window !== "undefined") console.error("[Error]", msg);
      },
    };
  }
  return context;
}
