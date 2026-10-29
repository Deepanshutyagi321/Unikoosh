import type { NextAuthConfig } from "next-auth";
import type { AdminRole, Permission } from "@/models/shared";

// Edge-safe slice of the Auth.js config — no database, bcrypt or mongoose
// imports. proxy.ts runs as Netlify edge middleware and can only load this;
// auth.ts extends it with the Credentials provider that talks to MongoDB.
export const authConfig = {
  session: { strategy: "jwt" },
  // Auth.js only auto-trusts the Host header on Vercel/Cloudflare or when
  // AUTH_URL is set — NEXTAUTH_URL alone doesn't count. On Netlify every
  // /api/auth/* request would otherwise fail with "UntrustedHost" (500).
  trustHost: true,
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
