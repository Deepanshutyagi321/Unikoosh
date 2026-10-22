export const TEMPLATE_COUNT = 5;

// Simple deterministic string hash (djb2) — same slug always maps to the
// same template, but different slugs spread evenly across all 5 layouts.
function hashSlug(slug: string): number {
  let hash = 5381;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 33) ^ slug.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function resolveTemplateId(
  slug: string,
  explicit?: number
): number {
  if (explicit && explicit >= 1 && explicit <= TEMPLATE_COUNT) {
    return explicit;
  }
  return (hashSlug(slug) % TEMPLATE_COUNT) + 1;
}
