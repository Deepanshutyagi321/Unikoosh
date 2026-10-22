import type { University } from "@/lib/types";
import QuickFacts from "@/components/university/QuickFacts";
import LinkButtons from "@/components/university/LinkButtons";
import AboutSection from "@/components/university/AboutSection";
import CoursesList from "@/components/university/CoursesList";
import FaqBlock from "@/components/university/FaqBlock";
import ContactBlock from "@/components/university/ContactBlock";

export default function TemplateMagazine({ uni }: { uni: University }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="stamp text-maroon">{uni.type}</p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          {uni.name}
        </h1>
        <div className="mt-5">
          <QuickFacts uni={uni} variant="row" />
        </div>
      </div>

      <div className="perforated" />

      <section>
        <AboutSection about={uni.about} uniName={uni.name} variant="dropcap" />
      </section>

      <section>
        <h2 className="font-display text-sm font-medium uppercase tracking-wide text-ink-soft">
          Quick links
        </h2>
        <div className="mt-3">
          <LinkButtons uni={uni} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-sm font-medium uppercase tracking-wide text-ink-soft">
          Programs
        </h2>
        <div className="mt-2">
          <CoursesList courses={uni.courses} variant="inline" />
        </div>
      </section>

      {uni.commonIssues.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-ink">
            Common issues
          </h2>
          <div className="mt-4 space-y-4">
            {uni.commonIssues.map((issue) => (
              <div key={issue.title} className="border-l-2 border-maroon pl-4">
                <p className="font-display font-medium text-ink">{issue.title}</p>
                <p className="mt-1 font-body text-sm text-ink-soft">{issue.fix}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl font-bold text-ink">FAQs</h2>
        <div className="mt-4">
          <FaqBlock faqs={uni.faqs} variant="accordion" />
        </div>
      </section>

      {uni.contact && (
        <section>
          <h2 className="font-display text-xl font-bold text-ink">Contact</h2>
          <div className="mt-3">
            <ContactBlock contact={uni.contact} />
          </div>
        </section>
      )}
    </div>
  );
}
