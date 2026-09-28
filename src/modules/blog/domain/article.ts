import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
export const articleBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: text(8000) }).strict(),
  z.object({ type: z.literal("heading"), text: text(180) }).strict(),
  z.object({ type: z.literal("quote"), text: text(2000) }).strict(),
  z.object({ type: z.literal("list"), text: text(4000) }).strict(),
]);

export const articleDocumentSchema = z
  .object({
    title: text(160),
    slug: z
      .string()
      .max(160)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Utilisez des lettres minuscules, chiffres et tirets.",
      ),
    excerpt: text(320),
    authorName: text(100),
    coverImageUrl: z.union([
      z.literal(""),
      z
        .string()
        .url()
        .max(2048)
        .refine((value) => {
          const url = new URL(value);
          const isLocalDevelopment =
            process.env.NODE_ENV !== "production" &&
            url.protocol === "http:" &&
            ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
          return (
            (url.protocol === "https:" || isLocalDevelopment) &&
            !url.username &&
            !url.password
          );
        }, "Une adresse HTTPS est requise."),
    ]),
    coverImageAlt: text(250),
    seoTitle: text(70),
    seoDescription: text(170),
    blocks: z.array(articleBlockSchema).max(100),
  })
  .strict();

export type ArticleDocument = z.infer<typeof articleDocumentSchema>;
export type ArticleBlock = z.infer<typeof articleBlockSchema>;
export type ArticleDraft = {
  id: string;
  document: ArticleDocument;
  version: number;
  publicSlug: string | null;
  updatedAt: string;
  publishedAt: string | null;
};
export type PublishedArticle = {
  id: string;
  slug: string;
  document: ArticleDocument;
  publishedAt: string;
  updatedAt: string;
};

export function getPublicationIssues(document: ArticleDocument): string[] {
  const issues: string[] = [];
  if (!document.title.trim()) issues.push("Renseignez le titre.");
  if (!document.excerpt.trim()) issues.push("Renseignez le résumé.");
  if (!document.authorName.trim())
    issues.push("Renseignez le nom de l’auteur.");
  if (!document.blocks.some((block) => block.text.trim()))
    issues.push("Ajoutez le contenu de l’article.");
  if (document.coverImageUrl && !document.coverImageAlt.trim())
    issues.push("Décrivez l’image de couverture.");
  return issues;
}

export function slugifyArticleTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160)
    .replace(/-$/, "");
}

export function createEmptyArticle(): ArticleDocument {
  return {
    title: "",
    slug: `article-${crypto.randomUUID().slice(0, 8)}`,
    excerpt: "",
    authorName: "MamiPet",
    coverImageUrl: "",
    coverImageAlt: "",
    seoTitle: "",
    seoDescription: "",
    blocks: [{ type: "paragraph", text: "" }],
  };
}
