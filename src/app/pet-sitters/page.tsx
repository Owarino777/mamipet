import type { Metadata } from "next";
import { SearchPage } from "@/interface/public/search-page";
import { getSiteUrl } from "@/shared/config/site";
import { serializeJsonLd } from "@/shared/seo/json-ld";

export const metadata: Metadata = {
  title: "Trouver un pet-sitter près de chez vous",
  description:
    "Comparez des pet-sitters selon la ville, les espèces acceptées, les besoins de soin, les disponibilités et les garanties publiques.",
  alternates: {
    canonical: "/pet-sitters",
  },
  openGraph: {
    title: "Trouver un pet-sitter près de chez vous | MamiPet",
    description:
      "Comparez des pet-sitters selon les besoins réels de votre animal.",
    url: "/pet-sitters",
    type: "website",
  },
};

export default function PetSittersRoute() {
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trouver un pet-sitter près de chez vous",
    description:
      "Comparez les profils publics de pet-sitters MamiPet selon la ville et les besoins de votre animal.",
    url: new URL("/pet-sitters", siteUrl).href,
    isPartOf: { "@type": "WebSite", name: "MamiPet", url: siteUrl.href },
  };

  return (
    <>
      <SearchPage />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
    </>
  );
}
