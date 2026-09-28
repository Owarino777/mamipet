import type { SupabaseClient } from "@supabase/supabase-js";
import {
  articleDocumentSchema,
  getPublicationIssues,
  type ArticleDocument,
  type ArticleDraft,
  type PublishedArticle,
} from "@/modules/blog/domain/article";
import {
  ConflictError,
  HttpError,
  NotFoundError,
} from "@/shared/errors/http-error";
import { throwIfSupabaseError } from "@/shared/supabase/errors";

type DraftRow = {
  id: string;
  document: unknown;
  version: number;
  public_slug: string | null;
  updated_at: string;
  published_at: string | null;
};
type PublicationRow = {
  post_id: string;
  slug: string;
  document: unknown;
  published_at: string;
  updated_at: string;
};
const draftColumns = "id,document,version,public_slug,updated_at,published_at";
const publicColumns = "post_id,slug,document,published_at,updated_at";

function isMissingPublicBlogTable(error: { code?: string } | null) {
  return error?.code === "PGRST205";
}

function draftDto(row: DraftRow): ArticleDraft {
  return {
    id: row.id,
    document: articleDocumentSchema.parse(row.document),
    version: row.version,
    publicSlug: row.public_slug,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}
function publicDto(row: PublicationRow): PublishedArticle {
  return {
    id: row.post_id,
    slug: row.slug,
    document: articleDocumentSchema.parse(row.document),
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

export class ArticleRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listDrafts(page: number) {
    const { data, error, count } = await this.client
      .from("blog_posts")
      .select(draftColumns, { count: "exact" })
      .order("updated_at", { ascending: false })
      .order("id")
      .range((page - 1) * 20, page * 20 - 1);
    throwIfSupabaseError(error, "Unable to list articles.");
    return { articles: (data ?? []).map(draftDto), total: count ?? 0 };
  }

  async findDraft(id: string) {
    const { data, error } = await this.client
      .from("blog_posts")
      .select(draftColumns)
      .eq("id", id)
      .maybeSingle();
    throwIfSupabaseError(error, "Unable to read article.");
    if (!data) throw new NotFoundError("Article introuvable.");
    return draftDto(data);
  }

  async create(document: ArticleDocument, userId: string) {
    const { data, error } = await this.client
      .from("blog_posts")
      .insert({ document, updated_by: userId })
      .select(draftColumns)
      .single();
    throwIfSupabaseError(error, "Unable to create article.");
    if (!data)
      throw new HttpError("Unable to create article.", 500, "DATABASE_ERROR");
    return draftDto(data);
  }

  async save(
    id: string,
    version: number,
    document: ArticleDocument,
    userId: string,
  ) {
    const current = await this.findDraft(id);
    if (current.publicSlug && current.publicSlug !== document.slug) {
      throw new ConflictError(
        "L’adresse d’un article déjà publié ne peut plus changer.",
      );
    }
    const { data, error } = await this.client
      .from("blog_posts")
      .update({ document, updated_by: userId, version: version + 1 })
      .eq("id", id)
      .eq("version", version)
      .select(draftColumns)
      .maybeSingle();
    throwIfSupabaseError(error, "Unable to save article.");
    if (!data)
      throw new ConflictError(
        "Cet article a été modifié ailleurs. Rechargez-le avant d’enregistrer.",
      );
    return draftDto(data);
  }

  async setPublication(id: string, version: number, publish: boolean) {
    if (publish) {
      const current = await this.findDraft(id);
      const issues = getPublicationIssues(current.document);
      if (issues.length)
        throw new HttpError(issues.join(" "), 422, "ARTICLE_INCOMPLETE");
    }
    const { error } = await this.client.rpc("set_blog_publication", {
      p_id: id,
      p_version: version,
      p_publish: publish,
    });
    if (error?.code === "40001")
      throw new ConflictError(
        "Cet article a changé. Rechargez-le avant de publier.",
      );
    if (error?.code === "23505")
      throw new ConflictError(
        "Cette adresse est déjà utilisée par un autre article.",
      );
    if (error?.code === "P0002")
      throw new NotFoundError("Article introuvable.");
    throwIfSupabaseError(error, "Unable to publish article.");
    return this.findDraft(id);
  }

  async listPublished(page: number) {
    const { data, error, count } = await this.client
      .from("blog_publications")
      .select(publicColumns, { count: "exact" })
      .order("published_at", { ascending: false })
      .order("post_id")
      .range((page - 1) * 12, page * 12 - 1);
    if (isMissingPublicBlogTable(error)) return { articles: [], total: 0 };
    throwIfSupabaseError(error, "Unable to list published articles.");
    return { articles: (data ?? []).map(publicDto), total: count ?? 0 };
  }

  async findPublished(slug: string) {
    const { data, error } = await this.client
      .from("blog_publications")
      .select(publicColumns)
      .eq("slug", slug)
      .maybeSingle();
    if (isMissingPublicBlogTable(error)) return null;
    throwIfSupabaseError(error, "Unable to read published article.");
    return data ? publicDto(data) : null;
  }

  async sitemapEntries() {
    const entries: { slug: string; updated_at: string }[] = [];
    for (let offset = 0; offset < 49000; offset += 1000) {
      const { data, error } = await this.client
        .from("blog_publications")
        .select("slug,updated_at")
        .order("post_id")
        .range(offset, offset + 999);
      if (isMissingPublicBlogTable(error)) return [];
      throwIfSupabaseError(error, "Unable to read article sitemap.");
      entries.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
    return entries;
  }
}
