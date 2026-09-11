"use client";

import React from "react";
import { ImageKitProvider } from "@imagekit/next";

export default function AppImageKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const urlEndpoint =
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
    "https://ik.imagekit.io/rartheophile";

  return (
    <ImageKitProvider
      urlEndpoint={urlEndpoint}
      transformationPosition="query"
    >
      {children}
    </ImageKitProvider>
  );
}
