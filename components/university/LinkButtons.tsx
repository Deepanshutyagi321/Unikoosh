import type { University } from "@/lib/types";
import { realLinkEntries } from "@/lib/linkFields";

export default function LinkButtons({ uni }: { uni: University }) {
  const entries = realLinkEntries(uni.links);

  return (
    <div className="flex flex-wrap gap-2.5">
      {entries.map((entry) => {
        const isPlaceholder = entry.url === "PLACEHOLDER_VERIFY";
        if (isPlaceholder) return null;
        return (
          <a
            key={entry.key}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-full border border-navy px-4 py-2 font-mono text-xs uppercase tracking-wide text-navy transition-colors hover:bg-navy hover:text-white"
          >
            {entry.label}
          </a>
        );
      })}
    </div>
  );
}
