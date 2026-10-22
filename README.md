# UniLinks

Direct, verified links to each university's ERP login, results, syllabus,
admit card, and fee payment portal — one clean page per university, with
enough real content that it doesn't read as a thin doorway page to search
engines.

## Stack

- **Next.js 16** (App Router, TypeScript) — SSG + ISR for every university page
- **Tailwind CSS** — design tokens in `tailwind.config.ts` / `app/globals.css`
- **MongoDB** (optional to start — see below)
- **Fuse.js** — client-side fuzzy search on the homepage
- **Papaparse** — client-side CSV parsing for bulk import

## TypeScript coverage

Every application file is TypeScript (`.ts`/`.tsx`), including `next.config.ts`,
`app/sitemap.ts`, `app/robots.ts`, and the seed script (`scripts/seed.ts`, run
via `tsx`). One file stays plain JS because the tool that loads it doesn't
support `.ts` directly — `postcss.config.mjs` — with a comment explaining
why, and it still gets type-checking in your editor via a JSDoc `@type`
annotation.

Note this pulls in Next.js 16, which changed dynamic route `params` from a
plain object to a `Promise` (must be `await`ed) — already handled in
`app/university/[slug]/page.tsx` and `app/api/universities/[slug]/route.ts`,
just flagging it in case you add more dynamic routes yourself.

## ⚠️ CMS upgrade in progress — read this first

This project is mid-upgrade from a solo link-directory site into a full
multi-admin University CMS.

**Fully working now:**

- **University data runs entirely on Mongoose** — the public pages, admin
  form, CSV import, and search all read/write through `models/University.ts`
  now. The old JSON-file/native-driver storage is gone.
- **NextAuth (Auth.js v5) admin authentication**, replacing the old shared-
  password cookie system — real per-admin accounts, hashed passwords, roles
- **Role-based permission helpers exist** (`SUPER_ADMIN` / `ADMIN` /
  `EDITOR`, `lib/permissions.ts`) **but are not yet called from the
  university or article routes.** The only role check actually enforced
  right now is that `/admin/admins` and `/api/admins` are Super Admin-only
  (`proxy.ts` + a server-side re-check in each route). Every signed-in
  admin, regardless of role, can currently create/edit/delete every
  university and publish any article — wiring in real enforcement is the
  top item in "Next steps" below.
- **Soft delete for universities, with a real restore UI now** — "deleting"
  one sets `isDeleted`/`status: ARCHIVED` instead of removing the record.
  The `/admin/universities` listing has search (by name/slug/state) and a
  status filter (Active / Inactive / Archived) so archived records are
  actually findable, with a one-click **Restore** button next to each.
- **Admin team management** (`/admin/admins`, Super Admin only) — create
  accounts, record which universities each `ADMIN`/`EDITOR` is assigned to
  (not yet enforced — see above), change roles, deactivate or delete
  accounts, reset a forgotten password. Real safeguards, not just UI: can't
  delete your own account, can't demote or delete the last active Super
  Admin (would lock everyone out), and `/admin/admins`/`/api/admins`
  specifically re-check the Super Admin role server-side rather than
  trusting `proxy.ts` alone (`lib/admins.ts`, `app/api/admins/`).
- **Audit logging** now covers admin account changes (`ADMIN_CREATE`,
  `ADMIN_UPDATE`, `ADMIN_DELETE`) in addition to login events — visible on
  the Dashboard's recent-activity feed. Logging for content CRUD
  (universities, articles) is still pending.
- **Articles** — a brand new content type, fully wired end to end:
  `models/Article.ts`, `/articles` (listing) and `/articles/[slug]`
  (detail) public pages, `/admin/articles` (list + create/edit form,
  including which universities an article mentions), `/api/articles`
  routes, and its own `schema.org/Article` structured data + dynamic
  metadata — same pattern as the university pages.
