import {
  ADMIN_ROLES,
  PERMISSIONS,
  type AdminRole,
  type Permission,
} from "@/models/shared";

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS], // everything, always — never trimmed by admin edits
  ADMIN: [
    "UNIVERSITY_VIEW",
    "UNIVERSITY_EDIT",
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
  ],
  EDITOR: [
    "UNIVERSITY_VIEW",
    "COURSE_VIEW",
    "CONTENT_VIEW",
    "CONTENT_CREATE",
    "CONTENT_EDIT",
    "NEWS_MANAGE",
    "NOTICE_MANAGE",
    "FAQ_MANAGE",
    "GALLERY_MANAGE",
    "SEO_VIEW",
  ],
};

// Minimal shape needed for these checks — matches the NextAuth session
// user object (see types/next-auth.d.ts), not the full Mongoose document.
export interface AuthorizableAdmin {
  role: AdminRole;
  permissions: Permission[];
  assignedUniversities: string[]; // university ObjectId strings
}

export function hasPermission(
  admin: AuthorizableAdmin,
  permission: Permission
): boolean {
  if (admin.role === "SUPER_ADMIN") return true;
  return admin.permissions.includes(permission);
}

// Super Admin can access every university. Everyone else must be
// explicitly assigned. Always check this server-side — never trust a
// universityId sent from the client as proof of access.
export function canAccessUniversity(
  admin: AuthorizableAdmin,
  universityId: string
): boolean {
  if (admin.role === "SUPER_ADMIN") return true;
  return admin.assignedUniversities.includes(universityId);
}

export function isValidRole(value: string): value is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(value);
}
