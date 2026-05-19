import type { Metadata } from "next";
import { PetSitterProfilePage } from "@/interface/public/pet-sitter-profile-page";

type PetSitterPageProps = {
  params: Promise<{
    petSitterId: string;
  }>;
};

export const metadata: Metadata = {
  title: "Profil pet-sitter",
  description:
    "Consultez les garanties, services et disponibilites publiques d'un pet-sitter MamiPet.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PublicPetSitterProfileRoute({
  params,
}: PetSitterPageProps) {
  const { petSitterId } = await params;

  return <PetSitterProfilePage petSitterId={petSitterId} />;
}
