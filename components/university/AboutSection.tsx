import { isPlaceholder } from "@/lib/placeholder";

export default function AboutSection({
  about,
  uniName,
  variant = "default",
}: {
  about?: string;
  uniName: string;
  variant?: "default" | "dropcap" | "compact";
}) {
  if (isPlaceholder(about)) {
    return (
      <p className="border border-dashed border-maroon-soft/50 bg-paper-alt px-4 py-3 font-mono text-xs text-maroon-soft">
        No "about" text yet for {uniName} — add 150-300 words via /admin
        covering its history, what it's known for, and what makes it
        different. Pages without this read as thin content to search
        engines.
      </p>
    );
  }

  if (variant === "dropcap") {
    return (
      <p className="font-body leading-relaxed text-ink first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:font-bold first-letter:text-maroon">
        {about}
      </p>
    );
  }

  return (
    <p
      className={`font-body leading-relaxed text-ink ${
        variant === "compact" ? "text-sm" : "text-base"
      }`}
    >
      {about}
    </p>
  );
}
