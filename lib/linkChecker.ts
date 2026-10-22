export interface LinkCheckResult {
  ok: boolean;
  statusCode?: number;
  error?: string;
}

// PLACEHOLDER_VERIFY links (unfilled-in) are reported as not-ok with a
// distinct reason, rather than attempting a real request against a token
// that was never meant to be a URL.
export async function checkLink(
  url: string | undefined,
  timeoutMs = 8000
): Promise<LinkCheckResult> {
  if (!url || url === "PLACEHOLDER_VERIFY") {
    return { ok: false, error: "not_set" };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, error: "invalid_url" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "invalid_protocol" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // HEAD first (cheaper) — some servers reject HEAD with 405/501, so
    // fall back to a real GET in that case rather than reporting a false
    // "broken" result for a link that actually works fine.
    let res: Response;
    try {
      res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
      });
      if (res.status === 405 || res.status === 501) {
        res = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
        });
      }
    } catch {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
      });
    }
    return { ok: res.status >= 200 && res.status < 400, statusCode: res.status };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? "timeout"
          : err.message
        : "unknown_error";
    return { ok: false, error: message.slice(0, 200) };
  } finally {
    clearTimeout(timeout);
  }
}

export type LinkFieldResults = Record<
  string,
  LinkCheckResult & { checkedAt: string }
>;

// Checks every populated link on one university, in parallel (bounded by
// there only being ~7 possible link fields, so no extra throttling needed
// at this scope — see scripts/check-links.ts for throttling across many
// universities).
export async function checkUniversityLinks(
  links: Record<string, string | undefined>
): Promise<LinkFieldResults> {
  const entries = Object.entries(links).filter(([, url]) => Boolean(url));

  const results = await Promise.all(
    entries.map(async ([key, url]) => {
      const result = await checkLink(url);
      return [key, { ...result, checkedAt: new Date().toISOString() }] as const;
    })
  );

  return Object.fromEntries(results);
}
