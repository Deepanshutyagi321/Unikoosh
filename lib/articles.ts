import connectDB from "./mongoose";
import ArticleModel, { type IArticle } from "@/models/Article";
import UniversityModel from "@/models/University";
import type { Article } from "./types";
import type { Types } from "mongoose";

interface PopulatedUni {
  _id: Types.ObjectId;
  slug: string;
  name: string;
}

function toArticle(
  doc: IArticle,
  relatedUnis: PopulatedUni[] = []
): Article {
  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    body: doc.body,
    coverImage: doc.coverImage,
    authorName: doc.authorName,
    category: doc.category,
    tags: doc.tags ?? [],
    relatedUniversities: relatedUnis.map((u) => ({
      slug: u.slug,
      name: u.name,
    })),
    status: doc.status,
    publishedAt: doc.publishedAt
      ? new Date(doc.publishedAt).toISOString()
      : undefined,
    seo: doc.seo,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

async function populateRelated(doc: IArticle): Promise<PopulatedUni[]> {
  if (!doc.relatedUniversities?.length) return [];
  return UniversityModel.find(
    { _id: { $in: doc.relatedUniversities } },
    { slug: 1, name: 1 }
  ).lean<PopulatedUni[]>();
}

export async function getPublishedArticles(): Promise<Article[]> {
  await connectDB();
  const docs = await ArticleModel.find({ status: "PUBLISHED" })
    .sort({ publishedAt: -1 })
    .lean<IArticle[]>();
  return Promise.all(
    docs.map(async (doc) => toArticle(doc, await populateRelated(doc)))
  );
}

// For interlinking — shown on a university's own page as "Articles about
// this university", the reverse direction of the relatedUniversities link
// articles already carry.
export async function getArticlesForUniversity(
  universitySlug: string
): Promise<Article[]> {
  await connectDB();
  const uni = await UniversityModel.findOne(
    { slug: universitySlug },
    { _id: 1 }
  ).lean<{ _id: Types.ObjectId } | null>();
  if (!uni) return [];

  const docs = await ArticleModel.find({
    status: "PUBLISHED",
    relatedUniversities: uni._id,
  })
    .sort({ publishedAt: -1 })
    .lean<IArticle[]>();
  return Promise.all(
    docs.map(async (doc) => toArticle(doc, await populateRelated(doc)))
  );
}

export async function getAllArticlesAdmin(): Promise<Article[]> {
  await connectDB();
  const docs = await ArticleModel.find({})
    .sort({ updatedAt: -1 })
    .lean<IArticle[]>();
  return Promise.all(
    docs.map(async (doc) => toArticle(doc, await populateRelated(doc)))
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  await connectDB();
  const doc = await ArticleModel.findOne({ slug }).lean<IArticle | null>();
  if (!doc) return null;
  return toArticle(doc, await populateRelated(doc));
}

export interface UpsertArticleInput {
  slug: string;
  title: string;
  excerpt?: string;
  body: string;
  coverImage?: string;
  authorName: string;
  category?: string;
  tags: string[];
  relatedUniversitySlugs: string[];
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  seo?: { title?: string; metaDescription?: string; ogImage?: string };
  adminId: string;
}

export async function upsertArticle(input: UpsertArticleInput): Promise<Article> {
  await connectDB();

  const relatedUnis = input.relatedUniversitySlugs.length
    ? await UniversityModel.find(
        { slug: { $in: input.relatedUniversitySlugs } },
        { _id: 1 }
      ).lean<{ _id: Types.ObjectId }[]>()
    : [];

  const existing = await ArticleModel.findOne({ slug: input.slug });
  const wasPublished = existing?.status === "PUBLISHED";
  const isNowPublished = input.status === "PUBLISHED";

  const doc = await ArticleModel.findOneAndUpdate(
    { slug: input.slug },
    {
      $set: {
        title: input.title,
        excerpt: input.excerpt,
        body: input.body,
        coverImage: input.coverImage,
        authorName: input.authorName,
        category: input.category,
        tags: input.tags,
        relatedUniversities: relatedUnis.map((u) => u._id),
        status: input.status,
        seo: input.seo,
        updatedBy: input.adminId,
        ...(isNowPublished && !wasPublished ? { publishedAt: new Date() } : {}),
        ...(!existing ? { createdBy: input.adminId } : {}),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean<IArticle>();

  return toArticle(doc, await populateRelated(doc));
}

export async function deleteArticle(slug: string): Promise<void> {
  await connectDB();
  await ArticleModel.deleteOne({ slug });
}
