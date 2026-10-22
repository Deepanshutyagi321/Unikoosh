"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { University } from "@/lib/types";

export default function SearchBar({
  universities,
}: {
  universities: University[];
}) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(universities, {
        keys: ["name", "shortName", "state"],
        threshold: 0.35,
      }),
    [universities]
  );

  const results = query.trim()
    ? fuse.search(query).map((r) => r.item)
    : universities;

  return (
    <div className="w-full">
      <label htmlFor="uni-search" className="sr-only">
        Search for your university
      </label>
      <input
        id="uni-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type your university name — e.g. AKTU, LPU, VTU…"
        className="focus-ring w-full rounded-sm border border-border bg-white px-5 py-4 font-body text-lg text-ink placeholder:text-ink-soft/60"
      />

      <p className="mt-3 font-mono text-xs uppercase tracking-wide text-ink-soft">
        {results.length} {results.length === 1 ? "university" : "universities"} indexed
      </p>

      <ul className="mt-4 divide-y divide-border border-y border-border">
        {results.map((uni) => (
          <li key={uni.slug}>
            <Link
              href={`/university/${uni.slug}`}
              className="focus-ring flex items-center justify-between gap-4 px-2 py-4 transition-colors hover:bg-paper-alt"
            >
              <span>
                <span className="font-display text-lg font-medium text-ink">
                  {uni.name}
                </span>
                <span className="ml-3 font-mono text-xs text-ink-soft">
                  {uni.state}
                </span>
              </span>
              <span className="stamp shrink-0 text-navy">{uni.shortName}</span>
            </Link>
          </li>
        ))}
        {results.length === 0 && (
          <li className="px-2 py-6 text-ink-soft">
            No match yet — try a shorter search term.
          </li>
        )}
      </ul>
    </div>
  );
}
