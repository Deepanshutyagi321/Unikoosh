import { isPlaceholder } from "@/lib/placeholder";

export default function CoursesList({
  courses,
  variant = "bullets",
}: {
  courses?: string[];
  variant?: "bullets" | "table" | "inline";
}) {
  const real = (courses ?? []).filter((c) => !isPlaceholder(c));

  if (real.length === 0) {
    return (
      <p className="border border-dashed border-maroon-soft/50 bg-paper-alt px-4 py-3 font-mono text-xs text-maroon-soft">
        No courses listed yet — add flagship programs via /admin.
      </p>
    );
  }

  if (variant === "inline") {
    return (
      <p className="font-body text-sm text-ink-soft">
        <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">
          Flagship programs:{" "}
        </span>
        {real.join(", ")}
      </p>
    );
  }

  if (variant === "table") {
    return (
      <table className="w-full border-collapse text-sm">
        <tbody>
          {real.map((course, i) => (
            <tr key={course} className={i !== 0 ? "border-t border-border" : ""}>
              <td className="py-2 font-mono text-xs text-ink-soft">
                {String(i + 1).padStart(2, "0")}
              </td>
              <td className="py-2 font-body text-ink">{course}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <ul className="space-y-1.5">
      {real.map((course) => (
        <li key={course} className="flex items-baseline gap-2 font-body text-ink">
          <span className="text-maroon">›</span>
          {course}
        </li>
      ))}
    </ul>
  );
}
