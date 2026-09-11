import { z } from "zod";

export const ShopSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom de la boutique doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  slug: z
    .string()
    .min(2, "Le slug doit contenir au moins 2 caractères")
    .max(100, "Le slug ne peut pas dépasser 100 caractères")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
    ),

  description: z
    .string()
    .max(2000, "La description ne peut pas dépasser 2000 caractères")
    .optional()
    .nullable(),

  logoUrl: z.string().max(1000).optional().or(z.literal("")).nullable(),
  coverImageUrl: z.string().max(1000).optional().or(z.literal("")).nullable(),

  status: z
    .enum([
      "PENDING_APPROVAL",
      "ACTIVE",
      "REJECTED",
      "PAUSED",
      "SUSPENDED",
      "BLOCKED",
      "EXPIRED",
      "ARCHIVED",
    ])
    .default("PENDING_APPROVAL"),
});

export type ShopFormData = z.infer<typeof ShopSchema>;

export const ShopUpdateSchema = ShopSchema.partial();

export type ShopUpdateData = z.infer<typeof ShopUpdateSchema>;
