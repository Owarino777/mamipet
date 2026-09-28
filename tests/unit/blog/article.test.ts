import { describe, expect, it } from "vitest";
import {
  articleDocumentSchema,
  createEmptyArticle,
  getPublicationIssues,
  slugifyArticleTitle,
} from "@/modules/blog/domain/article";
import { detectBlogImage } from "@/modules/blog/domain/image-upload";
import { serializeJsonLd } from "@/shared/seo/json-ld";

describe("article publication", () => {
  it("allows an incomplete private draft, but refuses publication", () => {
    const draft = createEmptyArticle();
    expect(articleDocumentSchema.safeParse(draft).success).toBe(true);
    expect(getPublicationIssues(draft)).toHaveLength(3);
  });
  it("requires meaningful content and alternative text for a cover", () => {
    const draft = {
      ...createEmptyArticle(),
      title: "Une garde",
      excerpt: "Préparer son chat",
      coverImageUrl: "https://example.com/cat.jpg",
    };
    expect(getPublicationIssues(draft)).toHaveLength(2);
    expect(
      getPublicationIssues({
        ...draft,
        coverImageAlt: "Un chat sur un coussin",
        blocks: [{ type: "paragraph", text: "Les conseils." }],
      }),
    ).toEqual([]);
  });
  it("rejects executable links, unknown blocks and oversized content", () => {
    const draft = createEmptyArticle();
    for (const coverImageUrl of [
      "javascript:alert(1)",
      "data:image/svg+xml,evil",
      "http://example.com/a.jpg",
    ])
      expect(
        articleDocumentSchema.safeParse({ ...draft, coverImageUrl }).success,
      ).toBe(false);
    expect(
      articleDocumentSchema.safeParse({
        ...draft,
        blocks: [{ type: "html", text: "<script>" }],
      }).success,
    ).toBe(false);
    expect(
      articleDocumentSchema.safeParse({ ...draft, title: "a".repeat(161) })
        .success,
    ).toBe(false);
  });
  it("produces stable readable URLs from accented titles", () => {
    expect(slugifyArticleTitle("  Préparer l’été : chiens & chats ! ")).toBe(
      "preparer-l-ete-chiens-chats",
    );
    expect(slugifyArticleTitle("a-".repeat(200))).toHaveLength(159);
  });
  it("does not allow an article to close its JSON-LD script", () => {
    const data = { title: "</script><script>alert(1)</script>\u2028" };
    const encoded = serializeJsonLd(data);
    expect(encoded).not.toContain("<");
    expect(JSON.parse(encoded)).toEqual(data);
  });
  it("rejects SVG and text disguised as images", () => {
    expect(
      detectBlogImage(new TextEncoder().encode("<svg onload='evil()'/>")),
    ).toBeNull();
    expect(
      detectBlogImage(
        new Uint8Array([0xff, 0xd8, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
      )?.contentType,
    ).toBe("image/jpeg");
  });
});
