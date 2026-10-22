"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface NavItem {
  label: string;
  href: string;
  soon?: boolean;
  superAdminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Universities", href: "/admin/universities" },
  { label: "Articles", href: "/admin/articles" },
  { label: "Courses", href: "#", soon: true },
  { label: "News & notices", href: "#", soon: true },
  { label: "Reviews", href: "#", soon: true },
  { label: "Global content", href: "#", soon: true },
  { label: "Admins", href: "/admin/admins", superAdminOnly: true },
  { label: "Audit logs", href: "#", soon: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  // Non-super-admins simply don't see SUPER_ADMIN-only items at all —
  // showing them as "Soon" would be misleading since it's not "soon" for
  // that role, it's permanent. The routes are also gated server-side
  // (proxy.ts + the route handlers), so hiding the link is a UX nicety,
  // not the actual security boundary.
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.superAdminOnly || isSuperAdmin
  );

  return (
    <nav className="w-48 shrink-0 border-r border-border">
      <ul className="space-y-0.5 py-2">
        {visibleItems.map((item) => {
          const isActive =
            item.href !== "#" &&
            (pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(item.href)));

          if (item.soon) {
            return (
              <li key={item.label}>
                <span className="flex items-center justify-between px-4 py-2 font-mono text-xs text-ink-soft/50">
                  {item.label}
                  <span className="rounded-full border border-border px-1.5 py-0.5 text-[0.6rem]">
                    Soon
                  </span>
                </span>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`focus-ring block px-4 py-2 font-mono text-xs uppercase tracking-wide ${
                  isActive
                    ? "border-l-2 border-maroon bg-paper-alt text-maroon"
                    : "border-l-2 border-transparent text-ink-soft hover:bg-paper-alt hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
