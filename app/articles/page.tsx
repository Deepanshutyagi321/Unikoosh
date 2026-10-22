import type { Metadata } from "next";
import { getPublishedArticles } from "@/lib/articles";
import ArticleCard from "@/components/articles/ArticleCard";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Articles — UniLinks",
  description:
    "Guides and explainers on admissions, exams, and choosing a university in India.",
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <p className="stamp text-maroon">Articles</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-ink">
        Guides &amp; explainers
      </h1>
      <p className="mt-3 font-body text-ink-soft">
        Admissions, exams, and how to actually choose a university — written
        plainly, updated when things change.
      </p>

      <div className="mt-10 space-y-4">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
        {articles.length === 0 && (
          <p className="border border-dashed border-border bg-paper-alt p-6 font-mono text-sm text-ink-soft">
            No articles published yet.
          </p>
        )}
      </div>
    </main>
  );
}
