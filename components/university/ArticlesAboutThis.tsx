import Link from "next/link";
import type { Article } from "@/lib/types";

export default function ArticlesAboutThis({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-6">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
        Articles mentioning this university
      </p>
      <div className="mt-3 space-y-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="focus-ring block border border-border bg-white px-4 py-3 hover:bg-paper-alt"
          >
            <span className="font-display font-medium text-ink">{article.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
