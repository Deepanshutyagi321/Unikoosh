import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getPublishedArticles,
  getAllArticlesAdmin,
  upsertArticle,
} from "@/lib/articles";

export async function GET() {
  const session = await auth();
  const articles = session?.user
    ? await getAllArticlesAdmin()
    : await getPublishedArticles();
  return NextResponse.json(articles);
}

// Gated by proxy.ts (requires a valid admin session).
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.slug || !body.title || !body.body) {
    return NextResponse.json(
      { error: "slug, title, and body are required." },
      { status: 400 }
    );
  }

  const article = await upsertArticle({
    slug: body.slug,
    title: body.title,
    excerpt: body.excerpt,
    body: body.body,
    coverImage: body.coverImage,
    authorName: body.authorName || session.user.name,
    category: body.category,
    tags: body.tags ?? [],
    relatedUniversitySlugs: body.relatedUniversitySlugs ?? [],
    status: body.status ?? "DRAFT",
    seo: body.seo,
    adminId: session.user.id,
  });

  return NextResponse.json(article, { status: 201 });
}
