"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnectedShell } from "@/interface/app/connected/connected-shell";
import type { ArticleDraft } from "@/modules/blog/domain/article";
import { blogApi } from "./blog-api";

export function ArticleList() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{
    articles: ArticleDraft[];
    total: number;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void blogApi<{ articles: ArticleDraft[]; total: number }>(
      `/api/admin/blog?page=${page}`,
      { signal: controller.signal },
    )
      .then((data) => {
        setResult(data);
        setError("");
      })
      .catch((error: Error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [page]);
  return (
    <ConnectedShell role="Admin" active="Articles">
      <main className="workspace-main blog-admin">
        <header className="workspace-heading">
          <div>
            <p className="section-kicker">Le journal MamiPet</p>
            <h1>Vos articles</h1>
            <p>Préparez un brouillon, vérifiez son aperçu, puis publiez-le.</p>
          </div>
          <Link className="primary-button" href="/admin/blog/new">
            Rédiger un article
          </Link>
        </header>
        {error ? (
          <p role="alert" className="workspace-card">
            {error}{" "}
            <button
              type="button"
              className="secondary-button"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </button>
          </p>
        ) : null}
        {!result && !error ? (
          <p role="status">Chargement des articles…</p>
        ) : null}
        {result?.articles.length === 0 ? (
          <section className="workspace-card">
            <h2>Votre journal commence ici.</h2>
            <p>
              Créez votre premier brouillon. Il restera privé jusqu’à sa
              publication.
            </p>
          </section>
        ) : null}
        {result?.articles.map((article) => (
          <article key={article.id} className="workspace-card blog-admin-row">
            <div>
              <span className="trust-badge">
                {article.publishedAt
                  ? "En ligne · brouillon modifiable"
                  : "Brouillon privé"}
              </span>
              <h2>
                <Link href={`/admin/blog/${article.id}`}>
                  {article.document.title || "Article sans titre"}
                </Link>
              </h2>
              <p>
                Dernière modification :{" "}
                {new Date(article.updatedAt).toLocaleString("fr-FR")}
              </p>
            </div>
            <Link
              className="secondary-button"
              href={`/admin/blog/${article.id}`}
            >
              Modifier
            </Link>
          </article>
        ))}
        {result ? (
          <nav className="blog-pagination" aria-label="Pages des articles">
            <button
              type="button"
              className="secondary-button"
              disabled={page === 1}
              onClick={() => {
                setResult(null);
                setPage(page - 1);
              }}
            >
              Précédente
            </button>
            <span>Page {page}</span>
            <button
              type="button"
              className="secondary-button"
              disabled={page * 20 >= result.total}
              onClick={() => {
                setResult(null);
                setPage(page + 1);
              }}
            >
              Suivante
            </button>
          </nav>
        ) : null}
      </main>
    </ConnectedShell>
  );
}
