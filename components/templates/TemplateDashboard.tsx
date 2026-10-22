import type { University } from "@/lib/types";
import QuickFacts from "@/components/university/QuickFacts";
import LinkCards from "@/components/university/LinkCards";
import AboutSection from "@/components/university/AboutSection";
import CoursesList from "@/components/university/CoursesList";
import FaqBlock from "@/components/university/FaqBlock";
import ContactBlock from "@/components/university/ContactBlock";
import { hasRealContent } from "@/lib/placeholder";

export default function TemplateDashboard({ uni }: { uni: University }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
          {uni.name}
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-ink-soft">
          {uni.shortName}
        </p>
      </div>

      <QuickFacts uni={uni} variant="cards" />

      <section>
        <h2 className="font-mono text-xs font-medium uppercase tracking-wide text-ink-soft">
          Links
        </h2>
        <div className="mt-3">
          <LinkCards uni={uni} />
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="border border-border bg-white p-5">
          <h2 className="font-display font-bold text-ink">About</h2>
          <div className="mt-2">
            <AboutSection about={uni.about} uniName={uni.name} variant="compact" />
          </div>
          {hasRealContent(uni.campusInfo) && (
            <p className="mt-2 font-body text-xs text-ink-soft">
              {uni.campusInfo}
            </p>
          )}
        </section>

        <section className="border border-border bg-white p-5">
          <h2 className="font-display font-bold text-ink">Courses</h2>
          <div className="mt-2">
            <CoursesList courses={uni.courses} variant="bullets" />
          </div>
        </section>
      </div>

      {uni.commonIssues.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-bold text-ink">
            Common issues
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {uni.commonIssues.map((issue) => (
              <div key={issue.title} className="border border-border bg-white p-4">
                <p className="font-display text-sm font-medium text-ink">
                  {issue.title}
                </p>
                <p className="mt-1.5 font-body text-sm text-ink-soft">
                  {issue.fix}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-lg font-bold text-ink">FAQs</h2>
        <div className="mt-3">
          <FaqBlock faqs={uni.faqs} variant="stacked" />
        </div>
      </section>

      {uni.contact && (
        <section className="border border-border bg-white p-5">
          <h2 className="font-display font-bold text-ink">Contact</h2>
          <div className="mt-2">
            <ContactBlock contact={uni.contact} />
          </div>
        </section>
      )}
    </div>
  );
}
