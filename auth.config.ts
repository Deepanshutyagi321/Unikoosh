import type { NextAuthConfig } from "next-auth";
import type { AdminRole, Permission } from "@/models/shared";

// Edge-safe Auth.js config: no database, mongoose, or bcrypt imports.
// proxy.ts runs in the edge runtime and builds its own NextAuth instance
// from this file only, so it can verify the JWT session cookie without
// pulling Node-only modules into the edge bundle. auth.ts extends this
// with the Credentials provider, which does need the database.
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
