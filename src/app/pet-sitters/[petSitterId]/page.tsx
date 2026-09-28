import type { Metadata } from "next";
import { PetSitterProfilePage } from "@/interface/public/pet-sitter-profile-page";
import { getSiteUrl } from "@/shared/config/site";
import { serializeJsonLd } from "@/shared/seo/json-ld";

type PetSitterPageProps = {
  params: Promise<{
    petSitterId: string;
  }>;
};

export async function generateMetadata({
  params,
}: PetSitterPageProps): Promise<Metadata> {
  const { petSitterId } = await params;
  const title = "Profil pet-sitter";
  const description =
    "Consultez les garanties, services et disponibilités publiques d’un pet-sitter MamiPet.";

  return {
    title,
    description,
    alternates: { canonical: `/pet-sitters/${petSitterId}` },
    openGraph: { title: `${title} | MamiPet`, description, type: "profile" },
    robots: { index: true, follow: true },
  };
}

export default async function PublicPetSitterProfileRoute({
  params,
}: PetSitterPageProps) {
  const { petSitterId } = await params;
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "Profil public d’un pet-sitter MamiPet",
    url: new URL(`/pet-sitters/${petSitterId}`, siteUrl).href,
    isPartOf: { "@type": "WebSite", name: "MamiPet", url: siteUrl.href },
  };

  return (
    <>
      <PetSitterProfilePage petSitterId={petSitterId} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
    </>
  );
}
