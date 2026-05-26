import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
// Styles par domaine fonctionnel — séparés selon SRP / Clean Architecture
import "./styles/shell.css";
import "./styles/home.css";
import "./styles/search.css";
import "./styles/profile.css";
import "./styles/dashboard.css";
import "./styles/login.css";
import "./styles/register.css";
import "./styles/pet-sitter-setup.css";
import "./styles/pet-sitter-tests.css";
import { getSiteUrl, siteDescription, siteName } from "@/shared/config/site";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: siteName,
  title: {
    default: `${siteName} | Garde d'animaux de confiance`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "MamiPet",
    "pet-sitter",
    "garde animaux",
    "garde chien",
    "garde chat",
    "animaux sensibles",
    "pet-sitting verifie",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${siteName} | Garde d'animaux de confiance`,
    description: siteDescription,
    url: "/",
    siteName,
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${siteName} | Garde d'animaux de confiance`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
