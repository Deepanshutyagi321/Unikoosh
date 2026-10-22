import type { University } from "@/lib/types";
import { hasRealContent } from "@/lib/placeholder";

function siteUrl() {
  return process.env.SITE_URL || "https://example.com";
}

export default function StructuredData({ uni }: { uni: University }) {
  const url = `${siteUrl()}/university/${uni.slug}`;

  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: uni.name,
    url,
  };
  if (hasRealContent(uni.about)) org.description = uni.about;
  if (
    uni.links.officialSite &&
    uni.links.officialSite !== "PLACEHOLDER_VERIFY"
  ) {
    org.sameAs = [uni.links.officialSite];
  }
  if (hasRealContent(uni.contact?.address)) {
    org.address = {
      "@type": "PostalAddress",
      streetAddress: uni.contact!.address,
      addressRegion: uni.state,
    };
  }

  const realFaqs = (uni.faqs ?? []).filter(
    (f) => hasRealContent(f.question) && hasRealContent(f.answer)
  );

  const faqSchema =
    realFaqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: realFaqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
