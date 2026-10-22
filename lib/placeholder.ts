export function isPlaceholder(value: string | undefined | null): boolean {
  if (!value) return true;
  return value.trim().toUpperCase().startsWith("PLACEHOLDER");
}

export function hasRealContent(value: string | undefined | null): boolean {
  return !isPlaceholder(value);
}
