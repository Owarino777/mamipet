import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import { articleDocumentSchema } from "@/modules/blog/domain/article";
import { ArticleRepository } from "@/modules/blog/infrastructure/article-repository";
import { articlePageSchema } from "@/modules/blog/presentation/article.schemas";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonCreated, jsonError, jsonOk } from "@/shared/http/route-response";
import { validateInput } from "@/shared/http/validate-input";
import { validateArticleCover } from "@/modules/blog/application/validate-article-cover";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireAdminAccount(request);
    const page = validateInput(
      articlePageSchema,
      new URL(request.url).searchParams.get("page") ?? undefined,
    );
    return jsonOk(await new ArticleRepository(supabase).listDrafts(page));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAdminAccount(request);
    const document = await parseJsonBody(request, articleDocumentSchema);
    validateArticleCover(document);
    return jsonCreated(
      await new ArticleRepository(supabase).create(document, user.id),
    );
  } catch (error) {
    return jsonError(error);
  }
}
