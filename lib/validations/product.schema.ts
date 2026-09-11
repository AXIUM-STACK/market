import { z } from "zod";

export const ProductSchema = z.object({
  name: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(200, "Le nom ne peut pas dépasser 200 caractères"),

  description: z
    .string()
    .max(5000, "La description ne peut pas dépasser 5000 caractères")
    .optional()
    .nullable(),

  price: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Le prix doit être un nombre positif"
    ),

  currency: z
    .string()
    .length(3, "La devise doit être un code ISO 4217 à 3 lettres")
    .default("CDF"),

  stockQuantity: z
    .number()
    .int("La quantité doit être un entier")
    .min(0, "La quantité ne peut pas être négative")
    .default(0),

  categoryId: z.string().optional().nullable(),

  shopId: z.string().min(1, "La boutique est requise"),

  status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"]).default("DRAFT"),

  isFeatured: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof ProductSchema>;

export const ProductUpdateSchema = ProductSchema.partial().extend({
  shopId: z.string().min(1, "La boutique est requise"),
});

export type ProductUpdateData = z.infer<typeof ProductUpdateSchema>;
