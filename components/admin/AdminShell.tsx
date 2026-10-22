"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // The login page has nothing to navigate to yet — no sidebar/topbar there.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <span className="font-display text-sm font-medium text-ink">
            UniLinks Admin
          </span>
          {session?.user && (
            <div className="flex items-center gap-3 font-mono text-xs text-ink-soft">
              <span>
                {session.user.email} ·{" "}
                <span className="text-navy">{session.user.role}</span>
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="focus-ring rounded-sm border border-border px-2.5 py-1 uppercase text-maroon"
              >
                Sign out
              </button>
            </div>
          )}
        </header>
        <div className="px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
