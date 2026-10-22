import type { University } from "@/lib/types";
import QuickFacts from "@/components/university/QuickFacts";
import LinkGrid from "@/components/LinkGrid";
import AboutSection from "@/components/university/AboutSection";
import CoursesList from "@/components/university/CoursesList";
import FaqBlock from "@/components/university/FaqBlock";
import ContactBlock from "@/components/university/ContactBlock";
import { hasRealContent } from "@/lib/placeholder";

export default function TemplateDossier({ uni }: { uni: University }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
        {uni.type} · {uni.state}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
        {uni.name}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <QuickFacts uni={uni} variant="sidebar" />
          <LinkGrid uni={uni} />
        </aside>

        <div className="space-y-8">
          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              About
            </h2>
            <div className="mt-3">
              <AboutSection about={uni.about} uniName={uni.name} />
            </div>
            {hasRealContent(uni.campusInfo) && (
              <p className="mt-3 font-body text-sm text-ink-soft">
                <span className="font-mono text-xs uppercase text-ink-soft">
                  Campus:{" "}
                </span>
                {uni.campusInfo}
              </p>
            )}
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-ink">
              Courses offered
            </h2>
            <div className="mt-3 border border-border bg-white px-5 py-2">
              <CoursesList courses={uni.courses} variant="table" />
            </div>
          </section>

          {uni.commonIssues.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-bold text-ink">
                Common issues
              </h2>
              <div className="mt-3 space-y-3">
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
              <FaqBlock faqs={uni.faqs} variant="accordion" />
            </div>
          </section>

          {uni.contact && (
            <section>
              <h2 className="font-display text-lg font-bold text-ink">
                Contact
              </h2>
              <div className="mt-3">
                <ContactBlock contact={uni.contact} />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
