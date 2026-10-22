import type { University } from "@/lib/types";

export default function AdmitCardHeader({ uni }: { uni: University }) {
  return (
    <div className="border border-border bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 p-6 sm:p-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
            {uni.type} · {uni.state}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            {uni.name}
          </h1>
          {uni.studentCount && (
            <p className="mt-2 font-body text-sm text-ink-soft">
              {uni.studentCount} students
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="stamp text-verified">
            Verified {uni.lastVerified}
          </span>
          <span className="font-mono text-2xl font-medium tracking-widest text-navy">
            {uni.shortName}
          </span>
        </div>
      </div>
      <div className="perforated" />
    </div>
  );
}
