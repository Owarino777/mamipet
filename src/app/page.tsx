import type { Metadata } from "next";
import { HomePage } from "@/interface/public/home-page";
import { getSiteUrl, siteDescription, siteName } from "@/shared/config/site";
import { serializeJsonLd } from "@/shared/seo/json-ld";

export const metadata: Metadata = {
  title: "Garde d’animaux de confiance près de chez vous",
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Garde d’animaux de confiance | MamiPet",
    description: siteDescription,
    url: "/",
    type: "website",
  },
};

export default function HomeRoute() {
  const siteUrl = getSiteUrl();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: siteUrl.href,
      description: siteDescription,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: siteUrl.href,
      description: siteDescription,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl.href}pet-sitters?city={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <>
      <HomePage />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
    </>
  );
}
