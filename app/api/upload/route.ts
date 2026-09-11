import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { isImageKitConfigured, getImageKit } from "@/lib/imagekit";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  // 1. Authenticate user
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Le fichier doit être une image." }, { status: 400 });
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "L'image ne doit pas dépasser 5 Mo." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // If ImageKit is configured, upload to ImageKit cloud
    if (isImageKitConfigured()) {
      const imagekit = getImageKit();
      const uploadRes = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: "/products",
      });

      return NextResponse.json({
        fileId: uploadRes.fileId,
        url: uploadRes.url,
        filePath: uploadRes.filePath,
        fileName: uploadRes.name,
        width: uploadRes.width,
        height: uploadRes.height,
      });
    }

    // Fallback: Local storage in public/uploads/
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const uniqueId = `local-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const filename = `${uniqueId}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      fileId: uniqueId,
      url: publicUrl,
      filePath: publicUrl,
      fileName: file.name,
      width: 800,
      height: 800,
    });
  } catch (err: unknown) {
    console.error("[Upload API Error]", err);
    const msg = err instanceof Error ? err.message : "Erreur serveur lors de l'upload.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
