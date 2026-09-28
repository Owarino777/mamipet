import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/interface/shared/product-ui";
import { publicArticleRepository } from "@/modules/blog/application/public-articles";
import { articlePageSchema } from "@/modules/blog/presentation/article.schemas";
import { getSiteUrl } from "@/shared/config/site";
import { serializeJsonLd } from "@/shared/seo/json-ld";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ page?: string }> };
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const page = articlePageSchema.safeParse((await searchParams).page);
  const canonical =
    page.success && page.data > 1 ? `/blog?page=${page.data}` : "/blog";
  return {
    title: "Conseils pour la garde de vos animaux",
    description:
      "Les conseils MamiPet pour préparer une garde et accompagner les besoins de votre animal.",
    alternates: { canonical },
    openGraph: { title: "Le journal MamiPet", url: canonical, type: "website" },
  };
}

export default async function BlogPage({ searchParams }: Props) {
  const result = articlePageSchema.safeParse((await searchParams).page);
  if (!result.success) notFound();
  const page = result.data;
  const { articles, total } =
    await publicArticleRepository().listPublished(page);
  if (page > 1 && !articles.length) notFound();
  const siteUrl = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Le journal MamiPet",
    description:
      "Conseils pratiques pour préparer une garde et prendre soin de son animal.",
    url: new URL(page === 1 ? "/blog" : `/blog?page=${page}`, siteUrl).href,
    isPartOf: { "@type": "WebSite", name: "MamiPet", url: siteUrl.href },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: (page - 1) * 12 + index + 1,
        url: new URL(`/blog/${article.slug}`, siteUrl).href,
        name: article.document.title,
      })),
    },
  };
  return (
    <PublicShell>
      <main className="blog-main">
        <header className="blog-heading">
          <p className="section-kicker">Le journal MamiPet</p>
          <h1>Bien préparer sa garde, prendre soin de son animal.</h1>
          <p>Des conseils pour vous accompagner, à chaque étape.</p>
        </header>
        {articles.length ? (
          <div className="blog-grid">
            {articles.map((article) => (
              <article className="blog-card" key={article.id}>
                {article.document.coverImageUrl ? (
                  <Image
                    src={article.document.coverImageUrl}
                    alt={article.document.coverImageAlt}
                    width={720}
                    height={450}
                    sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  />
                ) : null}
                <div>
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                      timeZone: "Europe/Paris",
                    })}
                  </time>
                  <h2>
                    <Link href={`/blog/${article.slug}`}>
                      {article.document.title}
                    </Link>
                  </h2>
                  <p>{article.document.excerpt}</p>
                  <Link
                    className="secondary-button"
                    href={`/blog/${article.slug}`}
                  >
                    Lire l’article
                    <span className="blog-sr-only">
                      {" "}
                      : {article.document.title}
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="workspace-card blog-empty">
            <h2>Les premiers conseils arrivent bientôt.</h2>
            <p>En attendant, découvrez les profils et les services de garde.</p>
            <Link className="primary-button" href="/pet-sitters">
              Rechercher une garde
            </Link>
          </section>
        )}
        <nav className="blog-pagination" aria-label="Pages du journal">
          {page > 1 ? (
            <Link href={page === 2 ? "/blog" : `/blog?page=${page - 1}`}>
              Page précédente
            </Link>
          ) : null}
          <span>
            Page {page} sur {Math.max(1, Math.ceil(total / 12))}
          </span>
          {page * 12 < total ? (
            <Link href={`/blog?page=${page + 1}`}>Page suivante</Link>
          ) : null}
        </nav>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
        />
      </main>
    </PublicShell>
  );
}
