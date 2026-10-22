"use client";

import { useState } from "react";
import { isPlaceholder } from "@/lib/placeholder";
import type { FaqItem } from "@/lib/types";

export default function FaqBlock({
  faqs,
  variant = "stacked",
}: {
  faqs?: FaqItem[];
  variant?: "accordion" | "stacked" | "definition";
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const real = (faqs ?? []).filter(
    (f) => !isPlaceholder(f.question) && !isPlaceholder(f.answer)
  );
  if (real.length === 0) {
    return (
      <p className="border border-dashed border-maroon-soft/50 bg-paper-alt px-4 py-3 font-mono text-xs text-maroon-soft">
        No FAQs added yet — add a few via /admin (also feeds Google's FAQ
        rich results once filled in).
      </p>
    );
  }

  if (variant === "accordion") {
    return (
      <div className="divide-y divide-border border-y border-border">
        {real.map((faq, i) => {
          const open = openIndex === i;
          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="focus-ring flex w-full items-center justify-between gap-4 py-4 text-left"
                aria-expanded={open}
              >
                <span className="font-display font-medium text-ink">
                  {faq.question}
                </span>
                <span className="font-mono text-ink-soft">
                  {open ? "−" : "+"}
                </span>
              </button>
              {open && (
                <p className="pb-4 font-body text-sm text-ink-soft">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === "definition") {
    return (
      <dl className="space-y-3">
        {real.map((faq) => (
          <div key={faq.question}>
            <dt className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              {faq.question}
            </dt>
            <dd className="mt-0.5 font-body text-sm text-ink">
              {faq.answer}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className="space-y-4">
      {real.map((faq) => (
        <div key={faq.question} className="border border-border bg-white p-4">
          <p className="font-display text-sm font-medium text-ink">
            {faq.question}
          </p>
          <p className="mt-1.5 font-body text-sm text-ink-soft">
            {faq.answer}
          </p>
        </div>
      ))}
    </div>
  );
}
