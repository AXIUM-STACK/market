import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/clerk";
import { redirect } from "next/navigation";
import ProductForm from "@/components/forms/ProductForm";

export default async function NewProductPage() {
  const dbUser = await getOrCreateDbUser();

  const merchantProfile = await prisma.merchantProfile.findUnique({
    where: { userId: dbUser.id },
    include: {
      shops: {
        where: { status: "ACTIVE", deletedAt: null },
        select: { id: true, name: true },
      },
    },
  });

  if (!merchantProfile || merchantProfile.shops.length === 0) {
    redirect("/dashboard/shops/new");
  }

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, parentId: true },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Nouveau produit</h1>
        <p className="text-sm text-slate-500">Remplissez les informations de votre produit.</p>
      </div>
      <ProductForm
        shops={merchantProfile.shops}
        categories={categories}
        mode="create"
      />
    </div>
  );
}
