import type { NextAuthConfig } from "next-auth";
import type { AdminRole, Permission } from "@/models/shared";

// Edge-safe slice of the Auth.js config. proxy.ts runs in the Edge
// runtime, so nothing here may import mongoose, bcrypt, or any DB code —
// it only needs to decode the JWT and map it onto the session. The
// Credentials provider (which hits MongoDB) lives in auth.ts, which is
// only ever loaded by Node.js route handlers and server components.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  providers: [],
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
} satisfies NextAuthConfig;
