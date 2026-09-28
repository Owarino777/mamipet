import type { ArticleDocument } from "@/modules/blog/domain/article";
import { getSupabaseServerConfig } from "@/shared/config/supabase-public-env";
import { HttpError } from "@/shared/errors/http-error";

export function validateArticleCover(document: ArticleDocument): void {
  if (!document.coverImageUrl) return;
  const image = new URL(document.coverImageUrl);
  const storage = new URL(getSupabaseServerConfig().url);
  if (
    image.origin !== storage.origin ||
    !image.pathname.startsWith("/storage/v1/object/public/blog-images/")
  ) {
    throw new HttpError(
      "Importez l’image depuis l’éditeur de l’article.",
      400,
      "INVALID_COVER_URL",
    );
  }
}
