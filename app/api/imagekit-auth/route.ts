/**
 * GET /api/imagekit-auth
 *
 * Returns server-side authentication parameters for ImageKit client-side uploads.
 * The private key NEVER leaves the server — this route generates the HMAC signature.
 *
 * Must be called before every upload from the browser.
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getImageKitAuthParams } from "@/lib/imagekit";

export async function GET() {
  // Only authenticated users can get upload auth params
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const authParams = getImageKitAuthParams();
    const publicKey =
      process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ||
      process.env.IMAGEKIT_PUBLIC_KEY ||
      "";

    return NextResponse.json({
      ...authParams,
      publicKey,
    });
  } catch (error) {
    console.error("[ImageKit Auth] Error generating auth params:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération des paramètres ImageKit." },
      { status: 500 }
    );
  }
}
