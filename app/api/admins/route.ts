import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAllAdmins, createAdmin } from "@/lib/admins";
import { logAction } from "@/lib/audit";
import { isValidRole } from "@/lib/permissions";

// Gated by proxy.ts (SUPER_ADMIN_ONLY_PREFIXES), but re-checked here too —
// proxy.ts is a first line of defense, not the only one.
async function requireSuperAdmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return { session: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}

export async function GET() {
  const { session, response } = await requireSuperAdmin();
  if (!session) return response;

  const admins = await getAllAdmins();
  return NextResponse.json(admins);
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireSuperAdmin();
  if (!session) return response;

  const body = await req.json();
  const { name, email, password, role, assignedUniversitySlugs } = body;

  if (!name?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json(
      { error: "name, email, password, and role are required." },
      { status: 400 }
    );
  }
  if (!isValidRole(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  try {
    const admin = await createAdmin({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      assignedUniversitySlugs: assignedUniversitySlugs ?? [],
      createdBy: session.user.id,
    });

    await logAction({
      adminId: session.user.id,
      adminEmail: session.user.email,
      action: "ADMIN_CREATE",
      entityType: "Admin",
      entityId: admin.id,
      newValues: { email: admin.email, role: admin.role },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (err: unknown) {
    const isDuplicateEmail =
      typeof err === "object" && err !== null && "code" in err && err.code === 11000;
    if (isDuplicateEmail) {
      return NextResponse.json(
        { error: "An admin with that email already exists." },
        { status: 409 }
      );
    }
    throw err;
  }
}
