import Link from "next/link";
import type { University } from "@/lib/types";

export default function RelatedUniversities({
  universities,
}: {
  universities: University[];
}) {
  if (universities.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-6">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">
        Similar universities
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {universities.map((uni) => (
          <Link
            key={uni.slug}
            href={`/university/${uni.slug}`}
            className="focus-ring rounded-sm border border-border bg-white px-3 py-1.5 font-mono text-xs text-ink hover:border-navy hover:text-navy"
          >
            {uni.shortName || uni.name} →
          </Link>
        ))}
      </div>
    </section>
  );
}
