import { z } from "zod";

export const MerchantProfileSchema = z.object({
  whatsappNumber: z
    .string()
    .min(7, "Le numéro WhatsApp doit contenir au moins 7 chiffres")
    .max(20, "Le numéro WhatsApp ne peut pas dépasser 20 caractères")
    .regex(
      /^[+\d\s()-]+$/,
      "Le numéro WhatsApp ne peut contenir que des chiffres, +, espaces, tirets et parenthèses"
    ),

  displayName: z
    .string()
    .min(2, "Le nom d'affichage doit contenir au moins 2 caractères")
    .max(100, "Le nom d'affichage ne peut pas dépasser 100 caractères")
    .optional()
    .nullable(),

  bio: z
    .string()
    .max(1000, "La biographie ne peut pas dépasser 1000 caractères")
    .optional()
    .nullable(),
});

export type MerchantProfileFormData = z.infer<typeof MerchantProfileSchema>;
