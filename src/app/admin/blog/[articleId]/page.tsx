import { notFound } from "next/navigation";
import { ArticleEditor } from "@/interface/blog/article-editor";
import { articleIdSchema } from "@/modules/blog/presentation/article.schemas";
export const metadata = { title: "Rédiger un article" };
export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ articleId: string }>;
}) {
  const id = articleIdSchema.safeParse((await params).articleId);
  if (!id.success) notFound();
  return <ArticleEditor articleId={id.data} />;
}
