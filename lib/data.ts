import connectDB from "./mongoose";
import UniversityModel, { type IUniversity } from "@/models/University";
import type { University } from "./types";

// Converts a Mongoose lean() document into exactly the plain University
// shape the rest of the app (templates, admin form, API routes) already
// expects — CMS-only fields like _id/__v stay out of the returned type
// except status/isDeleted, which callers that care about visibility use.
function normalizeLinkHealth(
  raw: IUniversity["linkHealth"]
): University["linkHealth"] {
  if (!raw) return undefined;
  const result: NonNullable<University["linkHealth"]> = {};
  for (const [key, entry] of Object.entries(raw)) {
    if (!entry) continue;
    result[key as keyof University["links"]] = {
      ok: entry.ok,
      statusCode: entry.statusCode,
      error: entry.error,
      checkedAt: new Date(entry.checkedAt).toISOString(),
    };
  }
  return result;
}

function toUniversity(doc: IUniversity): University {
  return {
    slug: doc.slug,
    name: doc.name,
    shortName: doc.shortName,
    state: doc.state,
    type: doc.type,
    studentCount: doc.studentCount,
    establishedYear: doc.establishedYear,
    accreditation: doc.accreditation,
    about: doc.about,
    campusInfo: doc.campusInfo,
    courses: doc.courses ?? [],
    commonIssues: doc.commonIssues ?? [],
    faqs: doc.faqs ?? [],
    templateId: doc.templateId,
    links: doc.links ?? {},
    contact: doc.contact,
    lastVerified: doc.lastVerified
      ? new Date(doc.lastVerified).toISOString().slice(0, 10)
      : "",
    status: doc.status,
    isDeleted: doc.isDeleted,
    seo: doc.seo,
    linkHealth: normalizeLinkHealth(doc.linkHealth),
  };
}

export async function getAllUniversities(): Promise<University[]> {
  await connectDB();
  const docs = await UniversityModel.find({
    isDeleted: false,
    status: "ACTIVE",
  })
    .sort({ name: 1 })
    .lean<IUniversity[]>();
  return docs.map(toUniversity);
}

// Same as above but with no status/isDeleted filter — for the admin
// listing, so soft-deleted/inactive universities are still reachable and
// manageable rather than silently disappearing once archived.
export async function getAllUniversitiesAdmin(): Promise<University[]> {
  await connectDB();
  const docs = await UniversityModel.find({})
    .sort({ updatedAt: -1 })
    .lean<IUniversity[]>();
  return docs.map(toUniversity);
}

// For interlinking on a university's own page — other active universities
// sharing the same state or type, ranked so same-state matches (more
// useful to a student comparing local options) come first. Excludes the
// current university itself.
export async function getRelatedUniversities(
  currentSlug: string,
  state: string,
  type: string,
  limit = 5
): Promise<University[]> {
  await connectDB();
  const docs = await UniversityModel.find({
    slug: { $ne: currentSlug },
    isDeleted: false,
    status: "ACTIVE",
    $or: [{ state }, { type }],
  })
    .limit(limit * 3) // over-fetch, then rank in JS below
    .lean<IUniversity[]>();

  const ranked = docs
    .map(toUniversity)
    .sort((a, b) => {
      const aScore = (a.state === state ? 2 : 0) + (a.type === type ? 1 : 0);
      const bScore = (b.state === state ? 2 : 0) + (b.type === type ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, limit);

  return ranked;
}

// No status/isDeleted filter here on purpose — this also backs the admin
// edit flow, which needs to reach inactive/archived records too. Public
// pages that call this should check status themselves (see
// app/university/[slug]/page.tsx) rather than this function silently
// hiding records the admin form needs to reach.
export async function getUniversityBySlug(
  slug: string
): Promise<University | null> {
  await connectDB();
  const doc = await UniversityModel.findOne({ slug }).lean<IUniversity | null>();
  return doc ? toUniversity(doc) : null;
}

export async function upsertUniversity(
  uni: University
): Promise<University> {
  await connectDB();
  const doc = await UniversityModel.findOneAndUpdate(
    { slug: uni.slug },
    { $set: uni },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean<IUniversity>();
  return toUniversity(doc);
}

// Soft delete — matches the CMS spec's "do not immediately permanently
// delete important records" requirement. A Super Admin can restore these
// later (restore UI is part of the admin panel work, not yet built).
export async function deleteUniversity(slug: string): Promise<void> {
  await connectDB();
  await UniversityModel.findOneAndUpdate(
    { slug },
    { $set: { isDeleted: true, deletedAt: new Date(), status: "ARCHIVED" } }
  );
}

// Written only by the link checker (lib/linkChecker.ts callers) — merges
// new results into whatever linkHealth already exists rather than
// replacing it, so checking one university doesn't need to know about
// every other university's results.
export async function updateLinkHealth(
  slug: string,
  results: Record<string, { ok: boolean; statusCode?: number; error?: string; checkedAt: string }>
): Promise<void> {
  await connectDB();
  const set: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(results)) {
    set[`linkHealth.${key}`] = value;
  }
  await UniversityModel.findOneAndUpdate({ slug }, { $set: set });
}
