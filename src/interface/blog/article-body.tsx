import type { ArticleDocument } from "@/modules/blog/domain/article";

export function ArticleBody({ document }: { document: ArticleDocument }) {
  return (
    <div className="blog-body">
      {document.blocks.map((block, index) => {
        if (!block.text.trim()) return null;
        if (block.type === "heading") return <h2 key={index}>{block.text}</h2>;
        if (block.type === "quote")
          return <blockquote key={index}>{block.text}</blockquote>;
        if (block.type === "list")
          return (
            <ul key={index}>
              {block.text
                .split(/\r?\n/)
                .filter((item) => item.trim())
                .map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
            </ul>
          );
        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}
