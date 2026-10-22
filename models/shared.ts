// Shared across models so every "content" collection (Content, News,
// Notice, Event, FAQ, Admission) uses the exact same publishing workflow
// states — DRAFT → PENDING_REVIEW → PUBLISHED, per the CMS spec.
export const PUBLISH_STATUSES = ["DRAFT", "PENDING_REVIEW", "PUBLISHED"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const CONTENT_SCOPES = ["GLOBAL", "UNIVERSITY_SPECIFIC"] as const;
export type ContentScope = (typeof CONTENT_SCOPES)[number];

export const RECORD_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

// Granular permissions (spec section 6). Roles map to a default permission
// set at creation time (see lib/permissions.ts), but permissions are what
// server-side checks actually test against — not the role string directly.
export const PERMISSIONS = [
  "UNIVERSITY_VIEW",
  "UNIVERSITY_CREATE",
  "UNIVERSITY_EDIT",
  "UNIVERSITY_DELETE",
  "COURSE_VIEW",
  "COURSE_CREATE",
  "COURSE_EDIT",
  "COURSE_DELETE",
  "CONTENT_VIEW",
  "CONTENT_CREATE",
  "CONTENT_EDIT",
  "CONTENT_PUBLISH",
  "NEWS_MANAGE",
  "NOTICE_MANAGE",
  "REVIEW_MANAGE",
  "FAQ_MANAGE",
  "GALLERY_MANAGE",
  "SEO_VIEW",
  "SEO_EDIT",
  "ADMIN_VIEW",
  "ADMIN_CREATE",
  "ADMIN_EDIT",
  "ADMIN_DELETE",
  "AUDIT_LOG_VIEW",
] as const;
export type Permission = (typeof PERMISSIONS)[number];
