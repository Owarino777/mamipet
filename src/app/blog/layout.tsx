import "@/app/styles/blog.css";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="blog-public-shell">{children}</div>;
}
