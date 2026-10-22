import type { University } from "@/lib/types";
import { realLinkEntries } from "@/lib/linkFields";

export default function LinkCards({ uni }: { uni: University }) {
  const entries = realLinkEntries(uni.links);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {entries.map((entry) => {
        const isPlaceholder = entry.url === "PLACEHOLDER_VERIFY";
        return (
          <div
            key={entry.key}
            className="flex flex-col justify-between gap-3 border border-border bg-white p-4"
          >
            <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              {entry.label}
            </span>
            {isPlaceholder ? (
              <span className="font-mono text-xs text-maroon-soft">
                Not verified yet
              </span>
            ) : (
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring font-display text-sm font-medium text-navy underline underline-offset-4"
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
