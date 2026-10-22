import { NextRequest, NextResponse } from "next/server";
import {
  getUniversityBySlug,
  upsertUniversity,
  deleteUniversity,
} from "@/lib/data";
import type { University } from "@/lib/types";

type RouteParams = Promise<{ slug: string }>;

export async function GET(
  _req: NextRequest,
  { params }: { params: RouteParams }
) {
  const { slug } = await params;
  const uni = await getUniversityBySlug(slug);
  if (!uni) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(uni);
}

// PUT and DELETE are gated by proxy.ts (admin session required).
export async function PUT(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  const { slug } = await params;
  const body = (await req.json()) as University;
  const saved = await upsertUniversity({
    ...body,
    slug,
    lastVerified: new Date().toISOString().slice(0, 10),
  });
  return NextResponse.json(saved);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: RouteParams }
) {
  const { slug } = await params;
  await deleteUniversity(slug);
  return NextResponse.json({ ok: true });
}
