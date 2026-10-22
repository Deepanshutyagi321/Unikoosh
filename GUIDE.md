# UniLinks — Complete Setup & Operations Guide

A single, start-to-finish walkthrough: get the project running, learn the admin
panel, fill in real content, set up SEO, deploy, and keep it healthy long-term.
The README is the reference; this is the "follow along in order" version.

---

## 0. Read this first (honest caveats)

- **This codebase has never been compiled by the person who wrote it.** It was
  built in an environment where `npm install` was blocked, so everything was
  verified by careful manual review (imports resolve, braces balance, function
  names match) but never by a real `npm run build`. **Your very first step
  should be running `npm run build`** (section 3, step 6). If it reports
  TypeScript errors, that's expected-possible, not a sign something is
  fundamentally broken — send the exact error text and they're usually
  one-line fixes.
- **The seed data is placeholder data.** Real university names, but every
  content field and every deep link says `PLACEHOLDER_VERIFY`. Nothing on the
  site is publishable until you replace it with verified, real information.
- **Some steps are manual by nature** — creating a Google Search Console
  property, adding a GitHub secret, buying a domain. No code can do these for
  you; the guide tells you exactly where.
- **⚠️ Roles and per-university assignments are recorded but NOT yet enforced
  on content.** The `ADMIN` and `EDITOR` roles, and the "assigned universities"
  checkboxes, are stored in the database — but today **any signed-in admin,
  whatever their role, can create, edit and delete any university and
  publish any article.** The permission helpers exist (`lib/permissions.ts`)
  but the university and article routes don't call them yet. The **only**
  boundary actually enforced is that team management (`/admin/admins`) is
  Super Admin-only. **Until this is fixed, don't create ADMIN or EDITOR
  accounts for anyone you wouldn't trust with full control of the site's
  content.** (See section 11.)

---

## 1. What you're running

A Next.js 16 (App Router, TypeScript) website with:

| Layer | What it does |
|---|---|
| **Public site** | Homepage with university search, one page per university (5 different visual templates), articles, About/Privacy pages |
| **Admin panel** (`/admin`) | Dashboard, university management, article management, team/admin management |
| **Database** | MongoDB (via Mongoose) — required, there's no local-file fallback |
| **Auth** | NextAuth (Auth.js v5), real per-admin accounts, three roles: `SUPER_ADMIN`, `ADMIN`, `EDITOR` — but only the Super Admin boundary is enforced today (see section 0) |
| **SEO** | Dynamic sitemap + robots.txt, per-page metadata with admin-editable overrides, structured data, breadcrumbs, internal linking |
| **Link health** | Checker that visits every stored link and flags broken ones |

**The product idea in one line:** one clean page per university with the direct
links students actually need (ERP login, results, syllabus, admit card, fees),
because official university websites are confusing.

---

## 2. Prerequisites

You need:

