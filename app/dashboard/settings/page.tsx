import type { Metadata } from "next";
import Link from "next/link";
import { UserProfile } from "@clerk/nextjs";
import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/clerk";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import {
  Settings,
  User,
  Store,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Paramètres du compte | Dashboard AXIUMarket",
  description: "Gérez les paramètres de votre compte et vos préférences marchandes.",
};

export default async function SettingsPage() {
  const dbUser = await getOrCreateDbUser();

  const profile = await prisma.merchantProfile.findUnique({
    where: { userId: dbUser.id },
    include: {
      shops: {
        where: { deletedAt: null },
        select: { id: true, name: true, slug: true, status: true },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-700" />
          <span>Paramètres</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Gérez votre compte, vos préférences marchandes et votre sécurité.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Merchant Profile Status */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Profil Marchand
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-800 text-sm truncate">
                {profile?.displayName || "Non configuré"}
              </p>
              {profile?.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile?.whatsappNumber || "Pas de numéro WhatsApp"}
            </p>
          </div>
          <Link
            href="/dashboard/profile"
            className="text-xs font-semibold text-green-700 hover:text-green-800 flex items-center gap-1 pt-1"
          >
            <span>Modifier le profil</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Active Shops */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Boutiques
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-800">
              {profile?.shops.length ?? 0}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Boutique(s) active(s) sur le marché
            </p>
          </div>
          <Link
            href="/dashboard/shops"
            className="text-xs font-semibold text-green-700 hover:text-green-800 flex items-center gap-1 pt-1"
          >
            <span>Gérer mes boutiques</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Security & Verification */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Vérification
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              {profile?.isVerified ? "Marchand Certifié" : "En attente"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Badge de confiance visible par les acheteurs
            </p>
          </div>
          <p className="text-xs text-slate-400">
            {profile?.isVerified
              ? "Votre compte dispose du badge certifié."
              : "Complétez vos coordonnées pour vérification."}
          </p>
        </div>
      </div>

      {/* Regional & Commerce Preferences */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800">
          Préférences de commerce & devises
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-semibold text-slate-700">Devise principale</p>
            <p className="text-slate-500">
              Franc Congolais (CDF) et Dollar Américain (USD) supportés à l&apos;échelle nationale.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-semibold text-slate-700">Canal de commande direct</p>
            <div className="flex items-center gap-1.5 text-green-700 font-medium pt-0.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>WhatsApp Direct Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security (Clerk UserProfile) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Sécurité & Connexion
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez vos adresses email, mots de passe et sessions actives.
          </p>
        </div>

        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          <UserProfile routing="hash" />
        </div>
      </div>
    </div>
  );
}
