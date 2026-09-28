import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/interface/blog/article-body";
import { PublicShell } from "@/interface/shared/product-ui";
import { getPublishedArticle } from "@/modules/blog/application/public-articles";
import { getSiteUrl, siteName } from "@/shared/config/site";
import { serializeJsonLd } from "@/shared/seo/json-ld";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
async function readArticle(props: Props) {
  const { slug } = await props.params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160) notFound();
  const article = await getPublishedArticle(slug);
  if (!article) notFound();
  return article;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const article = await readArticle(props);
  const doc = article.document;
  const title = doc.seoTitle || doc.title;
  const description = doc.seoDescription || doc.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blog/${article.slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [doc.authorName],
      images: doc.coverImageUrl
        ? [{ url: doc.coverImageUrl, alt: doc.coverImageAlt }]
        : undefined,
    },
    twitter: {
      card: doc.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: doc.coverImageUrl ? [doc.coverImageUrl] : undefined,
    },
  };
}

export default async function ArticlePage(props: Props) {
  const article = await readArticle(props);
  const doc = article.document;
  const url = new URL(`/blog/${article.slug}`, getSiteUrl()).href;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: doc.title,
    description: doc.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: url,
    url,
    author: { "@type": "Person", name: doc.authorName },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: getSiteUrl().href,
    },
    ...(doc.coverImageUrl ? { image: doc.coverImageUrl } : {}),
  };
  return (
    <PublicShell>
      <main className="blog-main blog-article">
        <nav aria-label="Fil d’Ariane">
          <Link href="/">Accueil</Link> / <Link href="/blog">Le journal</Link>
        </nav>
        <article>
          <header className="blog-heading">
            <p className="section-kicker">Le journal MamiPet</p>
            <h1>{doc.title}</h1>
            <p>{doc.excerpt}</p>
            <p>
              Par {doc.authorName} ·{" "}
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString("fr-FR", {
                  dateStyle: "long",
                  timeZone: "Europe/Paris",
                })}
              </time>
            </p>
          </header>
          {doc.coverImageUrl ? (
            <Image
              className="blog-cover"
              src={doc.coverImageUrl}
              alt={doc.coverImageAlt}
              width={1200}
              height={750}
              sizes="(max-width: 850px) 100vw, 850px"
              priority
            />
          ) : null}
          <ArticleBody document={doc} />
        </article>
        <Link className="secondary-button" href="/blog">
          Tous les conseils
        </Link>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
        />
      </main>
    </PublicShell>
  );
}
