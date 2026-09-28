import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { ArticleRepository } from "@/modules/blog/infrastructure/article-repository";
import { getSupabaseServerConfig } from "@/shared/config/supabase-public-env";
import { fetchWithTimeout } from "@/shared/http/fetch-with-timeout";

export function publicArticleRepository() {
  const config = getSupabaseServerConfig();
  // A visitor client deliberately has no administrator session: drafts stay private.
  return new ArticleRepository(
    createClient(config.url, config.publishableKey, {
      global: { fetch: fetchWithTimeout },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }),
  );
}

export const getPublishedArticle = cache((slug: string) =>
  publicArticleRepository().findPublished(slug),
);
