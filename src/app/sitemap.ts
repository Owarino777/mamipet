import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/shared/config/site";

const publicRoutes = [
  {
    path: "/",
    priority: 1,
  },
  {
    path: "/pet-sitters",
    priority: 0.9,
  },
  {
    path: "/register",
    priority: 0.7,
  },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return publicRoutes.map((route) => ({
    url: new URL(route.path, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}
