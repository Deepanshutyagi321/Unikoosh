import type { MetadataRoute } from "next";
import { getAllUniversities } from "@/lib/data";
import { getPublishedArticles } from "@/lib/articles";

// Refreshes hourly against the live database — a university or article
// added via /admin shows up here on its own, without needing a rebuild.
// (This replaced next-sitemap, which only regenerated at build time and
// would silently miss anything added between deployments.)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL || "https://example.com";

  const [universities, articles] = await Promise.all([
    getAllUniversities(),
    getPublishedArticles(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/articles`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const universityPages: MetadataRoute.Sitemap = universities.map((uni) => ({
    url: `${siteUrl}/university/${uni.slug}`,
    lastModified: uni.lastVerified ? new Date(uni.lastVerified) : undefined,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/articles/${article.slug}`,
    lastModified: article.updatedAt ? new Date(article.updatedAt) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...universityPages, ...articlePages];
}