1. **Node.js 20 or newer** — check with `node --version`
2. **A free MongoDB Atlas account** — [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
3. **A code editor** (VS Code is fine)
4. *Later, for deployment:* a GitHub account and a Vercel account (both free tier)
5. *Later, for SEO:* a domain name and a Google account

---

## 3. First-time setup

### Step 1 — Unzip and install

```bash
unzip uni-links.zip
cd uni-links
npm install
```

### Step 2 — Create your MongoDB database

1. In Atlas, create a free (M0) cluster.
2. **Database Access** → add a database user with a password (save it).
3. **Network Access** → add your IP address. (For local development,
   "Allow access from anywhere" `0.0.0.0/0` is the easy option; tighten it for
   production.)
4. **Connect** → "Drivers" → copy the connection string. It looks like
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true...`
5. Replace `<password>` in that string with your real database user password.
   **If your password contains special characters** (`@`, `:`, `/`, `#`, etc.),
   URL-encode them or the connection will fail.

### Step 3 — Create your environment file

```bash
cp .env.example .env.local
```

**This step matters:** `.env.example` is just a template that nothing reads.
The app only reads `.env.local`. Now open `.env.local` and fill in:

| Variable | What to put | Required? |
|---|---|---|
| `MONGODB_URI` | The connection string from Step 2 | **Yes** |
| `NEXTAUTH_SECRET` | Any long random string. Generate one: `openssl rand -base64 32` | **Yes** |
| `NEXTAUTH_URL` | `http://localhost:3000` locally; your real domain in production | **Yes** |
| `SITE_URL` | Your real public domain (e.g. `https://yourdomain.com`). Feeds the sitemap, canonical URLs, social previews | Yes for production |
| `GOOGLE_SITE_VERIFICATION` | From Search Console (section 6) | Optional |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 ID starting with `G-` (section 6) | Optional |

> **Never commit `.env.local`** — it's already in `.gitignore`, and it contains
> your database password.

### Step 4 — Create your Super Admin account

```bash
npm run create-super-admin
```

It asks for a name, email, and password (min 8 characters, typed hidden). This
becomes your login. **This script deliberately refuses to run a second time**
once a Super Admin exists — additional accounts are created from the admin
panel (section 4.4), not this script.

If you see `MONGODB_URI is not set`, your `.env.local` either doesn't exist
(you only have `.env.example`), is in the wrong folder (must sit next to
`package.json`), or the value is blank.

### Step 5 — (Optional) load the sample universities

```bash
npm run seed
```

Loads six sample universities (AKTU, LPU, IGNOU, VTU, Chandigarh University,
Amity) so the site isn't empty while you're getting oriented. They're
placeholders — see section 5 for replacing them.

### Step 6 — Verify it builds, then run it

```bash
npm run build     # catches compile errors early — see section 0
npm run dev       # starts the dev server
```

Open **http://localhost:3000** (public site) and
**http://localhost:3000/admin/login** (sign in with the account from Step 4).

---

## 4. Tour of the admin panel

After signing in you get a sidebar and a top bar (your email, role, sign-out).

### 4.1 Dashboard (`/admin`)

Stat cards — total/active universities, total/published articles, **broken
links** (turns red when above zero) — plus quick-action buttons and a live
**recent activity** feed from the audit log (logins, admin account changes).

### 4.2 Universities (`/admin/universities`)

This is where most of your work happens.

**The listing** (bottom of the page):
- **Search** by name, slug, or state
- **Status filter**: All / Active (live) / Inactive / Archived (deleted)
- Each row shows a status badge, a **broken-link count** if any, and actions:
  **Check links**, **Edit**, **Delete** (which archives — see below)
- **Archived** universities show a **Restore** button instead of Delete

> **Delete is soft.** It hides the university from the public site but keeps
> the data. Filter by "Archived" and click Restore to bring it back.

**The form** (top of the page) — grouped into sections:
- *Basic info* — slug (the URL part, e.g. `aktu`), names, state, type, student
  count, established year, accreditation, and **layout template** (pick one of
  five, or leave on "Auto" and one is assigned from the slug)
- *Content* — **About** (write 150–300 real words), campus info, courses
- *Links* — official site, ERP login, results, syllabus, admit card, fee
  payment, admission portal
- *Contact* — address, phone, email
- *SEO* — optional overrides for the page title, meta description, canonical
  URL, and Open Graph (social preview) fields. Leave blank and the site
  generates them automatically from your About text.
- *FAQs* and *Common issues* — question/answer pairs. FAQs also generate
  Google FAQ rich-result markup.

**Bulk import from CSV** (below the form):
1. Click **Download sample CSV** and use it as your template.
2. Only `slug` and `name` are required. `courses` uses `;` between values.
   The six `seo*` columns are optional.
3. Choose your file — it's parsed in your browser and you get a preview of the
   first 5 rows. **Nothing uploads until you click Import.**
4. The result tells you which rows saved and which were skipped, and why.
5. FAQs and common issues aren't in the CSV (they don't fit flat rows) — add
   those afterward through the form.

### 4.3 Articles (`/admin/articles`)

Create editorial content: title, slug, excerpt, body (blank line = new
paragraph), author, category, tags, cover image URL, **which universities the
article mentions** (checkboxes — this creates two-way internal links), and
optional SEO overrides.

Each article has a **status**: Draft → Pending review → Published. Only
**Published** articles appear on the public site.

### 4.4 Admins (`/admin/admins`) — Super Admin only

Other roles don't even see this in the sidebar.

- **Create an account**: name, email, password (min 8 chars), role, and which
  universities they're assigned to
- **Roles** (intended behavior): *Editor* (create/edit content, can't
  publish), *Admin* (manage assigned universities and content), *Super Admin*
  (everything). **⚠️ Today only the Super Admin role is actually enforced** —
  Editors and Admins can currently do everything to universities and articles
  that a Super Admin can, except manage the team. Assigned universities are
  saved but don't restrict anything yet.
- **Edit**: change role, change assigned universities, deactivate (blocks
  login without deleting), or **reset their password**. Deactivation *is*
  enforced — a deactivated account can't sign in.
- **Safeguards that protect you from yourself**: you can't delete your own
  account, and you can't demote/deactivate/delete the *last* active Super
  Admin (that would lock everyone out permanently)

### 4.5 The "Soon" items

