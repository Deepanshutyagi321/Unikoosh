import { NextRequest, NextResponse } from "next/server";
import { upsertUniversity } from "@/lib/data";
import type { University } from "@/lib/types";

// Expected flat CSV row shape (see public/sample-universities.csv).
// Multi-value fields are semicolon-separated in the CSV.
interface CsvRow {
  slug?: string;
  name?: string;
  shortName?: string;
  state?: string;
  type?: string;
  studentCount?: string;
  establishedYear?: string;
  accreditation?: string;
  about?: string;
  campusInfo?: string;
  courses?: string; // "Course A; Course B; Course C"
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  officialSite?: string;
  erp?: string;
  results?: string;
  syllabus?: string;
  admitCard?: string;
  feePayment?: string;
  admission?: string;
  templateId?: string;
  seoTitle?: string;
  seoMetaDescription?: string;
  seoCanonicalUrl?: string;
  seoOgTitle?: string;
  seoOgDescription?: string;
  seoOgImage?: string;
}

function rowToUniversity(row: CsvRow): University | null {
  if (!row.slug?.trim() || !row.name?.trim()) return null;

  const templateNum = row.templateId ? Number(row.templateId) : undefined;

  return {
    slug: row.slug.trim(),
    name: row.name.trim(),
    shortName: row.shortName?.trim() || row.slug.trim().toUpperCase(),
    state: row.state?.trim() || "",
    type: row.type?.trim() || "",
    studentCount: row.studentCount?.trim() || undefined,
    establishedYear: row.establishedYear?.trim() || undefined,
    accreditation: row.accreditation?.trim() || undefined,
    about: row.about?.trim() || undefined,
    campusInfo: row.campusInfo?.trim() || undefined,
    courses: row.courses
      ? row.courses.split(";").map((c) => c.trim()).filter(Boolean)
      : [],
    templateId:
      templateNum && templateNum >= 1 && templateNum <= 5
        ? templateNum
        : undefined,
    links: {
      officialSite: row.officialSite?.trim() || undefined,
      erp: row.erp?.trim() || undefined,
      results: row.results?.trim() || undefined,
      syllabus: row.syllabus?.trim() || undefined,
      admitCard: row.admitCard?.trim() || undefined,
      feePayment: row.feePayment?.trim() || undefined,
      admission: row.admission?.trim() || undefined,
    },
    contact: {
      address: row.contactAddress?.trim() || undefined,
      phone: row.contactPhone?.trim() || undefined,
      email: row.contactEmail?.trim() || undefined,
    },
    seo: {
      title: row.seoTitle?.trim() || undefined,
      metaDescription: row.seoMetaDescription?.trim() || undefined,
      canonicalUrl: row.seoCanonicalUrl?.trim() || undefined,
      ogTitle: row.seoOgTitle?.trim() || undefined,
      ogDescription: row.seoOgDescription?.trim() || undefined,
      ogImage: row.seoOgImage?.trim() || undefined,
    },
    commonIssues: [],
    faqs: [],
    lastVerified: new Date().toISOString().slice(0, 10),
  };
}

// Gated by proxy.ts (matches /api/universities/:path*, admin session required).
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { rows?: CsvRow[] };
  const rows = body.rows ?? [];

  if (rows.length === 0) {
    return NextResponse.json({ error: "No rows provided." }, { status: 400 });
  }

  const results = {
    saved: [] as string[],
    skipped: [] as { row: number; reason: string }[],
  };

  for (let i = 0; i < rows.length; i++) {
    const uni = rowToUniversity(rows[i]);
    if (!uni) {
      results.skipped.push({
        row: i + 1,
        reason: "Missing required slug or name.",
      });
      continue;
    }
    await upsertUniversity(uni);
    results.saved.push(uni.slug);
  }

  return NextResponse.json(results, { status: 201 });
}
