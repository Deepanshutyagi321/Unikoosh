import Link from "next/link";

export default function SiteNav() {
  return (
    <header className="border-b border-border bg-paper">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold text-ink">
          UniKosh
        </Link>
        <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-wide">
          <Link href="/" className="text-ink-soft hover:text-navy">
            Universities
          </Link>
          <Link href="/articles" className="text-ink-soft hover:text-navy">
            Articles
          </Link>
          <Link href="/about" className="text-ink-soft hover:text-navy">
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
