import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — UniLinks",
  description:
    "Why UniLinks exists, how it's run, and how link accuracy is maintained.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <p className="stamp text-maroon">About</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-ink">
        Why this exists
      </h1>

      <div className="mt-8 space-y-5 font-body leading-relaxed text-ink">
        <p>
          Most Indian university websites bury the things students actually
          need — the ERP login, the results portal, the syllabus PDF —
          behind confusing navigation, broken menus, or pages that haven't
          been updated in years. UniLinks exists to fix one specific
          problem: getting you from "I need my result" to the actual result
          page, without the detour.
        </p>
        <p>
          Each university gets one page with the direct links, in one
          place, checked periodically rather than left to rot.
        </p>
        <p>
          <strong>This is an unofficial, independently run resource.</strong>{" "}
          It isn't affiliated with, endorsed by, or operated on behalf of
          any university named on this site. Where a link looks wrong or a
          university's official process has changed, always defer to that
          university's own official website.
        </p>
        <p>
          Link accuracy is maintained manually — each university page shows
          a "last verified" date so you can judge freshness yourself. If you
          spot a broken or outdated link, that feedback is what keeps this
          useful; there's no way to submit corrections in-app yet, but that
          is on the list.
        </p>
      </div>
    </main>
  );
}
