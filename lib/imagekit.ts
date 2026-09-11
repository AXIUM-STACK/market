/**
 * AXIUMarket — Server-side ImageKit initialization
 *
 * Uses @imagekit/nodejs (the current server-side SDK).
 * NEVER import this in client components.
 * The private key must remain server-side only.
 */

import ImageKit from "imagekit";

// Lazy singleton to avoid multiple instantiations
let imagekitInstance: ImageKit | null = null;

export function isImageKitConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT &&
    process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY
  );
}

export function getImageKit(): ImageKit {
  if (imagekitInstance) return imagekitInstance;

  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!urlEndpoint || !publicKey || !privateKey) {
    throw new Error(
      "ImageKit configuration missing. Set NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT, " +
        "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY, and IMAGEKIT_PRIVATE_KEY in your .env file."
    );
  }

  imagekitInstance = new ImageKit({
    urlEndpoint,
    publicKey,
    privateKey,
  });

  return imagekitInstance;
}

/**
 * Generates server-side authentication parameters for client-side uploads.
 * This is called by the /api/imagekit-auth route handler.
 * The private key NEVER leaves the server.
 */
export function getImageKitAuthParams(): {
  token: string;
  expire: number;
  signature: string;
} {
  return getImageKit().getAuthenticationParameters();
}
