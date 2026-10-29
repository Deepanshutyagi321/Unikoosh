import type { NextAuthConfig } from "next-auth";
import type { AdminRole, Permission } from "@/models/shared";

// Edge-safe slice of the NextAuth config. proxy.ts imports this (not
// auth.ts) so the middleware bundle never pulls in mongoose, bcrypt or
// any model code. The Credentials provider with DB access lives in auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
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
} satisfies NextAuthConfig;
