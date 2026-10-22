import type { University } from "@/lib/types";
import AdmitCardHeader from "@/components/AdmitCardHeader";
import LinkGrid from "@/components/LinkGrid";
import AboutSection from "@/components/university/AboutSection";
import CoursesList from "@/components/university/CoursesList";
import FaqBlock from "@/components/university/FaqBlock";
import ContactBlock from "@/components/university/ContactBlock";
import { hasRealContent } from "@/lib/placeholder";

export default function TemplateLedger({ uni }: { uni: University }) {
  return (
    <div className="space-y-10">
      <div>
        <AdmitCardHeader uni={uni} />
        <LinkGrid uni={uni} />
      </div>

      <section>
        <h2 className="font-display text-xl font-bold text-ink">
          About {uni.shortName}
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
        <h2 className="font-display text-xl font-bold text-ink">
          Popular courses
        </h2>
        <div className="mt-3">
          <CoursesList courses={uni.courses} variant="bullets" />
        </div>
      </section>

      {uni.commonIssues.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-ink">
            Common issues
          </h2>
          <div className="mt-4 space-y-4">
            {uni.commonIssues.map((issue) => (
              <div key={issue.title} className="border border-border bg-white p-5">
                <p className="font-display font-medium text-ink">{issue.title}</p>
                <p className="mt-2 font-body text-sm text-ink-soft">{issue.fix}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl font-bold text-ink">FAQs</h2>
        <div className="mt-4">
          <FaqBlock faqs={uni.faqs} variant="stacked" />
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
