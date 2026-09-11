"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/clerk";
import { MerchantProfileSchema } from "@/lib/validations/profile.schema";
import type { ActionResult } from "@/types";
import type { MerchantProfile } from "@/generated/prisma";

/**
 * Creates or updates the merchant profile for the current user.
 */
export async function upsertMerchantProfile(
  formData: FormData
): Promise<ActionResult<MerchantProfile>> {
  const dbUser = await getOrCreateDbUser();

  const rawData = {
    whatsappNumber: formData.get("whatsappNumber") as string,
    displayName: formData.get("displayName") as string | null,
    bio: formData.get("bio") as string | null,
  };

  const validation = MerchantProfileSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const profile = await prisma.merchantProfile.upsert({
    where: { userId: dbUser.id },
    create: {
      userId: dbUser.id,
      whatsappNumber: validation.data.whatsappNumber,
      displayName: validation.data.displayName,
      bio: validation.data.bio,
    },
    update: {
      whatsappNumber: validation.data.whatsappNumber,
      displayName: validation.data.displayName,
      bio: validation.data.bio,
    },
  });

  revalidatePath("/dashboard/profile");

  return { success: true, data: profile };
}

/**
 * Returns the merchant profile for the current user, or null.
 */
export async function getCurrentMerchantProfile(): Promise<MerchantProfile | null> {
  const dbUser = await getOrCreateDbUser();

  return prisma.merchantProfile.findUnique({
    where: { userId: dbUser.id },
  });
}
