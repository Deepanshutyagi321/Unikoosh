import { isPlaceholder } from "@/lib/placeholder";
import type { University } from "@/lib/types";

function factsOf(uni: University) {
  return [
    { label: "State", value: uni.state },
    { label: "Type", value: uni.type },
    { label: "Established", value: uni.establishedYear },
    { label: "Students", value: uni.studentCount },
    { label: "Accreditation", value: uni.accreditation },
  ].filter((f) => !isPlaceholder(f.value));
}

export default function QuickFacts({
  uni,
  variant = "row",
}: {
  uni: University;
  variant?: "row" | "sidebar" | "cards";
}) {
  const facts = factsOf(uni);
  if (facts.length === 0) return null;

  if (variant === "sidebar") {
    return (
      <dl className="space-y-3 border border-border bg-white p-5">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-soft">
              {f.label}
            </dt>
            <dd className="font-display text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (variant === "cards") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {facts.map((f) => (
          <div key={f.label} className="border border-border bg-white p-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-soft">
              {f.label}
            </p>
            <p className="mt-1 font-display text-lg font-bold text-navy">
              {f.value}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {facts.map((f) => (
        <p key={f.label} className="font-body text-sm">
          <span className="font-mono text-xs uppercase text-ink-soft">
            {f.label}:{" "}
          </span>
          <span className="text-ink">{f.value}</span>
        </p>
      ))}
    </div>
  );
}
