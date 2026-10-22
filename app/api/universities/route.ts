import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAllUniversities,
  getAllUniversitiesAdmin,
  upsertUniversity,
} from "@/lib/data";
import type { University } from "@/lib/types";

export async function GET() {
  const session = await auth();
  const universities = session?.user
    ? await getAllUniversitiesAdmin()
    : await getAllUniversities();
  return NextResponse.json(universities);
}

// POST is gated by proxy.ts (requires a valid admin session).
export async function POST(req: NextRequest) {
  const body = (await req.json()) as University;

  if (!body.slug || !body.name) {
    return NextResponse.json(
      { error: "slug and name are required." },
      { status: 400 }
    );
  }

  const saved = await upsertUniversity({
    ...body,
    lastVerified: new Date().toISOString().slice(0, 10),
  });
  return NextResponse.json(saved, { status: 201 });
}