Courses, News & notices, Reviews, Global content, and Audit logs appear in the
sidebar greyed out. Their **database models exist** but no screens are built
for them yet. See section 11.

---

## 5. Day-to-day content workflow

This is the real work of running the site.

### 5.1 Replace the placeholders (do this before anything else)

For each university, from its official website, find and enter:
1. The **real, current URLs** for ERP login, results, syllabus, admit card,
   fee payment, and admissions. **Open each link yourself** and confirm it
   works — a wrong link is worse than no link, since the whole value of this
   site is "these links are right."
2. A genuinely written **About** paragraph. Don't copy the university's own
   text and don't use identical wording across pages — Google penalizes
   templated near-duplicate pages, which is exactly what a directory of
   similar pages risks looking like.
3. Courses, accreditation, contact details, and a couple of **FAQs** and
   **Common issues** based on what students actually get stuck on.

A page with unfilled fields isn't broken — it shows a clear "add this via
/admin" prompt in place of the missing content — but it's also not ready to
be indexed by Google.

### 5.2 Adding a new university

**One at a time:** `/admin/universities` → fill the form → Save.
**Many at once:** use the CSV import (section 4.2). Good approach: import 30–50
universities with just core links + About first, publish, and *then* deepen
FAQs/courses for whichever ones start getting search impressions.

**After saving,** the public page is live at `/university/<slug>`. It may take
up to an hour to appear in search results within the site itself, since public
pages are cached and refresh hourly (ISR) — see section 9.

### 5.3 Editing a university from the public page

If you're signed in as **Super Admin**, an **"Edit this page"** button appears
on every public university page and jumps straight to that university's edit
form.

### 5.4 Writing articles that earn traffic

Articles are your route to broader search queries ("how to check AKTU result",
"JEE preparation books") that a link-directory page can't rank for on its own.
Tick the universities each article mentions — this automatically adds "Mentioned
in this article" links on the article and "Articles mentioning this university"
on each university's page. That two-way linking is real internal SEO, not
decoration.

---

## 6. SEO and analytics setup

The code is ready; the accounts have to be created by you.

### 6.1 What's already built (no action needed)

- **Dynamic sitemap** at `/sitemap.xml` — regenerates hourly from the live
  database, so new universities and published articles appear automatically
  with no redeploy
- **robots.txt** at `/robots.txt` — blocks crawlers from `/admin` and `/api`,
  points to the sitemap
- **Per-page metadata** — title, description, canonical URL, Open Graph and
  Twitter tags, all overridable per page from the admin
- **Structured data (JSON-LD)** — `CollegeOrUniversity`, `FAQPage`,
  `Article`, and `BreadcrumbList`
- **Internal linking** — similar universities, articles ↔ universities,
  breadcrumbs, site-wide nav and footer

### 6.2 Google Search Console (do this once you have a live domain)

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
   and add your property.
2. Choose the **HTML tag** verification method. It gives you a tag like
   `<meta name="google-site-verification" content="abc123..." />`.
3. Copy **only the `content` value** (`abc123...`) into
   `GOOGLE_SITE_VERIFICATION` in your production environment variables.
4. Redeploy, then click **Verify** in Search Console.
5. Once verified: **Sitemaps** → enter `sitemap.xml` → Submit. Since it's
   dynamic, you only ever do this once.

### 6.3 Google Analytics 4 (optional)

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com).
2. Copy the Measurement ID (starts with `G-`).
3. Put it in `NEXT_PUBLIC_GA_MEASUREMENT_ID`, redeploy.

Leave both blank and nothing loads — no broken tracking calls.

