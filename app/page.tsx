import { getAllUniversities } from "@/lib/data";
import { getPublishedArticles } from "@/lib/articles";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export const revalidate = 3600;


export default async function HomePage() {
  const [universities, articles] = await Promise.all([
    getAllUniversities(),
    getPublishedArticles(),
  ]);
  const recentArticles = articles.slice(0, 3);

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <p className="stamp text-maroon">Unofficial · Student-run</p>
        <Link
          href="/articles"
          className="focus-ring font-mono text-xs uppercase tracking-wide text-navy"
        >
          Articles →
        </Link>
      </div>
      <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Your university's website is confusing.
        <br />
        This isn't.
      </h1>
      <p className="mt-4 max-w-lg font-body text-lg text-ink-soft">
        One page per university. ERP login, results, syllabus, admit card
        and fee payment — the direct links, nothing else.
      </p>

      <div className="mt-10">
        <SearchBar universities={universities} />
      </div>

      {recentArticles.length > 0 && (
        <section className="mt-14 border-t border-border pt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">
              Latest articles
            </h2>
            <Link
              href="/articles"
              className="focus-ring font-mono text-xs uppercase text-ink-soft hover:text-navy"
            >
              See all →
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="focus-ring block border border-border bg-white px-4 py-3 hover:bg-paper-alt"
              >
                <span className="font-display font-medium text-ink">
                  {article.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
