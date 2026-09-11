import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getImageKitAuthParams } from "@/lib/imagekit";

export async function GET() {
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
    console.error("[ImageKit Auth Error]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération des paramètres ImageKit." },
      { status: 500 }
    );
  }
}
