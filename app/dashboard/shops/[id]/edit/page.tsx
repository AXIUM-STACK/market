import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/clerk";
import { notFound } from "next/navigation";
import ShopForm from "@/components/forms/ShopForm";

interface EditShopPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditShopPage({ params }: EditShopPageProps) {
  const { id } = await params;
  const dbUser = await getOrCreateDbUser();

  const shop = await prisma.shop.findFirst({
    where: { id, merchant: { userId: dbUser.id }, deletedAt: null },
  });

  if (!shop) notFound();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Modifier la boutique</h1>
        <p className="text-sm text-slate-500">{shop.name}</p>
      </div>
      <ShopForm shop={shop} mode="edit" />
    </div>
  );
}
