import { ArticleEditor } from "@/interface/blog/article-editor";
import { createEmptyArticle } from "@/modules/blog/domain/article";
export const metadata = { title: "Nouvel article" };
export default function NewArticlePage() {
  return <ArticleEditor initialDocument={createEmptyArticle()} />;
}
