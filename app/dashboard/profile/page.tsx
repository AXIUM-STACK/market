import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/clerk";
import MerchantProfileForm from "@/components/forms/MerchantProfileForm";

export default async function ProfilePage() {
  const dbUser = await getOrCreateDbUser();

  const profile = await prisma.merchantProfile.findUnique({
    where: { userId: dbUser.id },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Mon profil marchand</h1>
        <p className="text-sm text-slate-500">
          {profile
            ? "Mettez à jour vos informations."
            : "Créez votre profil pour commencer à vendre."}
        </p>
      </div>
      <MerchantProfileForm profile={profile} />
    </div>
  );
}
