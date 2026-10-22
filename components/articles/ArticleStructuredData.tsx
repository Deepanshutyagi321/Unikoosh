import type { Article } from "@/lib/types";

function siteUrl() {
  return process.env.SITE_URL || "https://example.com";
}

export default function ArticleStructuredData({ article }: { article: Article }) {
  const url = `${siteUrl()}/articles/${article.slug}`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    url,
    author: { "@type": "Person", name: article.authorName },
    mainEntityOfPage: url,
  };
  if (article.excerpt) schema.description = article.excerpt;
  if (article.coverImage) schema.image = article.coverImage;
  if (article.publishedAt) schema.datePublished = article.publishedAt;
  if (article.updatedAt) schema.dateModified = article.updatedAt;

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
