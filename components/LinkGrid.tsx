import type { University } from "@/lib/types";
import { LINK_FIELD_LABELS } from "@/lib/linkFields";

const FIELD_LABELS = LINK_FIELD_LABELS;


export default function LinkGrid({ uni }: { uni: University }) {
  const entries = (
    Object.keys(FIELD_LABELS) as (keyof University["links"])[]
  )
    .map((key) => ({ key, label: FIELD_LABELS[key], url: uni.links[key] }))
    .filter((entry) => Boolean(entry.url));

  return (
    <div className="border-x border-b border-border bg-white">
      {entries.map((entry, i) => {
        const isPlaceholder = entry.url === "PLACEHOLDER_VERIFY";
        return (
          <div
            key={entry.key}
            className={`flex items-center justify-between gap-4 px-6 py-4 sm:px-8 ${
              i !== 0 ? "border-t border-border" : ""
            }`}
          >
            <span className="font-mono text-sm uppercase tracking-wide text-ink-soft">
              {entry.label}
            </span>
            {isPlaceholder ? (
              <span className="font-mono text-sm text-maroon-soft">
                Link not verified yet
              </span>
            ) : (
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring font-display font-medium text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy"
              >
                Open →
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
