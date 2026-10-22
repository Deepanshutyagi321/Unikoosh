"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { AdminUser } from "@/lib/types";

interface UniOption {
  slug: string;
  name: string;
}

const EMPTY = {
  id: "",
  name: "",
  email: "",
  password: "",
  role: "EDITOR" as "SUPER_ADMIN" | "ADMIN" | "EDITOR",
  assignedUniversitySlugs: [] as string[],
  isActive: true,
  newPassword: "",
};

export default function AdminAdminsPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [universities, setUniversities] = useState<UniOption[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [adminsRes, unisRes] = await Promise.all([
      fetch("/api/admins"),
      fetch("/api/universities"),
    ]);
    if (adminsRes.ok) setAdmins(await adminsRes.json());
    if (unisRes.ok) setUniversities(await unisRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  function selectForEdit(admin: AdminUser) {
    setForm({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role,
      assignedUniversitySlugs: admin.assignedUniversities.map((u) => u.slug),
      isActive: admin.isActive,
      newPassword: "",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleUniversity(slug: string) {
    setForm((f) => ({
      ...f,
      assignedUniversitySlugs: f.assignedUniversitySlugs.includes(slug)
        ? f.assignedUniversitySlugs.filter((s) => s !== slug)
        : [...f.assignedUniversitySlugs, slug],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const isEditing = Boolean(form.id);

    const res = await fetch(isEditing ? `/api/admins/${form.id}` : "/api/admins", {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isEditing
          ? {
              role: form.role,
              assignedUniversitySlugs: form.assignedUniversitySlugs,
              isActive: form.isActive,
              newPassword: form.newPassword || undefined,
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              role: form.role,
              assignedUniversitySlugs: form.assignedUniversitySlugs,
            }
      ),
    });

    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      setMessage(isEditing ? `Saved ${form.email}.` : `Created ${data.email}.`);
      setForm(EMPTY);
      load();
    } else {
      setError(data.error ?? "Save failed.");
    }
  }

  async function handleDelete(admin: AdminUser) {
    if (!confirm(`Delete ${admin.email}? This can't be undone.`)) return;
    const res = await fetch(`/api/admins/${admin.id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      load();
    } else {
      alert(data.error ?? "Delete failed.");
    }
  }

  return (
    <main className="max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink">
        Admin — team accounts
      </h1>
      <p className="mt-1 font-mono text-xs text-ink-soft">
        Super Admin only. Create accounts and record their role and
        university assignments — these aren't enforced as restrictions yet,
        so anyone you add here can currently edit all content regardless of
        role.
      </p>

      <form onSubmit={handleSave} className="mt-8 space-y-5 border border-border bg-white p-6">
        <h2 className="font-display font-medium text-ink">
          {form.id ? `Editing: ${form.email}` : "New admin account"}
        </h2>

        {!form.id && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <input
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className="admin-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Field>
          </div>
        )}

        {!form.id && (
          <Field label="Password (min 8 characters)">
            <input
              type="password"
              className="admin-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={8}
            />
          </Field>
        )}

        {form.id && (
          <Field label="Reset password (leave blank to keep current password)">
            <input
              type="password"
              className="admin-input"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              minLength={8}
              placeholder="Leave blank to not change it"
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Role">
            <select
              className="admin-input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as typeof form.role })}
            >
              <option value="EDITOR">Editor — create/edit content, no publish</option>
              <option value="ADMIN">Admin — intended for assigned universities + content (not yet restricted)</option>
              <option value="SUPER_ADMIN">Super Admin — full access</option>
            </select>
          </Field>
          {form.id && (
            <Field label="Status">
              <select
                className="admin-input"
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
              >
                <option value="active">Active</option>
                <option value="inactive">Deactivated (blocked from logging in)</option>
              </select>
            </Field>
          )}
        </div>

        <div>
          <span className="mb-2 block font-mono text-xs uppercase tracking-wide text-ink-soft">
            Assigned universities (ignored for Super Admin — they can access all)
          </span>
          <div className="max-h-48 space-y-1 overflow-y-auto border border-border bg-paper-alt p-3">
            {universities.map((uni) => (
              <label key={uni.slug} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.assignedUniversitySlugs.includes(uni.slug)}
                  onChange={() => toggleUniversity(uni.slug)}
                  disabled={form.role === "SUPER_ADMIN"}
                />
                {uni.name}
              </label>
            ))}
            {universities.length === 0 && (
              <p className="font-mono text-xs text-ink-soft">No universities yet.</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="focus-ring rounded-sm bg-navy px-5 py-2.5 font-display font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : form.id ? "Save changes" : "Create account"}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(EMPTY)}
              className="focus-ring ml-3 rounded-sm border border-border px-5 py-2.5 font-display text-ink-soft"
            >
              Cancel edit
            </button>
          )}
          {message && <p className="mt-2 font-mono text-sm text-verified">{message}</p>}
          {error && <p className="mt-2 font-mono text-sm text-maroon">{error}</p>}
        </div>
      </form>

      <h2 className="mt-10 font-display text-lg font-bold text-ink">
        Team ({admins.length})
      </h2>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {admins.map((admin) => (
          <div key={admin.id} className="flex items-center justify-between gap-4 px-2 py-3">
            <span>
              <span className="font-display font-medium text-ink">{admin.name}</span>
              <span className="ml-2 font-mono text-xs text-ink-soft">
                {admin.email} · {admin.role}
                {!admin.isActive && " · deactivated"}
              </span>
              {admin.assignedUniversities.length > 0 && (
                <span className="mt-0.5 block font-mono text-xs text-ink-soft">
                  {admin.assignedUniversities.map((u) => u.name).join(", ")}
                </span>
              )}
            </span>
            <span className="flex shrink-0 gap-3">
              <button
                onClick={() => selectForEdit(admin)}
                className="focus-ring font-mono text-xs uppercase text-navy"
              >
                Edit
              </button>
              {admin.id !== session?.user?.id && (
                <button
                  onClick={() => handleDelete(admin)}
                  className="focus-ring font-mono text-xs uppercase text-maroon"
                >
                  Delete
                </button>
              )}
            </span>
          </div>
        ))}
        {admins.length === 0 && (
          <p className="px-2 py-6 font-mono text-sm text-ink-soft">Loading…</p>
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
