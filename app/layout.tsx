import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import AppImageKitProvider from "@/components/common/AppImageKitProvider";
import { Toaster } from "sonner";
// Supports weights 100-900
import '@fontsource-variable/montserrat/wght.css';

export const metadata: Metadata = {
  title: "AXIUMarket | Marché local",
  description: "Plate-forme de vente en Afrique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr" data-theme="light">
        <body>
          <AppImageKitProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AppImageKitProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
