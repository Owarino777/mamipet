import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import { ArticleRepository } from "@/modules/blog/infrastructure/article-repository";
import {
  articleIdSchema,
  publishArticleSchema,
} from "@/modules/blog/presentation/article.schemas";
import { parseJsonBody } from "@/shared/http/request-json";
import { jsonError, jsonOk } from "@/shared/http/route-response";
import { validateInput } from "@/shared/http/validate-input";

export async function POST(
  request: Request,
  context: { params: Promise<{ articleId: string }> },
) {
  try {
    const { supabase } = await requireAdminAccount(request);
    const id = validateInput(articleIdSchema, (await context.params).articleId);
    const input = await parseJsonBody(request, publishArticleSchema);
    return jsonOk(
      await new ArticleRepository(supabase).setPublication(
        id,
        input.version,
        input.publish,
      ),
    );
  } catch (error) {
    return jsonError(error);
  }
}