- A critical fix: **Next.js 16 deprecated `middleware.ts`, renaming it to
  `proxy.ts`** — a leftover `middleware.ts` is silently ignored (no error),
  meaning route protection would just stop working. This project now uses
  `proxy.ts`, which also protects `/api/articles` and `/api/admins`
  alongside `/api/universities` (with `/api/admins` and `/api/audit-logs`
  protected on every method, including GET — there's no legitimate public
  read case for admin account data, unlike university/article listings).
- **Broken-link checker** — `lib/linkChecker.ts` does the actual HTTP
  checking (HEAD first, falls back to GET, 8s timeout). Two ways to run
  it: a **"Check links" button per university** in `/admin/universities`
  (scoped to one university, safe inside a serverless function's timeout),
  and `npm run check-links` (`scripts/check-links.ts`) for checking every
  university at once — meant to run on a schedule, not be clicked, since
  checking hundreds of links can take minutes. A ready-made
  `.github/workflows/check-links.yml` runs it daily via GitHub Actions if
  you add `MONGODB_URI` as a repo secret. Results land in each
  university's `linkHealth` field; broken counts show as a badge per row
  and as a Dashboard stat card.
- **Interlinking for SEO** — university pages now show "Similar
  universities" (same state/type, ranked by relevance) and "Articles
  mentioning this university" (the reverse of the existing article →
  university link); both university and article pages have breadcrumb
  navigation with `schema.org/BreadcrumbList` structured data
  (`components/Breadcrumbs.tsx`). This is genuine internal linking, not
  decoration — it's one of the more effective, low-cost SEO levers for a
  content site like this.
- **Search Console + Analytics hooks** — `GOOGLE_SITE_VERIFICATION` (env
  var) renders the Search Console ownership verification meta tag when
  set; `NEXT_PUBLIC_GA_MEASUREMENT_ID` loads GA4 when set. Both render
  nothing at all if left blank — no broken/empty tracking calls on a
  fresh clone. Setting these up on Google's side is a manual step only
  you can do (needs your own Google account and domain) — see "Search
  Console and Analytics setup" below for the exact steps.

**What's built but NOT wired into any page yet:** the Course, Content,
News, Notice, Event, Review, FAQ, Gallery, and Admission Mongoose models
(`/models`) all exist with correct schemas and relationships, but nothing
reads or writes them yet — university pages still show `courses`/`faqs` as
simple embedded lists on the University document itself, not from those
separate collections. Wiring those in (plus the actual CMS dashboard,
tabbed university editor, listing search/filter/pagination, publishing
workflow UI, global content screens, admin management UI, and audit log
viewer) is the next piece of work.

### Setting up the new auth (required before you can log in)

The old `ADMIN_PASSWORD` cookie login is gone. You need a real MongoDB
connection and an actual admin account now:

```bash
# 1. Add to .env.local: MONGODB_URI, NEXTAUTH_SECRET (openssl rand -base64 32), NEXTAUTH_URL
# 2. Create the first Super Admin (interactive, asks for name/email/password):
npm run create-super-admin
# 3. Sign in at /admin/login with those credentials
```

The script refuses to run a second time once a Super Admin exists — manage
additional admins through the admin panel once that's built (next chunk).

## ⚠️ Before you publish anything

The seed data in `data/universities.json` has real university names but
every content field — `about`, `establishedYear`, `accreditation`,
`campusInfo`, `courses`, `contact`, and every deep link (`erp`, `results`,
`syllabus`, `admitCard`, `feePayment`, `admission`) — is set to the literal
string `"PLACEHOLDER_VERIFY"` on purpose. **Do not publish these as real.**
Go to each official university site yourself, confirm the current facts and
URLs, and enter them via `/admin` before that page goes live. Wrong
information is worse than no page at all — it's the exact confusion this
site exists to fix, and it's also what gets a site flagged for low-quality
or inaccurate content.

Every component that renders a placeholder field knows to hide it or show
an explicit "add real content" prompt instead of leaking the raw token —
see `lib/placeholder.ts`.