> If you add analytics or ads, your **Privacy page** already mentions
> third-party cookies conditionally, but review it (and fill in its "last
> updated" date and contact email) before launch. It currently has
> placeholder text for both.

### 6.4 Reading the results

After a few weeks, in Search Console → **Performance → Search results →
Queries**. Queries with many impressions but few clicks are a literal to-do
list: pages worth improving. This is the real signal for what to work on
next — much better than guessing.

---

## 7. Link health monitoring

Your whole value proposition is "these links work," so this matters.

### 7.1 Check one university (instant)

`/admin/universities` → **Check links** on that row. Visits each populated
link and records the result. Broken ones show as a red badge on the row and
count toward the Dashboard's **Broken links** card.

### 7.2 Check everything (scheduled)

```bash
npm run check-links
```

Checks every non-archived university, 5 at a time, printing each broken link.
It's meant for scheduling rather than clicking, since hundreds of links can
take minutes.

### 7.3 Automate it daily with GitHub Actions

A workflow is included at `.github/workflows/check-links.yml` (runs daily,
03:00 UTC). To enable it:

1. Push the project to a GitHub repository.
2. Repo → **Settings → Secrets and variables → Actions → New repository
   secret**.
3. Name: `MONGODB_URI`. Value: your connection string.
4. It runs on schedule, or manually from the **Actions** tab.

Without that secret the workflow fails — harmlessly, but uselessly.

### 7.4 How to read results

- **"links not checked yet"** — nobody has run a check on that university.
- **Links set to `PLACEHOLDER_VERIFY`** are reported as "not set", not
  "broken" — they were never real URLs.
- **A link flagged broken isn't always dead.** Some university servers block
  automated requests, are slow, or time out (8-second limit) while working
  fine in a browser. Open flagged links manually before "fixing" them.

---

## 8. Deploying to production (Vercel)

1. Push the project to GitHub (`.env.local` is gitignored — good).
2. In Vercel: **Add New → Project → import the repo**.
3. **Environment Variables** — add every variable from your `.env.local`, but
   with production values:
   - `MONGODB_URI` — same cluster is fine (or a separate production one)
   - `NEXTAUTH_SECRET` — a *new* random value, don't reuse your dev one
   - `NEXTAUTH_URL` — your real domain, e.g. `https://yourdomain.com`
   - `SITE_URL` — same real domain
   - `GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` if using
4. **In MongoDB Atlas → Network Access**, allow Vercel to connect. Vercel uses
   dynamic IPs, so the simplest option is `0.0.0.0/0` (rely on your strong
   database password), or use Atlas's Vercel integration.
5. Deploy.
6. **Create your production Super Admin.** The database is the same one you
   used locally if you reused the connection string — in which case your
   account already exists. If you used a separate production database, run
   `npm run create-super-admin` locally with `MONGODB_URI` in `.env.local`
   temporarily pointed at the production database.
7. Add your custom domain in Vercel and update `NEXTAUTH_URL` and `SITE_URL`
   to match, then redeploy.
8. Complete section 6 (Search Console) now that there's a live domain.

---

## 9. Ongoing maintenance

### 9.1 How caching works (so nothing surprises you)

Public pages are **cached and refresh hourly** (ISR). If you edit a university
and don't see it immediately on the public site, that's why — wait up to an
hour, or trigger a redeploy for instant refresh. The **admin panel is never
cached**; it always shows live data.

### 9.2 Suggested routine

| When | Do this |
|---|---|
| **Weekly** | Check the Dashboard's Broken links card; open flagged links manually, fix real ones. Check for new university notices/results seasons. |
| **During exam & result seasons** | Highest-traffic period — verify the results, admit card, and ERP links for your top universities specifically. |
| **Monthly** | Search Console → Performance → Queries: which searches are you appearing for? Add articles or deepen university pages accordingly. Publish 2–4 new articles. |
| **Quarterly** | Re-verify links and About text for your top universities; add new universities; review the audit log/admin list for stale accounts. |

### 9.3 Onboarding help

Use `/admin/admins` to create accounts for people helping with content.
**But read section 0 first:** roles and university assignments are not
enforced yet, so *any* account you create can currently edit or delete every
university and publish any article. Only create accounts for people you'd
trust with full content access, and prefer to wait for the permission
enforcement fix (section 11) before onboarding anyone you don't know well.
Once enforced, the intent is: `Editor` for people who draft, `Admin` for
people who publish, each assigned only the universities they should touch.

### 9.4 Backups

Atlas's free tier has limited backup options. Before you have hard-to-recreate
content, consider periodically exporting your collections (Atlas → Collections
→ Export, or `mongodump`) and keeping the files somewhere safe.

---

## 10. Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| `npm run build` shows TypeScript errors | Expected-possible on first run (section 0). Copy the exact error text; these are usually small fixes. |
| `MONGODB_URI is not set` from a script | `.env.local` missing, in the wrong folder, or value blank. Must be next to `package.json`. |
| Can't log in at `/admin/login` | You haven't run `npm run create-super-admin` yet, or you're using a different email/password than you set. There's no default login. |
| `create-super-admin` says a Super Admin already exists | Correct behavior — it only runs once. Use your existing credentials. Forgot them? There's no reset-password flow for the *only* Super Admin; you'd need to update the database directly. (Any *other* admin can have their password reset by a Super Admin.) |
| Login page loops / redirects oddly | `NEXTAUTH_URL` doesn't match the address you're visiting, or `NEXTAUTH_SECRET` is empty. |
| MongoDB connection errors | Your IP isn't allowed in Atlas Network Access, or your password has unencoded special characters. |
| University page shows "No courses listed yet" etc. | Expected — that's the prompt for fields not filled in yet, not a bug. |
| Edited a university but the public page looks old | Hourly caching (section 9.1). |
| New university missing from search on the homepage | Same caching, *or* its status isn't Active (check the admin filter). |
| "Edit this page" button not showing | You must be signed in as **Super Admin** specifically, not just any admin. |
| Sitemap shows `example.com` URLs | `SITE_URL` isn't set to your real domain in production. |
| GitHub Action for link checking fails | `MONGODB_URI` secret missing (section 7.3). |
| A link is flagged broken but works in your browser | Some servers block automated requests or are slow — verify manually (section 7.4). |

---

## 11. What's not built yet

Being direct about the gaps:

- **⚠️ Permission enforcement on content routes — the most important gap.**
  Roles (`ADMIN`, `EDITOR`) and per-university assignments are stored but not
  checked. `canAccessUniversity()` and `hasPermission()` exist in
  `lib/permissions.ts` and are never called. What needs to happen: the
  university routes (`/api/universities`, `.../[slug]`, `.../bulk`,
  `.../check-links`) must check the relevant permission *and* that the admin
  is assigned to that university; the article routes must check content
  permissions and downgrade an Editor's "Published" to "Pending review"
  (the intended workflow); and the admin listing should show non-Super-Admins
  only their assigned universities. Until this is done, treat every non-Super
  Admin account as having full content access.

- **Courses, News/Notices/Events, Reviews, Global content, Gallery, Admissions
  as separate managed content** — the database models exist, no screens or
  public pages use them yet. University pages currently hold `courses` and
  `faqs` as simple lists on the university itself.
- **Audit log viewer** — events are recorded (logins, admin changes) and the
  Dashboard shows the recent ones, but there's no full searchable log page.
  Content edits (universities, articles) aren't logged yet.
- **Publishing workflow beyond Articles** — Draft → Review → Published exists
  on articles only.
- **Affiliate marketing infrastructure** — no product-card blocks inside
  articles, no click tracking. If you add affiliate links, you **must** add a
  visible disclosure ("this article contains affiliate links") first.
- **Ads** — no AdSense integration.
- **Image uploads** — cover/OG image fields expect an already-hosted URL;
  there's no upload/CDN pipeline.
- **Cookie consent banner and Terms of Service page** — your Privacy page
  mentions cookies, so a consent banner becomes a real compliance need once
  analytics or ads are live.
- **Rate limiting on login** and **error monitoring** (e.g. Sentry).
- **Password reset for the sole Super Admin.**

**Recommended next steps, in order:** (0) fix permission enforcement
*before* giving anyone else an account, (1) fill in real content for 15–20
universities, (2) deploy, (3) Search Console, (4) affiliate + disclosure
infrastructure once you're ready to write monetized articles, (5) cookie
consent + Terms before turning on ads.

---

## 12. Quick reference

### Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at localhost:3000 |
| `npm run build` | Production build (run this first to catch errors) |
| `npm run start` | Run the production build |
| `npm run create-super-admin` | One-time first-admin setup |
| `npm run seed` | Load sample universities |
| `npm run check-links` | Check every university's links |

### Key URLs

| URL | What |
|---|---|
| `/` | Homepage + search |
| `/university/<slug>` | A university page |
| `/articles`, `/articles/<slug>` | Article listing / detail |
| `/about`, `/privacy` | Static pages |
| `/sitemap.xml`, `/robots.txt` | Generated dynamically |
| `/admin` | Dashboard |
| `/admin/universities` | Universities, CSV import, link checks |
| `/admin/articles` | Articles |
| `/admin/admins` | Team management (Super Admin only) |
| `/admin/login` | Sign in |

### The five university page templates

| # | Name | Layout |
|---|---|---|
| 1 | Ledger | Single column, admit-card style header |
| 2 | Dossier | Sticky sidebar + main column |
| 3 | Magazine | Editorial header, drop-cap intro |
| 4 | Dashboard | Stat cards + link cards grid |
| 5 | Compact | Dense, minimal, facts-first |

Leave a university's template on **Auto** and one is chosen from its slug, so
pages don't all look identical.

### Roles at a glance

**Intended behavior — not yet enforced (see section 0).** Today, only the
Super Admin-only areas (`/admin/admins`, `/api/admins`) are actually
restricted, and deactivated accounts can't sign in.

| Role | Intended to be able to do |
|---|---|
| `SUPER_ADMIN` | Everything, including team management |
| `ADMIN` | Manage assigned universities and content, publish |
| `EDITOR` | Create/edit content, can't publish or manage people |
