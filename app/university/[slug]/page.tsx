import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { ComponentType } from "react";
import { getAllUniversities, getUniversityBySlug, getRelatedUniversities } from "@/lib/data";
import { getArticlesForUniversity } from "@/lib/articles";
import { resolveTemplateId } from "@/lib/templatePicker";
import { hasRealContent } from "@/lib/placeholder";
import StructuredData from "@/components/university/StructuredData";
import EditUniversityButton from "@/components/university/EditUniversityButton";
import RelatedUniversities from "@/components/university/RelatedUniversities";
import ArticlesAboutThis from "@/components/university/ArticlesAboutThis";
import Breadcrumbs from "@/components/Breadcrumbs";
import TemplateLedger from "@/components/templates/TemplateLedger";
import TemplateDossier from "@/components/templates/TemplateDossier";
import TemplateMagazine from "@/components/templates/TemplateMagazine";
import TemplateDashboard from "@/components/templates/TemplateDashboard";
import TemplateCompact from "@/components/templates/TemplateCompact";
import type { University } from "@/lib/types";

export const revalidate = 86400; // 24h — link changes don't need faster than this

export async function generateStaticParams() {
  const universities = await getAllUniversities();
  return universities.map((u) => ({ slug: u.slug }));
}

type PageParams = Promise<{ slug: string }>;

// Wider layouts (sidebar / card grid) need more horizontal room than the
// single-column reading layouts — keeps every template looking intentional
// rather than a fixed-width box everything gets stuffed into.
const MAX_WIDTH: Record<number, string> = {
  1: "max-w-2xl",
  2: "max-w-5xl",
  3: "max-w-2xl",
  4: "max-w-4xl",
  5: "max-w-2xl",
};

const TEMPLATES: Record<number, ComponentType<{ uni: University }>> = {
  1: TemplateLedger,
  2: TemplateDossier,
  3: TemplateMagazine,
  4: TemplateDashboard,
  5: TemplateCompact,
};

function buildDescription(uni: University): string {
  if (hasRealContent(uni.about)) {
    const trimmed = uni.about!.trim();
    return trimmed.length > 155 ? `${trimmed.slice(0, 152)}...` : trimmed;
  }
  return `Direct links for ${uni.name}: ERP login, results, syllabus, admit card and fee payment. Verified ${uni.lastVerified}.`;
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const uni = await getUniversityBySlug(slug);
  if (!uni) return {};

  const autoDescription = buildDescription(uni);
  const autoTitle = `${uni.shortName} ERP, Results & Syllabus — Direct Links`;
  const siteUrl = process.env.SITE_URL || "https://example.com";
  const pageUrl = `${siteUrl}/university/${uni.slug}`;

  const title = hasRealContent(uni.seo?.title) ? uni.seo!.title! : autoTitle;
  const description = hasRealContent(uni.seo?.metaDescription)
    ? uni.seo!.metaDescription!
    : autoDescription;
  const canonicalUrl = hasRealContent(uni.seo?.canonicalUrl)
    ? uni.seo!.canonicalUrl!
    : pageUrl;
  const ogTitle = hasRealContent(uni.seo?.ogTitle) ? uni.seo!.ogTitle! : title;
  const ogDescription = hasRealContent(uni.seo?.ogDescription)
    ? uni.seo!.ogDescription!
    : description;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: pageUrl,
      type: "website",
      images: hasRealContent(uni.seo?.ogImage) ? [uni.seo!.ogImage!] : undefined,
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description: ogDescription,
    },
  };
}

export default async function UniversityPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  const uni = await getUniversityBySlug(slug);
  if (!uni || uni.isDeleted || uni.status !== "ACTIVE") notFound();

  const templateId = resolveTemplateId(uni.slug, uni.templateId);
  const Template = TEMPLATES[templateId];

  const [relatedUniversities, relatedArticles] = await Promise.all([
    getRelatedUniversities(uni.slug, uni.state, uni.type),
    getArticlesForUniversity(uni.slug),
  ]);

  return (
    <main className={`mx-auto min-h-screen ${MAX_WIDTH[templateId]} px-6 py-16`}>
      <StructuredData uni={uni} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Universities", href: "/" },
          { label: uni.shortName || uni.name },
        ]}
      />

      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="focus-ring font-mono text-xs uppercase tracking-wide text-ink-soft hover:text-navy"
        >
          ← All universities
        </Link>
        <EditUniversityButton slug={uni.slug} />
      </div>

      <div className="mt-6">
        <Template uni={uni} />
      </div>

      <RelatedUniversities universities={relatedUniversities} />
      <ArticlesAboutThis articles={relatedArticles} />

      <p className="mt-10 font-mono text-xs text-ink-soft">
        Unofficial resource — always fall back to {uni.shortName}'s official
        site if a link here looks wrong.
      </p>
    </main>
  );
}
