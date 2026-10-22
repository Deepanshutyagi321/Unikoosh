"use client";

import { useEffect, useState } from "react";
import type { Article } from "@/lib/types";

interface UniOption {
  slug: string;
  name: string;
}

const EMPTY = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  coverImage: "",
  authorName: "",
  category: "",
  tagsInput: "",
  relatedUniversitySlugs: [] as string[],
  status: "DRAFT" as "DRAFT" | "PENDING_REVIEW" | "PUBLISHED",
  seoTitle: "",
  seoDescription: "",
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [universities, setUniversities] = useState<UniOption[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const [articlesRes, unisRes] = await Promise.all([
      fetch("/api/articles"),
      fetch("/api/universities"),
    ]);
    setArticles(await articlesRes.json());
    setUniversities(await unisRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  function selectForEdit(article: Article) {
    setForm({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt ?? "",
      body: article.body,
      coverImage: article.coverImage ?? "",
      authorName: article.authorName,
      category: article.category ?? "",
      tagsInput: article.tags.join(", "),
      relatedUniversitySlugs: article.relatedUniversities.map((u) => u.slug),
      status: article.status,
      seoTitle: article.seo?.title ?? "",
      seoDescription: article.seo?.metaDescription ?? "",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleUniversity(slug: string) {
    setForm((f) => ({
      ...f,
      relatedUniversitySlugs: f.relatedUniversitySlugs.includes(slug)
        ? f.relatedUniversitySlugs.filter((s) => s !== slug)
        : [...f.relatedUniversitySlugs, slug],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      title: form.title,
      excerpt: form.excerpt,
      body: form.body,
      coverImage: form.coverImage,
      authorName: form.authorName,
      category: form.category,
      tags: form.tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      relatedUniversitySlugs: form.relatedUniversitySlugs,
      status: form.status,
      seo: { title: form.seoTitle, metaDescription: form.seoDescription },
    };

    // PUT upserts — it creates the article if this slug doesn't exist yet,
    // so there's no separate POST-fallback path needed here.
    const res = await fetch(`/api/articles/${form.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      setMessage(`Saved "${form.title}".`);
      setForm(EMPTY);
      load();
    } else {
      setMessage("Save failed — check the console for details.");
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete this article? This can't be undone.`)) return;
    await fetch(`/api/articles/${slug}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink">Articles</h1>

      <form onSubmit={handleSave} className="mt-8 space-y-5 border border-border bg-white p-6">
        <h2 className="font-display font-medium text-ink">
          {form.slug ? `Editing: ${form.slug}` : "New article"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Slug (url-safe, set once)">
            <input
              className="admin-input"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </Field>
          <Field label="Status">
            <select
              className="admin-input"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as typeof form.status })
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="PENDING_REVIEW">Pending review</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </Field>
        </div>

        <Field label="Title">
          <input
            className="admin-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </Field>

        <Field label="Excerpt (shown on the listing page + as meta description fallback)">
          <textarea
            className="admin-input"
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
        </Field>

        <Field label="Body (blank line = new paragraph)">
          <textarea
            className="admin-input"
            rows={12}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Author name">
            <input
              className="admin-input"
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
              required
            />
          </Field>
          <Field label="Category">
            <input
              className="admin-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Admissions, Exams, Guides…"
            />
          </Field>
        </div>

        <Field label="Cover image URL">
          <input
            className="admin-input"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            placeholder="https://…"
          />
        </Field>

        <Field label="Tags (comma-separated)">
          <input
            className="admin-input"
            value={form.tagsInput}
            onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
          />
        </Field>

        <div>
          <span className="mb-2 block font-mono text-xs uppercase tracking-wide text-ink-soft">
            Related universities (linked at the bottom of the article)
          </span>
          <div className="max-h-48 space-y-1 overflow-y-auto border border-border bg-paper-alt p-3">
            {universities.map((uni) => (
              <label key={uni.slug} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.relatedUniversitySlugs.includes(uni.slug)}
                  onChange={() => toggleUniversity(uni.slug)}
                />
                {uni.name}
              </label>
            ))}
            {universities.length === 0 && (
              <p className="font-mono text-xs text-ink-soft">
                No universities yet.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="SEO title (optional override)">
            <input
              className="admin-input"
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
            />
          </Field>
          <Field label="SEO meta description (optional override)">
            <input
              className="admin-input"
              value={form.seoDescription}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
            />
          </Field>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="focus-ring rounded-sm bg-navy px-5 py-2.5 font-display font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save article"}
          </button>
          {form.slug && (
            <button
              type="button"
              onClick={() => setForm(EMPTY)}
              className="focus-ring ml-3 rounded-sm border border-border px-5 py-2.5 font-display text-ink-soft"
            >
              Cancel edit
            </button>
          )}
          {message && <p className="mt-2 font-mono text-sm text-verified">{message}</p>}
        </div>
      </form>

      <h2 className="mt-10 font-display text-lg font-bold text-ink">
        Existing ({articles.length})
      </h2>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {articles.map((article) => (
          <div key={article.slug} className="flex items-center justify-between gap-4 px-2 py-3">
            <span>
              <span className="font-display font-medium text-ink">{article.title}</span>
              <span className="ml-2 font-mono text-xs text-ink-soft">
                /{article.slug} · {article.status}
              </span>
            </span>
            <span className="flex gap-3">
              <button
                onClick={() => selectForEdit(article)}
                className="focus-ring font-mono text-xs uppercase text-navy"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(article.slug)}
                className="focus-ring font-mono text-xs uppercase text-maroon"
              >
                Delete
              </button>
            </span>
          </div>
        ))}
        {articles.length === 0 && (
          <p className="px-2 py-6 font-mono text-sm text-ink-soft">No articles yet.</p>
        )}
      </div>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          border: 1px solid #d9d2c2;
          background: white;
          padding: 0.5rem 0.75rem;
          font-family: var(--font-body);
          border-radius: 2px;
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-xs uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      {children}
    </label>
  );
}
