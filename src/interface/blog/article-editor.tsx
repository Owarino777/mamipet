"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ConnectedShell } from "@/interface/app/connected/connected-shell";
import {
  articleDocumentSchema,
  getPublicationIssues,
  slugifyArticleTitle,
  type ArticleBlock,
  type ArticleDocument,
  type ArticleDraft,
} from "@/modules/blog/domain/article";
import { maxBlogImageBytes } from "@/modules/blog/domain/image-upload";
import { ArticleBody } from "./article-body";
import { blogApi, jsonRequest } from "./blog-api";

export function ArticleEditor({
  articleId,
  initialDocument,
}: {
  articleId?: string;
  initialDocument?: ArticleDocument;
}) {
  const [document, setDocument] = useState<ArticleDocument | null>(
    initialDocument ?? null,
  );
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const operation = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    if (!articleId) {
      return;
    }
    void blogApi<ArticleDraft>(`/api/admin/blog/${articleId}`, {
      signal: controller.signal,
    })
      .then((value) => {
        setDraft(value);
        setDocument(value.document);
      })
      .catch((reason: Error) => {
        if (!controller.signal.aborted) setError(reason.message);
      });
    return () => controller.abort();
  }, [articleId]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    const guardNavigation = (event: MouseEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      )
        return;
      const anchor = (event.target as Element | null)?.closest("a");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.href === window.location.href
      )
        return;
      if (!window.confirm("Quitter sans enregistrer vos modifications ?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warn);
    window.document.addEventListener("click", guardNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.document.removeEventListener("click", guardNavigation, true);
    };
  }, [dirty]);

  function change(patch: Partial<ArticleDocument>) {
    setDocument((current) => (current ? { ...current, ...patch } : current));
    setDirty(true);
    setNotice("");
  }

  async function run(action: () => Promise<void>) {
    if (operation.current) {
      setError("Une action est déjà en cours. Attendez sa fin avant de continuer.");
      return;
    }
    operation.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "L’action a échoué. Réessayez.",
      );
    } finally {
      operation.current = false;
      setBusy(false);
    }
  }

  async function save() {
    const parsed = articleDocumentSchema.safeParse(document);
    if (!parsed.success)
      throw new Error(
        parsed.error.issues
          .map((issue) => `${issue.path.join(" · ")} : ${issue.message}`)
          .join(" "),
      );
    const saved = await blogApi<ArticleDraft>(
      draft ? `/api/admin/blog/${draft.id}` : "/api/admin/blog",
      jsonRequest(
        draft ? "PATCH" : "POST",
        draft ? { version: draft.version, document: parsed.data } : parsed.data,
      ),
    );
    setDraft(saved);
    setDocument(saved.document);
    setDirty(false);
    // Keep the editor mounted, while making refresh reopen the saved draft.
    window.history.replaceState(null, "", `/admin/blog/${saved.id}`);
    return saved;
  }

  function publish() {
    if (!document) return;
    void run(async () => {
      const issues = getPublicationIssues(document);
      if (issues.length) throw new Error(issues.join(" "));
      const saved = await save();
      const published = await blogApi<ArticleDraft>(
        `/api/admin/blog/${saved.id}/publication`,
        jsonRequest("POST", { version: saved.version, publish: true }),
      );
      setDraft(published);
      setNotice(
        "Article publié. Il est maintenant accessible dans le journal.",
      );
    });
  }

  function updateBlock(index: number, block: ArticleBlock) {
    if (document)
      change({
        blocks: document.blocks.map((value, position) =>
          position === index ? block : value,
        ),
      });
  }

  return (
    <ConnectedShell role="Admin" active="Articles">
      <main className="workspace-main blog-admin">
        <Link className="ghost-button" href="/admin/blog">
          ← Tous les articles
        </Link>
        <header className="workspace-heading">
          <div>
            <p className="section-kicker">Le journal MamiPet</p>
            <h1>
              {articleId || draft ? "Modifier l’article" : "Rédiger un article"}
            </h1>
            <p>
              {draft?.publishedAt
                ? "Une version est en ligne. Vos modifications restent privées jusqu’à la prochaine publication."
                : "Ce brouillon est privé. Publiez-le quand il est prêt."}
            </p>
          </div>
        </header>
        {error ? (
          <p className="workspace-card" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="workspace-card" role="status">
            {notice}
          </p>
        ) : null}
        {!document ? (
          <p role="status">
            {error
              ? "Rechargez la page pour réessayer."
              : "Chargement de l’article…"}
          </p>
        ) : (
          <>
            <div className="blog-toolbar">
              <button
                className="secondary-button"
                type="button"
                disabled={busy}
                onClick={() => setPreview(!preview)}
                aria-pressed={preview}
              >
                {preview ? "Revenir à la rédaction" : "Voir l’aperçu"}
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    await save();
                    setNotice(
                      "Brouillon enregistré. La version publique reste inchangée.",
                    );
                  })
                }
              >
                Enregistrer le brouillon
              </button>
              <button
                className="primary-button"
                type="button"
                disabled={busy}
                onClick={publish}
              >
                {busy
                  ? "Traitement…"
                  : draft?.publishedAt
                    ? "Publier les modifications"
                    : "Publier l’article"}
              </button>
              {draft?.publishedAt ? (
                <>
                  <Link
                    className="ghost-button"
                    href={`/blog/${draft.publicSlug}`}
                    target="_blank"
                    rel="noopener"
                  >
                    Voir en ligne ↗
                  </Link>
                  <button
                    className="ghost-button"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (
                        !window.confirm(
                          "Retirer cet article du site ? Votre brouillon sera conservé.",
                        )
                      )
                        return;
                      void run(async () => {
                        const saved = await blogApi<ArticleDraft>(
                          `/api/admin/blog/${draft.id}/publication`,
                          jsonRequest("POST", {
                            version: draft.version,
                            publish: false,
                          }),
                        );
                        setDraft(saved);
                        setNotice(
                          "Article retiré du site. Le brouillon est conservé.",
                        );
                      });
                    }}
                  >
                    Retirer du site
                  </button>
                </>
              ) : null}
              <span role="status">
                {dirty
                  ? "Modifications non enregistrées"
                  : draft
                    ? "Brouillon enregistré"
                    : "Nouveau brouillon"}
              </span>
            </div>
            {preview ? (
              <article className="workspace-card blog-article">
                <p className="section-kicker">Aperçu privé</p>
                <h1>{document.title || "Titre de l’article"}</h1>
                <p>{document.excerpt}</p>
                <p>Par {document.authorName}</p>
                {document.coverImageUrl ? (
                  <Image
                    className="blog-cover"
                    src={document.coverImageUrl}
                    alt={document.coverImageAlt}
                    width={1200}
                    height={750}
                    unoptimized
                  />
                ) : null}
                <ArticleBody document={document} />
              </article>
            ) : (
              <fieldset className="blog-editor-fields" disabled={busy}>
                <legend className="blog-sr-only">Contenu de l’article</legend>
                <section className="workspace-card blog-fields">
                  <label>
                    Titre
                    <input
                      value={document.title}
                      maxLength={160}
                      onChange={(event) =>
                        change({
                          title: event.target.value,
                          ...(!draft && {
                            slug:
                              slugifyArticleTitle(event.target.value) ||
                              document.slug,
                          }),
                        })
                      }
                    />
                  </label>
                  <label>
                    Adresse de l’article
                    <input
                      value={document.slug}
                      maxLength={160}
                      disabled={Boolean(draft?.publicSlug)}
                      onChange={(event) => change({ slug: event.target.value })}
                      aria-describedby="slug-help"
                    />
                  </label>
                  <small id="slug-help">
                    /blog/{document.slug} · Cette adresse sera conservée après
                    la première publication.
                  </small>
                  <label>
                    Résumé
                    <textarea
                      value={document.excerpt}
                      rows={3}
                      maxLength={320}
                      onChange={(event) =>
                        change({ excerpt: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Auteur
                    <input
                      value={document.authorName}
                      maxLength={100}
                      onChange={(event) =>
                        change({ authorName: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Image de couverture (facultative, JPEG, PNG ou WebP, 4 Mo
                    maximum)
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (!file) return;
                        void run(async () => {
                          if (file.size > maxBlogImageBytes)
                            throw new Error("L’image dépasse 4 Mo.");
                          const result = await blogApi<{ url: string }>(
                            "/api/admin/blog/images",
                            {
                              method: "POST",
                              headers: { "Content-Type": file.type },
                              body: file,
                            },
                          );
                          change({ coverImageUrl: result.url });
                        });
                      }}
                    />
                  </label>
                  {document.coverImageUrl ? (
                    <>
                      <Image
                        className="blog-editor-cover"
                        src={document.coverImageUrl}
                        alt={document.coverImageAlt}
                        width={480}
                        height={300}
                        unoptimized
                      />
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() =>
                          change({ coverImageUrl: "", coverImageAlt: "" })
                        }
                      >
                        Retirer l’image
                      </button>
                      <label>
                        Description de l’image
                        <input
                          value={document.coverImageAlt}
                          maxLength={250}
                          onChange={(event) =>
                            change({ coverImageAlt: event.target.value })
                          }
                        />
                        <small>
                          Décrivez ce que montre l’image pour les personnes qui
                          ne peuvent pas la voir.
                        </small>
                      </label>
                    </>
                  ) : null}
                </section>
                <section className="workspace-card blog-fields">
                  <h2>Texte de l’article</h2>
                  {document.blocks.map((block, index) => (
                    <div className="blog-block" key={index}>
                      <label>
                        Bloc {index + 1}
                        <select
                          value={block.type}
                          onChange={(event) =>
                            updateBlock(index, {
                              type: event.target.value as ArticleBlock["type"],
                              text: block.text,
                            })
                          }
                        >
                          <option value="paragraph">Paragraphe</option>
                          <option value="heading">Sous-titre</option>
                          <option value="list">
                            Liste (une ligne par élément)
                          </option>
                          <option value="quote">Citation</option>
                        </select>
                      </label>
                      <label>
                        Texte du bloc {index + 1}
                        <textarea
                          rows={block.type === "heading" ? 2 : 5}
                          value={block.text}
                          maxLength={
                            block.type === "heading"
                              ? 180
                              : block.type === "quote"
                                ? 2000
                                : block.type === "list"
                                  ? 4000
                                  : 8000
                          }
                          onChange={(event) =>
                            updateBlock(index, {
                              ...block,
                              text: event.target.value,
                            })
                          }
                        />
                      </label>
                      <div className="blog-toolbar">
                        {[-1, 1].map((direction) => (
                          <button
                            key={direction}
                            className="ghost-button"
                            type="button"
                            disabled={
                              index + direction < 0 ||
                              index + direction >= document.blocks.length
                            }
                            aria-label={`${direction < 0 ? "Monter" : "Descendre"} le bloc ${index + 1}`}
                            onClick={() => {
                              const blocks = [...document.blocks];
                              const neighbor = blocks[index + direction];
                              if (!neighbor) return;
                              blocks[index] = neighbor;
                              blocks[index + direction] = block;
                              change({ blocks });
                            }}
                          >
                            {direction < 0 ? "↑ Monter" : "↓ Descendre"}
                          </button>
                        ))}
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => {
                            if (
                              !block.text ||
                              window.confirm(`Supprimer le bloc ${index + 1} ?`)
                            )
                              change({
                                blocks: document.blocks.filter(
                                  (_, position) => position !== index,
                                ),
                              });
                          }}
                        >
                          Supprimer le bloc
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={document.blocks.length >= 100}
                    onClick={() =>
                      change({
                        blocks: [
                          ...document.blocks,
                          { type: "paragraph", text: "" },
                        ],
                      })
                    }
                  >
                    Ajouter un bloc de texte
                  </button>
                </section>
                <details className="workspace-card blog-fields">
                  <summary>
                    Référencement dans les moteurs de recherche (facultatif)
                  </summary>
                  <label>
                    Titre pour les moteurs
                    <input
                      value={document.seoTitle}
                      maxLength={70}
                      onChange={(event) =>
                        change({ seoTitle: event.target.value })
                      }
                      placeholder={document.title}
                    />
                  </label>
                  <label>
                    Description pour les moteurs
                    <textarea
                      value={document.seoDescription}
                      maxLength={170}
                      rows={3}
                      onChange={(event) =>
                        change({ seoDescription: event.target.value })
                      }
                      placeholder={document.excerpt}
                    />
                  </label>
                  <small>
                    Sans ces champs, le titre et le résumé de l’article seront
                    utilisés.
                  </small>
                </details>
              </fieldset>
            )}
          </>
        )}
      </main>
    </ConnectedShell>
  );
}
