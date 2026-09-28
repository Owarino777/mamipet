import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import { ArticleRepository } from "@/modules/blog/infrastructure/article-repository";
import {
  articleIdSchema,
  saveArticleSchema,
} from "@/modules/blog/presentation/article.schemas";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { validateInput } from "@/shared/http/validate-input";
import { validateArticleCover } from "@/modules/blog/application/validate-article-cover";

type Context = { params: Promise<{ articleId: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const { supabase } = await requireAdminAccount(request);
    const id = validateInput(articleIdSchema, (await context.params).articleId);
    return jsonOk(await new ArticleRepository(supabase).findDraft(id));
  } catch (error) {
    return jsonError(error);
  }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const { supabase, user } = await requireAdminAccount(request);
    const id = validateInput(articleIdSchema, (await context.params).articleId);
    const input = await parseJsonBody(request, saveArticleSchema);
    validateArticleCover(input.document);
    return jsonOk(
      await new ArticleRepository(supabase).save(
        id,
        input.version,
        input.document,
        user.id,
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}
