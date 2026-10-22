import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getArticleBySlug, upsertArticle, deleteArticle } from "@/lib/articles";

type RouteParams = Promise<{ slug: string }>;

export async function GET(
  _req: NextRequest,
  { params }: { params: RouteParams }
) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (article.status !== "PUBLISHED") {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  return NextResponse.json(article);
}

// Gated by proxy.ts (requires a valid admin session).
export async function PUT(
  req: NextRequest,
  { params }: { params: RouteParams }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await req.json();

  const article = await upsertArticle({
    slug,
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

  return NextResponse.json(article);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: RouteParams }
) {
  const { slug } = await params;
  await deleteArticle(slug);
  return NextResponse.json({ ok: true });
}
