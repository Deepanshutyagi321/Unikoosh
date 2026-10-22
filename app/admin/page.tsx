import Link from "next/link";
import { auth } from "@/auth";
import { getAllUniversitiesAdmin } from "@/lib/data";
import { getAllArticlesAdmin } from "@/lib/articles";
import connectDB from "@/lib/mongoose";
import AuditLog from "@/models/AuditLog";

interface RecentActivity {
  adminEmail: string;
  action: string;
  entityType?: string;
  createdAt: string;
}

async function getRecentActivity(): Promise<RecentActivity[]> {
  await connectDB();
  const logs = await AuditLog.find({})
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
  return logs.map((log) => ({
    adminEmail: log.adminEmail,
    action: log.action,
    entityType: log.entityType,
    createdAt: new Date(log.createdAt as unknown as string).toLocaleString(
      "en-IN",
      { dateStyle: "medium", timeStyle: "short" }
    ),
  }));
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const [universities, articles, activity] = await Promise.all([
    getAllUniversitiesAdmin(),
    getAllArticlesAdmin(),
    getRecentActivity(),
  ]);

  const activeUniversities = universities.filter(
    (u) => u.status === "ACTIVE" && !u.isDeleted
  ).length;
  const publishedArticles = articles.filter(
    (a) => a.status === "PUBLISHED"
  ).length;
  const brokenLinkCount = universities.reduce((total, u) => {
    const entries = Object.values(u.linkHealth ?? {});
    return total + entries.filter((h) => !h.ok).length;
  }, 0);

  const stats = [
    { label: "Total universities", value: universities.length },
    { label: "Active universities", value: activeUniversities },
    { label: "Total articles", value: articles.length },
    { label: "Published articles", value: publishedArticles },
    {
      label: "Broken links",
      value: brokenLinkCount,
      warn: brokenLinkCount > 0,
    },
  ];

  return (
    <main className="max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
      {session?.user && (
        <p className="mt-1 font-body text-sm text-ink-soft">
          Welcome back, {session.user.name}.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`border p-4 ${
              stat.warn ? "border-maroon bg-paper-alt" : "border-border bg-white"
            }`}
          >
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-soft">
              {stat.label}
            </p>
            <p
              className={`mt-1 font-display text-2xl font-bold ${
                stat.warn ? "text-maroon" : "text-navy"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/universities"
          className="focus-ring rounded-sm bg-navy px-4 py-2 font-display text-sm font-medium text-white"
        >
          + Add university
        </Link>
        <Link
          href="/admin/articles"
          className="focus-ring rounded-sm border border-navy px-4 py-2 font-display text-sm font-medium text-navy"
        >
          + New article
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-ink">
          Recent activity
        </h2>
        <div className="mt-3 divide-y divide-border border-y border-border">
          {activity.map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 px-2 py-3 font-mono text-xs"
            >
              <span className="text-ink">
                <span className="text-navy">{entry.adminEmail}</span> ·{" "}
                {entry.action}
                {entry.entityType ? ` · ${entry.entityType}` : ""}
              </span>
              <span className="shrink-0 text-ink-soft">{entry.createdAt}</span>
            </div>
          ))}
          {activity.length === 0 && (
            <p className="px-2 py-6 text-sm text-ink-soft">
              No activity logged yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
