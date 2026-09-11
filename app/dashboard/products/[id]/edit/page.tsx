import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/clerk";
import { notFound } from "next/navigation";
import ProductForm from "@/components/forms/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const dbUser = await getOrCreateDbUser();

  // Ownership check
  const product = await prisma.product.findFirst({
    where: {
      id,
      shop: { merchant: { userId: dbUser.id } },
      deletedAt: null,
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      shop: { select: { id: true, name: true } },
    },
  });

  if (!product) notFound();

  const [merchantShops, categories] = await Promise.all([
    prisma.shop.findMany({
      where: {
        merchant: { userId: dbUser.id },
        status: "ACTIVE",
        deletedAt: null,
      },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, parentId: true },
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
    }),
  ]);

  const serializedProduct = {
    ...product,
    price: product.price.toString(),
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Modifier le produit</h1>
        <p className="text-sm text-slate-500">{product.name}</p>
      </div>
      <ProductForm
        product={serializedProduct}
        shops={merchantShops}
        categories={categories}
        mode="edit"
      />
    </div>
  );
}
