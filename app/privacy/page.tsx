import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — UniLinks",
  description: "What data UniLinks collects, why, and how it's used.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <p className="stamp text-maroon">Privacy</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-ink">
        Privacy policy
      </h1>
      <p className="mt-2 font-mono text-xs text-ink-soft">
        Last updated: replace with the date you actually publish this.
      </p>

      <div className="mt-8 space-y-6 font-body leading-relaxed text-ink">
        <section>
          <h2 className="font-display text-lg font-bold text-ink">
            What this site collects
          </h2>
          <p className="mt-2">
            Browsing UniLinks doesn't require an account and doesn't collect
            personal information directly. Standard web server and hosting
            logs (IP address, browser type, pages visited, timestamps) are
            recorded automatically by the hosting provider, as with
            virtually any website — this is used only in aggregate for
            reliability and abuse prevention, not to identify individuals.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink">
            Cookies and advertising
          </h2>
          <p className="mt-2">
            If this site displays ads (e.g. via Google AdSense) or uses
            analytics, those third-party services may set cookies to
            measure traffic or serve relevant ads. They operate under their
            own privacy policies, independent of this one — see Google's
            policy at{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              className="text-navy underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              policies.google.com/technologies/ads
            </a>{" "}
            for how Google specifically handles this. You can control or
            disable cookies through your browser settings at any time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink">
            Admin accounts
          </h2>
          <p className="mt-2">
            Administrators who manage content on this site have separate
            accounts (email + hashed password) used solely for content
            management. This data is never sold, shared with third parties,
            or used for anything beyond operating the site.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink">
            Links to official university sites
          </h2>
          <p className="mt-2">
            This site links out to official university portals, results
            pages, and payment systems. Once you leave UniLinks, that
            destination site's own privacy policy applies — UniLinks has no
            control over and no visibility into what happens on those
            external sites.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink">
            Changes to this policy
          </h2>
          <p className="mt-2">
            This policy may be updated as the site's features change (for
            example, if ads or analytics are added). Material changes will
            be reflected in the "last updated" date above.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-ink">
            Contact
          </h2>
          <p className="mt-2">
            Questions about this policy — replace this line with a real
            contact email before publishing.
          </p>
        </section>
      </div>
    </main>
  );
}
