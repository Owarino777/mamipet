import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/shared/config/site";
import { publicArticleRepository } from "@/modules/blog/application/public-articles";

export const dynamic = "force-dynamic";

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
    path: "/blog",
    priority: 0.7,
  },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const articles = await publicArticleRepository().sitemapEntries();

  return [
    ...publicRoutes.map((route) => ({
      url: new URL(route.path, siteUrl).toString(),
      changeFrequency: "weekly" as const,
      priority: route.priority,
    })),
    ...articles.map((article) => ({
      url: new URL(`/blog/${article.slug}`, siteUrl).toString(),
      lastModified: article.updated_at,
    })),
  ];
}
