import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedArticles, getArticleBySlug } from "@/lib/articles";
import ArticleBody from "@/components/articles/ArticleBody";
import ArticleStructuredData from "@/components/articles/ArticleStructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

type PageParams = Promise<{ slug: string }>;

function buildDescription(excerpt: string | undefined, body: string): string {
  const source = excerpt?.trim() || body.trim();
  return source.length > 155 ? `${source.slice(0, 152)}...` : source;
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "PUBLISHED") return {};

  const description = buildDescription(article.excerpt, article.body);
  const siteUrl = process.env.SITE_URL || "https://example.com";
  const pageUrl = `${siteUrl}/articles/${article.slug}`;

  return {
    title: article.seo?.title || article.title,
    description: article.seo?.metaDescription || description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: article.seo?.title || article.title,
      description: article.seo?.metaDescription || description,
      url: pageUrl,
      type: "article",
      images: article.seo?.ogImage || article.coverImage
        ? [article.seo?.ogImage || article.coverImage!]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.seo?.title || article.title,
      description: article.seo?.metaDescription || description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "PUBLISHED") notFound();

  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <ArticleStructuredData article={article} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Articles", href: "/articles" },
          { label: article.title },
        ]}
      />

      <Link
        href="/articles"
        className="focus-ring font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-navy"
      >
        ← All articles
      </Link>

      <div className="mt-6 flex items-center gap-3 font-mono text-xs uppercase tracking-wide text-ink-soft">
        {article.category && <span className="text-maroon">{article.category}</span>}
        {date && <span>{date}</span>}
      </div>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
        {article.title}
      </h1>
      <p className="mt-2 font-mono text-xs text-ink-soft">
        By {article.authorName}
      </p>

      <div className="mt-8">
        <ArticleBody body={article.body} />
      </div>

      {article.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-3 py-1 font-mono text-xs text-ink-soft"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {article.relatedUniversities.length > 0 && (
        <div className="mt-10 border-t border-border pt-6">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Mentioned in this article
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {article.relatedUniversities.map((uni) => (
              <Link
                key={uni.slug}
                href={`/university/${uni.slug}`}
                className="focus-ring rounded-sm border border-navy px-3 py-1.5 font-mono text-xs text-navy hover:bg-navy hover:text-white"
              >
                {uni.name} →
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
