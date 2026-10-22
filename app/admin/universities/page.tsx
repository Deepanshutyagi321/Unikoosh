"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { University } from "@/lib/types";
import PairListEditor from "@/components/admin/PairListEditor";
import CsvImport from "@/components/admin/CsvImport";

const EMPTY: University = {
  slug: "",
  name: "",
  shortName: "",
  state: "",
  type: "",
  studentCount: "",
  establishedYear: "",
  accreditation: "",
  about: "",
  campusInfo: "",
  courses: [],
  templateId: undefined,
  links: {
    officialSite: "",
    erp: "",
    results: "",
    syllabus: "",
    admitCard: "",
    feePayment: "",
    admission: "",
  },
  contact: { address: "", phone: "", email: "" },
  commonIssues: [],
  faqs: [],
  lastVerified: "",
  seo: {
    title: "",
    metaDescription: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  },
};

function AdminUniversitiesInner() {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const [universities, setUniversities] = useState<University[]>([]);
  const [form, setForm] = useState<University>(EMPTY);
  const [coursesInput, setCoursesInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [listSearch, setListSearch] = useState("");
  const [listStatus, setListStatus] = useState<"all" | "ACTIVE" | "ARCHIVED" | "INACTIVE">("all");
  const [checkingSlug, setCheckingSlug] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/universities");
    const data: University[] = await res.json();
    setUniversities(data);
    return data;
  }

  useEffect(() => {
    load().then((data) => {
      if (editSlug) {
        const match = data.find((u) => u.slug === editSlug);
        if (match) selectForEdit(match);
      }
    });
    // Deliberately empty deps — this should only run once on mount, not
    // re-run (and reset the form) every time editSlug or the list changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectForEdit(uni: University) {
    setForm({
      ...uni,
      contact: uni.contact ?? { address: "", phone: "", email: "" },
      faqs: uni.faqs ?? [],
      commonIssues: uni.commonIssues ?? [],
      courses: uni.courses ?? [],
      seo: uni.seo ?? {
        title: "",
        metaDescription: "",
        canonicalUrl: "",
        ogTitle: "",
        ogDescription: "",
        ogImage: "",
      },
    });
    setCoursesInput((uni.courses ?? []).join(", "));
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(EMPTY);
    setCoursesInput("");
  }

  function updateLink(key: keyof University["links"], value: string) {
    setForm((f) => ({ ...f, links: { ...f.links, [key]: value } }));
  }

  function updateContact(key: "address" | "phone" | "email", value: string) {
    setForm((f) => ({ ...f, contact: { ...f.contact, [key]: value } }));
  }

  function updateSeo(key: keyof NonNullable<University["seo"]>, value: string) {
    setForm((f) => ({ ...f, seo: { ...f.seo, [key]: value } }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload: University = {
      ...form,
      courses: coursesInput
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    };

    const res = await fetch(`/api/universities/${form.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      setMessage(`Saved ${form.shortName || form.slug}.`);
      resetForm();
      load();
    } else {
      setMessage("Save failed — check the console for details.");
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Archive ${slug}? It's removed from the public site but can be restored later.`))
      return;
    await fetch(`/api/universities/${slug}`, { method: "DELETE" });
    load();
  }

  async function handleRestore(uni: University) {
    setSaving(true);
    await fetch(`/api/universities/${uni.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...uni, status: "ACTIVE", isDeleted: false }),
    });
    setSaving(false);
    load();
  }

  async function handleCheckLinks(slug: string) {
    setCheckingSlug(slug);
    try {
      await fetch(`/api/universities/${slug}/check-links`, { method: "POST" });
      await load();
    } finally {
      setCheckingSlug(null);
    }
  }

  const filteredUniversities = universities.filter((uni) => {
    const matchesStatus =
      listStatus === "all"
        ? true
        : listStatus === "ARCHIVED"
          ? uni.isDeleted || uni.status === "ARCHIVED"
          : uni.status === listStatus && !uni.isDeleted;

    const query = listSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      uni.name.toLowerCase().includes(query) ||
      uni.slug.toLowerCase().includes(query) ||
      uni.state.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  return (
    <main className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink">
        Universities
      </h1>

      <form onSubmit={handleSave} className="mt-8 space-y-6 border border-border bg-white p-6">
        <h2 className="font-display font-medium text-ink">
          {form.slug ? `Editing: ${form.slug}` : "Add a university"}
        </h2>

        <FieldGroup title="Basic info">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Slug (url-safe, e.g. aktu)">
              <input
                className="admin-input"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
            </Field>
            <Field label="Short name (e.g. AKTU)">
              <input
                className="admin-input"
                value={form.shortName}
                onChange={(e) => setForm({ ...form, shortName: e.target.value })}
              />
            </Field>
            <Field label="Full name">
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
            <Field label="State">
              <input
                className="admin-input"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </Field>
            <Field label="Type (State Technical / Private / Open…)">
              <input
                className="admin-input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              />
            </Field>
            <Field label="Student count (display text)">
              <input
                className="admin-input"
                value={form.studentCount ?? ""}
                onChange={(e) => setForm({ ...form, studentCount: e.target.value })}
              />
            </Field>
            <Field label="Established year">
              <input
                className="admin-input"
                value={form.establishedYear ?? ""}
                onChange={(e) =>
                  setForm({ ...form, establishedYear: e.target.value })
                }
              />
            </Field>
            <Field label="Accreditation (e.g. UGC, NAAC A++)">
              <input
                className="admin-input"
                value={form.accreditation ?? ""}
                onChange={(e) =>
                  setForm({ ...form, accreditation: e.target.value })
                }
              />
            </Field>
            <Field label="Layout template">
              <select
                className="admin-input"
                value={form.templateId ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    templateId: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              >
                <option value="">Auto (varies by slug)</option>
                <option value="1">1 — Ledger</option>
                <option value="2">2 — Dossier (sidebar)</option>
                <option value="3">3 — Magazine</option>
                <option value="4">4 — Dashboard (cards)</option>
                <option value="5">5 — Compact</option>
              </select>
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="Content (this is what search engines judge — write real, specific text)">
          <Field label="About (150-300 words: history, what it's known for, what's distinct)">
            <textarea
              className="admin-input"
              rows={5}
              value={form.about ?? ""}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
            />
          </Field>
          <Field label="Campus info (one or two lines)">
            <textarea
              className="admin-input"
              rows={2}
              value={form.campusInfo ?? ""}
              onChange={(e) => setForm({ ...form, campusInfo: e.target.value })}
            />
          </Field>
          <Field label="Courses (comma-separated)">
            <input
              className="admin-input"
              value={coursesInput}
              onChange={(e) => setCoursesInput(e.target.value)}
              placeholder="B.Tech Computer Science, B.Tech Mechanical, MBA"
            />
          </Field>
        </FieldGroup>

        <FieldGroup title="Links">
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                ["officialSite", "Official site"],
                ["erp", "ERP / student login"],
                ["results", "Results"],
                ["syllabus", "Syllabus"],
                ["admitCard", "Admit card"],
                ["feePayment", "Fee payment"],
                ["admission", "Admission / counselling"],
              ] as [keyof University["links"], string][]
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  className="admin-input"
                  value={form.links[key] ?? ""}
                  onChange={(e) => updateLink(key, e.target.value)}
                  placeholder="https://…"
                />
              </Field>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup title="Contact">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Address">
              <input
                className="admin-input"
                value={form.contact?.address ?? ""}
                onChange={(e) => updateContact("address", e.target.value)}
              />
            </Field>
            <Field label="Phone">
              <input
                className="admin-input"
                value={form.contact?.phone ?? ""}
                onChange={(e) => updateContact("phone", e.target.value)}
              />
            </Field>
            <Field label="Email">
              <input
                className="admin-input"
                value={form.contact?.email ?? ""}
                onChange={(e) => updateContact("email", e.target.value)}
              />
            </Field>
          </div>
        </FieldGroup>

        <FieldGroup title="SEO (optional — overrides the auto-generated title/description if set)">
          <div className="grid grid-cols-2 gap-4">
            <Field label="SEO title">
              <input
                className="admin-input"
                value={form.seo?.title ?? ""}
                onChange={(e) => updateSeo("title", e.target.value)}
                placeholder={`${form.shortName || "…"} ERP, Results & Syllabus — Direct Links`}
              />
            </Field>
            <Field label="Canonical URL (rarely needed — leave blank unless this content is duplicated elsewhere)">
              <input
                className="admin-input"
                value={form.seo?.canonicalUrl ?? ""}
                onChange={(e) => updateSeo("canonicalUrl", e.target.value)}
                placeholder="https://…"
              />
            </Field>
          </div>
          <Field label="Meta description">
            <textarea
              className="admin-input"
              rows={2}
              value={form.seo?.metaDescription ?? ""}
              onChange={(e) => updateSeo("metaDescription", e.target.value)}
              placeholder="Falls back to the About text if left blank."
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Open Graph title (optional — falls back to SEO title)">
              <input
                className="admin-input"
                value={form.seo?.ogTitle ?? ""}
                onChange={(e) => updateSeo("ogTitle", e.target.value)}
              />
            </Field>
            <Field label="Open Graph image URL">
              <input
                className="admin-input"
                value={form.seo?.ogImage ?? ""}
                onChange={(e) => updateSeo("ogImage", e.target.value)}
                placeholder="https://…"
              />
            </Field>
          </div>
          <Field label="Open Graph description (optional — falls back to meta description)">
            <textarea
              className="admin-input"
              rows={2}
              value={form.seo?.ogDescription ?? ""}
              onChange={(e) => updateSeo("ogDescription", e.target.value)}
            />
          </Field>
        </FieldGroup>

        <FieldGroup title="FAQs (also generates FAQ rich-result markup for Google)">
          <PairListEditor
            items={form.faqs ?? []}
            onChange={(faqs) => setForm({ ...form, faqs })}
            keyA="question"
            keyB="answer"
            labelA="Question"
            labelB="Answer"
            addLabel="Add FAQ"
            emptyItem={{ question: "", answer: "" }}
          />
        </FieldGroup>

        <FieldGroup title="Common issues">
          <PairListEditor
            items={form.commonIssues}
            onChange={(commonIssues) => setForm({ ...form, commonIssues })}
            keyA="title"
            keyB="fix"
            labelA="Issue title"
            labelB="Fix"
            addLabel="Add issue"
            emptyItem={{ title: "", fix: "" }}
          />
        </FieldGroup>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="focus-ring rounded-sm bg-navy px-5 py-2.5 font-display font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save university"}
          </button>
          {form.slug && (
            <button
              type="button"
              onClick={resetForm}
              className="focus-ring ml-3 rounded-sm border border-border px-5 py-2.5 font-display text-ink-soft"
            >
              Cancel edit
            </button>
          )}
          {message && <p className="mt-2 font-mono text-sm text-verified">{message}</p>}
        </div>
      </form>

      <div className="mt-8">
        <CsvImport onImported={load} />
      </div>

      <h2 className="mt-10 font-display text-lg font-bold text-ink">
        Existing ({filteredUniversities.length} of {universities.length})
      </h2>

      <div className="mt-3 flex flex-wrap gap-3">
        <input
          type="text"
          value={listSearch}
          onChange={(e) => setListSearch(e.target.value)}
          placeholder="Search by name, slug, or state…"
          className="admin-input max-w-xs"
        />
        <select
          value={listStatus}
          onChange={(e) => setListStatus(e.target.value as typeof listStatus)}
          className="admin-input w-auto"
        >
          <option value="all">All statuses</option>
          <option value="ACTIVE">Active (live)</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived (deleted)</option>
        </select>
      </div>

      <div className="mt-4 divide-y divide-border border-y border-border">
        {filteredUniversities.map((uni) => {
          const isArchived = uni.isDeleted || uni.status === "ARCHIVED";
          const healthEntries = Object.values(uni.linkHealth ?? {});
          const brokenCount = healthEntries.filter((h) => !h.ok).length;
          const isChecking = checkingSlug === uni.slug;
          return (
            <div key={uni.slug} className="flex items-center justify-between gap-4 px-2 py-3">
              <span>
                <span className="font-display font-medium text-ink">{uni.name}</span>
                <span className="ml-2 font-mono text-xs text-ink-soft">/{uni.slug}</span>
                <span
                  className={`ml-2 rounded-full border px-1.5 py-0.5 font-mono text-[0.65rem] uppercase ${
                    isArchived
                      ? "border-maroon-soft text-maroon-soft"
                      : uni.status === "INACTIVE"
                        ? "border-ink-soft text-ink-soft"
                        : "border-verified text-verified"
                  }`}
                >
                  {isArchived ? "Archived" : uni.status ?? "Active"}
                </span>
                {brokenCount > 0 && (
                  <span className="ml-2 rounded-full border border-maroon px-1.5 py-0.5 font-mono text-[0.65rem] uppercase text-maroon">
                    {brokenCount} broken link{brokenCount === 1 ? "" : "s"}
                  </span>
                )}
                {healthEntries.length === 0 && !isArchived && (
                  <span className="ml-2 font-mono text-[0.65rem] text-ink-soft/60">
                    links not checked yet
                  </span>
                )}
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => handleCheckLinks(uni.slug)}
                  disabled={isChecking}
                  className="focus-ring font-mono text-xs uppercase text-ink-soft hover:text-navy disabled:opacity-50"
                >
                  {isChecking ? "Checking…" : "Check links"}
                </button>
                <button
                  onClick={() => selectForEdit(uni)}
                  className="focus-ring font-mono text-xs uppercase text-navy"
                >
                  Edit
                </button>
                {isArchived ? (
                  <button
                    onClick={() => handleRestore(uni)}
                    disabled={saving}
                    className="focus-ring font-mono text-xs uppercase text-verified disabled:opacity-50"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => handleDelete(uni.slug)}
                    className="focus-ring font-mono text-xs uppercase text-maroon"
                  >
                    Delete
                  </button>
                )}
              </span>
            </div>
          );
        })}
        {filteredUniversities.length === 0 && (
          <p className="px-2 py-6 font-mono text-sm text-ink-soft">
            No universities match this search/filter.
          </p>
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

export default function AdminUniversitiesPage() {
  return (
    <Suspense fallback={null}>
      <AdminUniversitiesInner />
    </Suspense>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <h3 className="font-mono text-xs uppercase tracking-wide text-ink-soft">{title}</h3>
      {children}
    </div>
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
