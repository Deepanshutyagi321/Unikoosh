import { isPlaceholder } from "@/lib/placeholder";
import type { ContactInfo } from "@/lib/types";

export default function ContactBlock({ contact }: { contact?: ContactInfo }) {
  if (!contact) return null;
  const rows = [
    { label: "Address", value: contact.address },
    { label: "Phone", value: contact.phone },
    { label: "Email", value: contact.email },
  ].filter((r) => !isPlaceholder(r.value));

  if (rows.length === 0) return null;

  return (
    <dl className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="flex gap-3 text-sm">
          <dt className="w-20 shrink-0 font-mono text-xs uppercase tracking-wide text-ink-soft">
            {row.label}
          </dt>
          <dd className="font-body text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
