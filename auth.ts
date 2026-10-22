import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongoose";
import Admin from "@/models/Admin";
import { logAction } from "@/lib/audit";
import { ROLE_PERMISSIONS } from "@/lib/permissions";
import type { AdminRole, Permission } from "@/models/shared";

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        await connectDB();
        const admin = await Admin.findOne({ email: email.toLowerCase() }).select(
          "+passwordHash"
        );

        if (!admin || !admin.isActive) {
          await logAction({
            adminEmail: email,
            action: "LOGIN_FAILED",
            newValues: { reason: !admin ? "no_such_admin" : "inactive" },
          });
          return null;
        }

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) {
          await logAction({
            adminId: admin.id,
            adminEmail: admin.email,
            action: "LOGIN_FAILED",
            newValues: { reason: "bad_password" },
          });
          return null;
        }

        admin.lastLogin = new Date();
        await admin.save();
        await logAction({
          adminId: admin.id,
          adminEmail: admin.email,
          action: "LOGIN_SUCCESS",
        });

        // Permissions come from the role's default set at login time, not
        // stored per-token forever — if ROLE_PERMISSIONS changes, every
        // admin's effective permissions update on next login without a
        // data migration. SUPER_ADMIN always gets every permission.
        const permissions: Permission[] =
          admin.role === "SUPER_ADMIN"
            ? ROLE_PERMISSIONS.SUPER_ADMIN
            : admin.permissions.length > 0
              ? admin.permissions
              : ROLE_PERMISSIONS[admin.role as AdminRole];

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          permissions,
          assignedUniversities: admin.assignedUniversities.map((id) =>
            id.toString()
          ),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.assignedUniversities = user.assignedUniversities;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AdminRole;
        session.user.permissions = token.permissions as Permission[];
        session.user.assignedUniversities =
          token.assignedUniversities as string[];
      }
      return session;
    },
  },
});
