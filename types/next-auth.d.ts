import type { AdminRole, Permission } from "@/models/shared";

declare module "next-auth" {
  interface User {
    role: AdminRole;
    permissions: Permission[];
    assignedUniversities: string[];
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AdminRole;
      permissions: Permission[];
      assignedUniversities: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: AdminRole;
    permissions: Permission[];
    assignedUniversities: string[];
  }
}
