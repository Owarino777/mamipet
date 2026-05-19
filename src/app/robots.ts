import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/shared/config/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pet-sitters", "/register"],
        disallow: [
          "/admin/",
          "/api/",
          "/dashboard",
          "/login",
          "/owner/",
          "/pet-sitter/",
          "/reservations/",
        ],
      },
    ],
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl.origin,
  };
}
