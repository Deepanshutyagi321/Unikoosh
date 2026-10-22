export interface UniversityLink {
  label: string;
  url: string;
}

export interface CommonIssue {
  title: string;
  fix: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
}

export interface University {
  slug: string;
  name: string;
  shortName: string;
  state: string;
  type: string; // e.g. "State Technical", "Private", "Central", "Open/Distance"
  studentCount?: string; // display string, e.g. "400,000+"
  establishedYear?: string;
  accreditation?: string; // e.g. "UGC, AICTE, NAAC A++"

  // Real, unique-per-page prose — this is what keeps a page from reading as
  // thin/templated content to search engines. See lib/placeholder.ts.
  about?: string;
  campusInfo?: string;
  courses?: string[];
  contact?: ContactInfo;
  faqs?: FaqItem[];

  // 1-5, picks which visual layout renders this university's page. Leave
  // unset to auto-assign one based on the slug (see lib/templatePicker.ts)
  // so bulk-imported universities still come out visually varied.
  templateId?: number;

  links: {
    erp?: string;
    results?: string;
    syllabus?: string;
    admitCard?: string;
    feePayment?: string;
    admission?: string;
    officialSite?: string;
  };
  commonIssues: CommonIssue[];
  lastVerified: string; // ISO date string

  // CMS fields — optional here since most callers (templates, admin form)
  // don't need them; the public page checks these before rendering.
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  isDeleted?: boolean;

  // Optional overrides — when set, these win over the auto-generated
  // title/description in generateMetadata (app/university/[slug]/page.tsx).
  seo?: {
    title?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };

  // Per-link check results, written only by lib/linkChecker.ts. Admin-only
  // display data — never used to hide/gate a link on the public page.
  linkHealth?: Partial<
    Record<
      keyof University["links"],
      { ok: boolean; statusCode?: number; error?: string; checkedAt: string }
    >
  >;
}

export interface ArticleRelatedUniversity {
  slug: string;
  name: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt?: string;
  body: string;
  coverImage?: string;
  authorName: string;
  category?: string;
  tags: string[];
  relatedUniversities: ArticleRelatedUniversity[];
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  publishedAt?: string; // ISO date string
  seo?: {
    title?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  permissions: string[];
  assignedUniversities: ArticleRelatedUniversity[]; // {slug, name} pairs
  isActive: boolean;
  lastLogin?: string; // ISO date string
  createdAt: string;
}
