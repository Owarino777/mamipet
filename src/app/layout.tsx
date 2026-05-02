import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MamiPet",
  description: "Marketplace de confiance pour la garde d'animaux.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
