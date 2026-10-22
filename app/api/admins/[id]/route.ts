import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAdminById, updateAdmin, deleteAdmin, countSuperAdmins } from "@/lib/admins";
import { logAction } from "@/lib/audit";
import { isValidRole } from "@/lib/permissions";

type RouteParams = Promise<{ id: string }>;

async function requireSuperAdmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return { session: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}

export async function GET(_req: NextRequest, { params }: { params: RouteParams }) {
  const { session, response } = await requireSuperAdmin();
  if (!session) return response;

  const { id } = await params;
  const admin = await getAdminById(id);
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(admin);
}

export async function PUT(req: NextRequest, { params }: { params: RouteParams }) {
  const { session, response } = await requireSuperAdmin();
  if (!session) return response;

  const { id } = await params;
  const existing = await getAdminById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { role, assignedUniversitySlugs, isActive, newPassword } = body;

  if (!isValidRole(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  if (newPassword && newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 }
    );
  }

  // Can't demote or deactivate the last active Super Admin — that would
  // lock everyone out of admin management with no way back in short of
  // touching the database directly.
  const isDemotingOrDeactivating =
    existing.role === "SUPER_ADMIN" && (role !== "SUPER_ADMIN" || !isActive);
  if (isDemotingOrDeactivating) {
    const superAdminCount = await countSuperAdmins();
    if (superAdminCount <= 1) {
      return NextResponse.json(
        {
          error:
            "Can't demote or deactivate the last active Super Admin. Promote another admin first.",
        },
        { status: 400 }
      );
    }
  }

  const updated = await updateAdmin(id, {
    role,
    assignedUniversitySlugs: assignedUniversitySlugs ?? [],
    isActive: Boolean(isActive),
    newPassword: newPassword || undefined,
  });

  await logAction({
    adminId: session.user.id,
    adminEmail: session.user.email,
    action: "ADMIN_UPDATE",
    entityType: "Admin",
    entityId: id,
    oldValues: { role: existing.role, isActive: existing.isActive },
    newValues: { role, isActive: Boolean(isActive), passwordReset: Boolean(newPassword) },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: RouteParams }) {
  const { session, response } = await requireSuperAdmin();
  if (!session) return response;

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You can't delete your own account while signed in as it." },
      { status: 400 }
    );
  }

  const existing = await getAdminById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.role === "SUPER_ADMIN") {
    const superAdminCount = await countSuperAdmins();
    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: "Can't delete the last active Super Admin." },
        { status: 400 }
      );
    }
  }

  await deleteAdmin(id);

  await logAction({
    adminId: session.user.id,
    adminEmail: session.user.email,
    action: "ADMIN_DELETE",
    entityType: "Admin",
    entityId: id,
    oldValues: { email: existing.email, role: existing.role },
  });

  return NextResponse.json({ ok: true });
}
