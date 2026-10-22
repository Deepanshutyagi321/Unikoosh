import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-paper-alt">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-xs text-ink-soft">
            © {new Date().getFullYear()} UniKosh — an unofficial, student-run
            resource. Not affiliated with any university.
          </p>
          <div className="flex gap-5 font-mono text-xs uppercase tracking-wide">
            <Link href="/" className="text-ink-soft hover:text-navy">
              Universities
            </Link>
            <Link href="/articles" className="text-ink-soft hover:text-navy">
              Articles
            </Link>
            <Link href="/about" className="text-ink-soft hover:text-navy">
              About
            </Link>
            <Link href="/privacy" className="text-ink-soft hover:text-navy">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
