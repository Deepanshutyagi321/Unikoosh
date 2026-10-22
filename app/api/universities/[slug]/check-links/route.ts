import { NextRequest, NextResponse } from "next/server";
import { getUniversityBySlug, updateLinkHealth } from "@/lib/data";
import { checkUniversityLinks } from "@/lib/linkChecker";

type RouteParams = Promise<{ slug: string }>;

// Gated by proxy.ts (/api/universities/:path*, admin session required).
// Deliberately scoped to one university per request — checking hundreds
// of universities' links in a single serverless invocation risks hitting
// the platform's function timeout. For bulk/scheduled checks, use
// `npm run check-links` (scripts/check-links.ts) instead, which runs as a
// long-lived process outside any request timeout.
export async function POST(
  _req: NextRequest,
  { params }: { params: RouteParams }
) {
  const { slug } = await params;
  const uni = await getUniversityBySlug(slug);
  if (!uni) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const results = await checkUniversityLinks(uni.links);
  await updateLinkHealth(slug, results);

  return NextResponse.json({ slug, results });
}