## Getting started

MongoDB is required now (see the setup steps above) — there's no more
JSON-file fallback.

```bash
npm install
cp .env.example .env.local
# fill in MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL in .env.local
npm run create-super-admin
npm run seed          # optional — pushes data/universities.json in as a starting point
npm run dev
```

Open http://localhost:3000 for the public site, or
http://localhost:3000/admin/login to sign in with the account you just
created.

## Why every university page isn't identical

Two things work together here, both aimed at the same problem: Google's
quality systems (and just good practice) penalize pages that are templated
copies with only the name swapped.

**1. Real content per page.** Beyond the links, each university can carry an
`about` paragraph, courses, campus info, accreditation, contact details, and
FAQs (`lib/types.ts`). This is genuinely unique text you write per
university via `/admin` — nothing here is auto-generated, because
auto-generated "unique" text is exactly the kind of thing search engines
also penalize.

**2. Five structurally different layouts**, not just five color themes:

| # | Name | Structure |
|---|------|-----------|
| 1 | Ledger | Single column, admit-card header, links then prose |
| 2 | Dossier | Sticky sidebar (quick facts + links) beside a prose main column |
| 3 | Magazine | Editorial header, stat row, drop-cap lead paragraph, pill links |
| 4 | Dashboard | Stat cards, link cards grid, two-column about/courses |
| 5 | Compact | Dense single column for users who just want the facts fast |

Set `templateId` (1–5) per university in `/admin`, or leave it unset —
`lib/templatePicker.ts` deterministically hashes the slug to pick one, so
bulk-imported universities still come out visually varied without you
manually assigning a template to each one. In the seed data, three
universities have an explicit `templateId` and three are left to
auto-assign, so you can see both paths working.

Adding a 6th–10th template later means copying one of the
`components/templates/*.tsx` files, rearranging the same shared pieces
(`components/university/*`) differently, and adding it to the `TEMPLATES`
map in `app/university/[slug]/page.tsx` — the shared sub-components mean
this is a layout exercise, not a rewrite.

## SEO: what's actually implemented

- **Dynamic `<title>`/`<meta description>` per page**, built from each
  university's real `about` text (truncated to ~155 chars) when present,
  falling back to a generic template only when it isn't yet filled in
  (`generateMetadata` in `app/university/[slug]/page.tsx`)
- **Canonical URL, Open Graph, and Twitter card tags** per page, using
  `SITE_URL` from your environment
- **JSON-LD structured data** (`components/university/StructuredData.tsx`)
  — a real `schema.org/CollegeOrUniversity` block per page, plus an
  `schema.org/FAQPage` block automatically whenever a university has real
  FAQs. This is what earns rich results in Google, which meta tags alone
  don't do.
- **Dynamic sitemap and robots.txt** (`app/sitemap.ts`, `app/robots.ts`) —
  native Next.js routes, not a build-time file. They query the live
  database (`getAllUniversities`, `getPublishedArticles`) and refresh
  hourly, so a university or article added via `/admin` shows up in
  `/sitemap.xml` on its own — no rebuild/redeploy needed to get it in
  front of Google. `/admin` and `/api` are explicitly disallowed in
  `robots.txt` so crawlers don't waste budget on them or attempt to index
  admin pages.
- **Breadcrumb structured data** (`components/Breadcrumbs.tsx`) —
  `schema.org/BreadcrumbList` on both university and article pages, plus
  the internal links themselves, which is real interlinking, not just
  markup.

None of this compensates for placeholder content — fill in `about` and the
links before expecting any of it to help.

## Search Console and Analytics setup

The code hooks exist (`GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`
in `.env.local`), but creating the actual Search Console/Analytics
properties is an inherently manual step tied to your own Google account —
nothing can automate that part. Once deployed with a real domain:

