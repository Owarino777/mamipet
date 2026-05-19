export const siteName = "MamiPet";

export const siteDescription =
  "Marketplace de confiance pour trouver un pet-sitter verifie, adapte aux besoins de votre animal, avec reservation securisee.";

export function getSiteUrl(): URL {
  return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mamipet.fr");
}
