import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting AXIUMarket database seed...");

  // 1. Clean existing seed data (optional/safe)
  // We do not delete user accounts if they exist, but ensure idempotent upserts.

  // 2. Categories Hierarchy
  const categories = [
    {
      name: "Électronique & High-Tech",
      slug: "electronique-high-tech",
      description: "Téléphones, ordinateurs, accessoires et gadgets high-tech.",
      children: [
        {
          name: "Smartphones & Tablettes",
          slug: "smartphones-tablettes",
          description: "iPhone, Samsung, Tecno, Infinix et tablettes.",
        },
        {
          name: "Ordinateurs & Bureautique",
          slug: "ordinateurs-bureautique",
          description: "PC portables, claviers, écrans et imprimantes.",
        },
        {
          name: "Accessoires & Écouteurs",
          slug: "accessoires-ecouteurs",
          description: "Chargeurs, coques, AirPods, casques et câbles.",
        },
      ],
    },
    {
      name: "Mode & Vêtements",
      slug: "mode-vetements",
      description: "Prêt-à-porter, pagnes, costumes et streetwear.",
      children: [
        {
          name: "Mode Homme",
          slug: "mode-homme",
          description: "Chemises, polos, pantalons et costumes.",
        },
        {
          name: "Mode Femme & Pagnes",
          slug: "mode-femme-pagnes",
          description: "Robes, pagnes Wax hollandais, jupes et hauts.",
        },
        {
          name: "Chaussures & Sneakers",
          slug: "chaussures-sneakers",
          description: "Baskets de marque, mocassins et sandales.",
        },
      ],
    },
    {
      name: "Maison & Électroménager",
      slug: "maison-electromenager",
      description: "Appareils pour la cuisine, meubles et décoration.",
      children: [
        {
          name: "Appareils de Cuisine",
          slug: "appareils-cuisine",
          description: "Friteuses, mixeurs, micro-ondes et réfrigérateurs.",
        },
        {
          name: "Mobilier & Décoration",
          slug: "mobilier-decoration",
          description: "Salons, rideaux, lampes et tableaux décoratifs.",
        },
      ],
    },
    {
      name: "Beauté & Cosmétiques",
      slug: "beaute-cosmetiques",
      description: "Parfums, soins de la peau, coiffure et maquillage.",
      children: [
        {
          name: "Parfums & Senteurs",
          slug: "parfums-senteurs",
          description: "Eaux de parfum de luxe et brumes corporelles.",
        },
        {
          name: "Soins & Capillaires",
          slug: "soins-capillaires",
          description: "Crèmes hydratantes, perruques et mèches de qualité.",
        },
      ],
    },
    {
      name: "Alimentation & Produits Locaux",
      slug: "alimentation-produits-locaux",
      description: "Épicerie fine, café de l'Est, jus naturels et produits frais.",
      children: [],
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
    categoryMap.set(cat.slug, parent.id);

    for (const child of cat.children) {
      const sub = await prisma.category.upsert({
        where: { slug: child.slug },
        update: {
          name: child.name,
          description: child.description,
          parentId: parent.id,
        },
        create: {
          name: child.name,
          slug: child.slug,
          description: child.description,
          parentId: parent.id,
        },
      });
      categoryMap.set(child.slug, sub.id);
    }
  }

  console.log("✅ Categories hierarchy seeded.");

  // 3. Demo Merchant & User (Kinshasa Commerce)
  const demoClerkId = "user_demo_merchant_kinshasa_001";

  const user = await prisma.user.upsert({
    where: { clerkId: demoClerkId },
    update: {},
    create: {
      clerkId: demoClerkId,
    },
  });

  const merchantProfile = await prisma.merchantProfile.upsert({
    where: { userId: user.id },
    update: {
      whatsappNumber: "+243825001122",
      displayName: "Groupe Elikia Commerce",
      bio: "Commerçant vérifié à Kinshasa (Gombe) & Lubumbashi. Produits neufs garantis avec livraison rapide partout en RDC.",
      isVerified: true,
      isActive: true,
    },
    create: {
      userId: user.id,
      whatsappNumber: "+243825001122",
      displayName: "Groupe Elikia Commerce",
      bio: "Commerçant vérifié à Kinshasa (Gombe) & Lubumbashi. Produits neufs garantis avec livraison rapide partout en RDC.",
      isVerified: true,
      isActive: true,
    },
  });

  console.log("✅ Demo merchant profile created.");

  // 4. Create Shops
  const techShop = await prisma.shop.upsert({
    where: { slug: "kinshasa-tech-store" },
    update: {
      name: "Kinshasa Tech Store",
      description: "Le repère officiel des amateurs de technologie à Kinshasa. Smartphones, MacBooks et accessoires originaux certifiés.",
      status: "ACTIVE",
      isFeatured: true,
      coverImageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80",
    },
    create: {
      merchantId: merchantProfile.id,
      name: "Kinshasa Tech Store",
      slug: "kinshasa-tech-store",
      description: "Le repère officiel des amateurs de technologie à Kinshasa. Smartphones, MacBooks et accessoires originaux certifiés.",
      status: "ACTIVE",
      isFeatured: true,
      coverImageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80",
    },
  });

  const fashionShop = await prisma.shop.upsert({
    where: { slug: "elegance-congolaise" },
    update: {
      name: "Élégance Congolaise",
      description: "Boutique de mode moderne et traditionnelle. Créations sur mesure, Wax Vlisco authentique et prêt-à-porter haut de gamme.",
      status: "ACTIVE",
      isFeatured: true,
      coverImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    },
    create: {
      merchantId: merchantProfile.id,
      name: "Élégance Congolaise",
      slug: "elegance-congolaise",
      description: "Boutique de mode moderne et traditionnelle. Créations sur mesure, Wax Vlisco authentique et prêt-à-porter haut de gamme.",
      status: "ACTIVE",
      isFeatured: true,
      coverImageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
    },
  });

  console.log("✅ Shops seeded.");

  // 5. Products for Tech Shop
  const techProducts = [
    {
      name: "iPhone 15 Pro Max 256GB - Titane Naturel",
      slug: "iphone-15-pro-max-256gb-titane-naturel",
      description: "iPhone 15 Pro Max flambant neuf dans sa boîte scellée. Puce A17 Pro ultra puissante, appareil photo 48 Mpx avec téléobjectif 5x. Garantie constructeur 12 mois.",
      price: 3650000.0, // approx CDF
      currency: "CDF",
      stockQuantity: 8,
      status: "ACTIVE" as const,
      isFeatured: true,
      viewCount: 142,
      categorySlug: "smartphones-tablettes",
      images: [
        {
          imagekitFileId: "seed-iphone-1",
          url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
          fileName: "iphone15promax.jpg",
          sortOrder: 0,
        },
      ],
    },
    {
      name: "MacBook Air M2 13.6\" - 8GB / 256GB SSD Minuit",
      slug: "macbook-air-m2-13-pouces-minuit",
      description: "Ordinateur ultra léger Apple MacBook Air avec puce M2. Écran Liquid Retina lumineux, autonomie jusqu'à 18h. Clavier rétroéclairé AZERTY.",
      price: 3100000.0,
      currency: "CDF",
      stockQuantity: 5,
      status: "ACTIVE" as const,
      isFeatured: true,
      viewCount: 89,
      categorySlug: "ordinateurs-bureautique",
      images: [
        {
          imagekitFileId: "seed-macbook-1",
          url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
          fileName: "macbookairm2.jpg",
          sortOrder: 0,
        },
      ],
    },
    {
      name: "Écouteurs AirPods Pro (2ème Génération) USB-C",
      slug: "airpods-pro-2-usb-c",
      description: "Réduction active du bruit 2x plus efficace, audio spatial personnalisé et étui de recharge MagSafe avec haut-parleur et encoche pour dragonne.",
      price: 680000.0,
      currency: "CDF",
      stockQuantity: 15,
      status: "ACTIVE" as const,
      isFeatured: false,
      viewCount: 65,
      categorySlug: "accessoires-ecouteurs",
      images: [
        {
          imagekitFileId: "seed-airpods-1",
          url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
          fileName: "airpodspro2.jpg",
          sortOrder: 0,
        },
      ],
    },
  ];

  // 6. Products for Fashion Shop
  const fashionProducts = [
    {
      name: "Robe de Cérémonie en Pagne Wax Véritable",
      slug: "robe-ceremonie-pagne-wax",
      description: "Magnifique robe confectionnée par nos maîtres tailleurs à Kinshasa. Tissu Wax hollandais de premier choix, coupe cintrée et finitions impeccables.",
      price: 220000.0,
      currency: "CDF",
      stockQuantity: 12,
      status: "ACTIVE" as const,
      isFeatured: true,
      viewCount: 110,
      categorySlug: "mode-femme-pagnes",
      images: [
        {
          imagekitFileId: "seed-robe-1",
          url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80",
          fileName: "robewax.jpg",
          sortOrder: 0,
        },
      ],
    },
    {
      name: "Chemise Homme Lin Blanc & Détails Africains",
      slug: "chemise-homme-lin-blanc",
      description: "Chemise décontractée et chic en lin pur d'une grande fraîcheur pour le climat tropical. Col mao avec liseré en tissu traditionnel.",
      price: 135000.0,
      currency: "CDF",
      stockQuantity: 20,
      status: "ACTIVE" as const,
      isFeatured: true,
      viewCount: 77,
      categorySlug: "mode-homme",
      images: [
        {
          imagekitFileId: "seed-chemise-1",
          url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80",
          fileName: "chemiselin.jpg",
          sortOrder: 0,
        },
      ],
    },
    {
      name: "Sneakers Streetwear Cuir Blanc & Vert Émeraude",
      slug: "sneakers-streetwear-cuir",
      description: "Baskets au design moderne avec semelle amortissante confort toute la journée. Cuir véritable résistant.",
      price: 250000.0,
      currency: "CDF",
      stockQuantity: 10,
      status: "ACTIVE" as const,
      isFeatured: false,
      viewCount: 52,
      categorySlug: "chaussures-sneakers",
      images: [
        {
          imagekitFileId: "seed-sneakers-1",
          url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
          fileName: "sneakers.jpg",
          sortOrder: 0,
        },
      ],
    },
  ];

  // Insert Tech Products
  for (const p of techProducts) {
    const categoryId = categoryMap.get(p.categorySlug) || null;
    const product = await prisma.product.upsert({
      where: {
        shopId_slug: {
          shopId: techShop.id,
          slug: p.slug,
        },
      },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        stockQuantity: p.stockQuantity,
        status: p.status,
        isFeatured: p.isFeatured,
        viewCount: p.viewCount,
        categoryId,
      },
      create: {
        shopId: techShop.id,
        categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        currency: p.currency,
        stockQuantity: p.stockQuantity,
        status: p.status,
        isFeatured: p.isFeatured,
        viewCount: p.viewCount,
      },
    });

    for (const img of p.images) {
      await prisma.productImage.upsert({
        where: { imagekitFileId: img.imagekitFileId },
        update: {
          url: img.url,
          fileName: img.fileName,
          sortOrder: img.sortOrder,
        },
        create: {
          productId: product.id,
          imagekitFileId: img.imagekitFileId,
          url: img.url,
          fileName: img.fileName,
          sortOrder: img.sortOrder,
        },
      });
    }
  }

  // Insert Fashion Products
  for (const p of fashionProducts) {
    const categoryId = categoryMap.get(p.categorySlug) || null;
    const product = await prisma.product.upsert({
      where: {
        shopId_slug: {
          shopId: fashionShop.id,
          slug: p.slug,
        },
      },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        stockQuantity: p.stockQuantity,
        status: p.status,
        isFeatured: p.isFeatured,
        viewCount: p.viewCount,
        categoryId,
      },
      create: {
        shopId: fashionShop.id,
        categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        currency: p.currency,
        stockQuantity: p.stockQuantity,
        status: p.status,
        isFeatured: p.isFeatured,
        viewCount: p.viewCount,
      },
    });

    for (const img of p.images) {
      await prisma.productImage.upsert({
        where: { imagekitFileId: img.imagekitFileId },
        update: {
          url: img.url,
          fileName: img.fileName,
          sortOrder: img.sortOrder,
        },
        create: {
          productId: product.id,
          imagekitFileId: img.imagekitFileId,
          url: img.url,
          fileName: img.fileName,
          sortOrder: img.sortOrder,
        },
      });
    }
  }

  console.log("✅ Products and images seeded successfully.");
  console.log("🎉 AXIUMarket database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