1. **Search Console**: go to
   [search.google.com/search-console](https://search.google.com/search-console),
   add your domain, choose the "HTML tag" verification method (not DNS —
   simpler here), copy just the `content="..."` value from the tag it
   gives you into `GOOGLE_SITE_VERIFICATION` in your production
   environment variables, redeploy, then click Verify back in Search
   Console.
2. Once verified, submit your sitemap: Search Console → Sitemaps → enter
   `sitemap.xml` → Submit. Since it's dynamic (see above), you only need
   to do this once — it'll keep reflecting new content on its own.
3. **Analytics** (optional): create a GA4 property at
   [analytics.google.com](https://analytics.google.com), copy the
   Measurement ID (starts with `G-`) into `NEXT_PUBLIC_GA_MEASUREMENT_ID`,
   redeploy.
4. Check back in Search Console after a few weeks under Performance →
   Search results, filtered to Queries — that's the real signal for what
   to build/fill in next, not guesswork.

## Deploying

- Push this repo to GitHub, import it into Vercel, add the same environment
  variables from `.env.local` in the Vercel project settings — real
  `MONGODB_URI`, a random `NEXTAUTH_SECRET` (`openssl rand -base64 32`),
  and `NEXTAUTH_URL` set to your production domain.
- Set `SITE_URL` to your real domain too — this feeds the sitemap, canonical
  URLs, and Open Graph tags, so it matters for SEO, not just cosmetics.
- Run `npm run create-super-admin` once against production `MONGODB_URI`
  before you'll be able to log in there.
- For scheduled link checking, add `MONGODB_URI` as a GitHub repository
  secret (Settings → Secrets and variables → Actions) — the workflow at
  `.github/workflows/check-links.yml` needs it to run `npm run check-links`
  daily. Without this secret the workflow will fail; the per-university
  "Check links" button in `/admin/universities` still works fine either way.

## Adding universities

**One at a time**, via the form at `/admin`: fill in basic info, the content
fields (about, courses, campus info, accreditation), links, contact, FAQs,
and optionally a specific template. This is also how you go back and edit
anything a bulk import brought in.

**In bulk**, via CSV: on the same `/admin` page, use "Bulk import from CSV".
Download the sample template first (button on that section) to get the
exact expected column headers — `slug` and `name` are the only required
columns, `courses` uses `;` to separate multiple values within one cell,
and `templateId` is optional (1–5, blank = auto-assigned). The CSV also
includes six SEO columns (`seoTitle`, `seoMetaDescription`,
`seoCanonicalUrl`, `seoOgTitle`, `seoOgDescription`, `seoOgImage`) — all
optional; leave any of them blank and that page falls back to the
auto-generated title/description (see `generateMetadata` in
`app/university/[slug]/page.tsx`). The file is parsed in your browser
(nothing uploads until you click Import), you get a preview of the first 5
rows, and the import reports which rows were saved versus skipped and why.
FAQs and common issues aren't part of the CSV schema — they're free-form
Q&A pairs that don't fit a flat row well, so add those per-university
afterward through the form.

Either way, add 1-2 "common issues" and FAQs once you know what students
actually get stuck on for that university — this is what makes a page more
useful than a plain link list, and harder for a competitor to copy quickly.

## Project structure

```
app/
  page.tsx                          → homepage + search + latest articles
  sitemap.ts / robots.ts            → dynamic, query the live database
  university/[slug]/page.tsx        → picks a template, structured data, interlinking
  articles/                         → public listing + detail pages
  about/ / privacy/                 → static content pages
  admin/
    layout.tsx                      → AdminShell (sidebar + session)
    page.tsx                        → Dashboard (stats, recent activity)
    universities/page.tsx           → CRUD form + CSV import + search/filter + link checker
    articles/page.tsx               → CRUD form
    admins/page.tsx                 → Super Admin only — team management
    login/page.tsx                  → NextAuth credentials sign-in
  api/
    auth/[...nextauth]/             → NextAuth route handler
    universities/                   → CRUD (GET public, writes admin-only)
    universities/[slug]/check-links → scoped link-check (see lib/linkChecker.ts)
    articles/                       → CRUD (GET public/published, writes admin-only)
    admins/                         → Super Admin only, every method protected
models/                             → Mongoose schemas: University, Article, Admin,
                                       Course, Content, News, Notice, Event, Review,
                                       FAQ, Gallery, Admission, AuditLog, shared.ts
                                       (only University/Article/Admin/AuditLog are
                                       actually wired into any page — see above)
lib/
  mongoose.ts                       → cached DB connection (reads MONGODB_URI lazily)
  data.ts / articles.ts / admins.ts → data access layers (plain-object in/out)
  linkChecker.ts                    → the actual HTTP link-checking logic
  audit.ts                          → writes AuditLog entries
  permissions.ts                    → role → default permissions, access checks
  templatePicker.ts                 → deterministic auto-template assignment
  placeholder.ts                    → detects unfilled "PLACEHOLDER_VERIFY" fields
  types.ts                          → plain University/Article/AdminUser shapes
components/
  templates/                        → the 5 university page layouts
  university/                       → About, FAQ, Contact, RelatedUniversities, etc.
  articles/                         → ArticleCard, ArticleBody, structured data
  admin/                            → AdminShell, AdminSidebar, CsvImport, PairListEditor
  SiteNav.tsx / SiteFooter.tsx      → public site chrome (not shown on /admin)
  Breadcrumbs.tsx / Analytics.tsx   → structured data + optional GA4
auth.ts                             → NextAuth (Auth.js v5) config
proxy.ts                            → Next.js 16's middleware.ts replacement
scripts/
  seed.ts                           → pushes data/universities.json into Mongo
  create-super-admin.ts             → interactive, one-time Super Admin setup
  check-links.ts                    → bulk link check, run via cron (see .github/workflows)
data/universities.json              → seed data
public/sample-universities.csv      → CSV bulk-import template
.github/workflows/check-links.yml   → scheduled link checking
```

## Notes on the admin auth

Real per-admin accounts now, via NextAuth (`auth.ts`) — no more shared
password. Credentials are checked against the `Admin` model
(`models/Admin.ts`, bcrypt-hashed) in `auth.ts`'s `authorize()` callback,
sessions are JWT-based, and `proxy.ts` enforces "is this admin logged in" at
the routing layer, plus "does this route require SUPER_ADMIN" for
`/admin/admins` and `/api/admins` specifically. **It does not yet enforce
per-role or per-university permissions on the university/article routes —
`lib/permissions.ts`'s `hasPermission()` and `canAccessUniversity()` exist
but nothing calls them.** Every signed-in admin can currently do everything
to universities and articles. See "Next steps" below — this is the highest
priority item. Create the first account with `npm run create-super-admin`;
from there, manage further admins at `/admin/admins` (Super Admin only)
rather than the CLI script, which deliberately refuses to run a second time.

## Next steps worth considering

- **Enforce role/university permissions** (highest priority) — call
  `hasPermission()` and `canAccessUniversity()` from
  `app/api/universities/*`, `app/api/universities/[slug]/check-links`, and
  `app/api/articles/*` before allowing writes; downgrade an Editor's
  "Published" article status to "Pending review"; filter the admin listing
  to an ADMIN/EDITOR's assigned universities only. Until this exists, only
  create admin accounts for people you'd trust with full content access.
- Add a `state`/`type` filter alongside search on the homepage once you have
  more than ~20 universities.
- The same `lib/data.ts` layer can back a Telegram bot later (e.g. `/aktu`
  command replies with that university's links) without duplicating data.
- Add `og:image` generation per university page (Next's `ImageResponse`) for
  better link previews when pages get shared in WhatsApp/Telegram groups.
- Templates 6–10: duplicate a template file, rearrange the shared
  `components/university/*` pieces differently, register it in the
  `TEMPLATES` map.
