import Link from "next/link";
import type { Article } from "@/lib/types";

export default function ArticleCard({ article }: { article: Article }) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="focus-ring block border border-border bg-white p-6 transition-colors hover:bg-paper-alt"
    >
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-ink-soft">
        {article.category && <span className="text-maroon">{article.category}</span>}
        {date && <span>{date}</span>}
      </div>
      <h2 className="mt-2 font-display text-xl font-bold text-ink">
        {article.title}
      </h2>
      {article.excerpt && (
        <p className="mt-2 font-body text-sm text-ink-soft">{article.excerpt}</p>
      )}
      <p className="mt-3 font-mono text-xs text-ink-soft">
        By {article.authorName}
      </p>
    </Link>
  );
}
