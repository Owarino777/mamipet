export const siteName = "MamiPet";

export const siteDescription =
  "MamiPet aide les propriétaires à trouver une garde d’animaux de confiance, adaptée aux besoins de leur chien, chat ou animal sensible.";

export function getSiteUrl(): URL {
  return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://mamipet.fr");
}
