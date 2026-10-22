import type { University } from "@/lib/types";
import QuickFacts from "@/components/university/QuickFacts";
import LinkGrid from "@/components/LinkGrid";
import AboutSection from "@/components/university/AboutSection";
import CoursesList from "@/components/university/CoursesList";
import FaqBlock from "@/components/university/FaqBlock";
import ContactBlock from "@/components/university/ContactBlock";

export default function TemplateCompact({ uni }: { uni: University }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border pb-3">
        <h1 className="font-display text-2xl font-bold text-ink">
          {uni.name}
        </h1>
        <span className="font-mono text-xs uppercase text-ink-soft">
          {uni.shortName}
        </span>
      </div>

      <QuickFacts uni={uni} variant="row" />

      <LinkGrid uni={uni} />

      <section>
        <AboutSection about={uni.about} uniName={uni.name} variant="compact" />
      </section>

      <CoursesList courses={uni.courses} variant="inline" />

      {uni.commonIssues.length > 0 && (
        <section>
          <h2 className="font-mono text-xs uppercase tracking-wide text-ink-soft">
            Common issues
          </h2>
          <div className="mt-2 space-y-2">
            {uni.commonIssues.map((issue) => (
              <p key={issue.title} className="text-sm">
                <span className="font-display font-medium text-ink">
                  {issue.title}:{" "}
                </span>
                <span className="font-body text-ink-soft">{issue.fix}</span>
              </p>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-mono text-xs uppercase tracking-wide text-ink-soft">
          FAQs
        </h2>
        <div className="mt-2">
          <FaqBlock faqs={uni.faqs} variant="definition" />
        </div>
      </section>

      {uni.contact && <ContactBlock contact={uni.contact} />}
    </div>
  );
}
