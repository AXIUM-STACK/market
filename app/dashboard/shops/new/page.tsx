import { getOrCreateDbUser } from "@/lib/clerk";
import ShopForm from "@/components/forms/ShopForm";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NewShopPage() {
  const dbUser = await getOrCreateDbUser();

  const merchantProfile = await prisma.merchantProfile.findUnique({
    where: { userId: dbUser.id },
    select: { id: true },
  });

  if (!merchantProfile) {
    redirect("/dashboard/profile");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Nouvelle boutique</h1>
        <p className="text-sm text-slate-500">Créez votre vitrine sur AXIUMarket.</p>
      </div>
      <ShopForm mode="create" />
    </div>
  );
}
