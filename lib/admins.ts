import bcrypt from "bcryptjs";
import connectDB from "./mongoose";
import AdminModel, { type IAdmin } from "@/models/Admin";
import UniversityModel from "@/models/University";
import { ROLE_PERMISSIONS } from "./permissions";
import type { AdminUser } from "./types";
import type { AdminRole, Permission } from "@/models/shared";
import type { Types } from "mongoose";

interface PopulatedUni {
  _id: Types.ObjectId;
  slug: string;
  name: string;
}

async function populateAssigned(doc: IAdmin): Promise<PopulatedUni[]> {
  if (!doc.assignedUniversities?.length) return [];
  return UniversityModel.find(
    { _id: { $in: doc.assignedUniversities } },
    { slug: 1, name: 1 }
  ).lean<PopulatedUni[]>();
}

function toAdminUser(doc: IAdmin, assignedUnis: PopulatedUni[]): AdminUser {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    role: doc.role,
    permissions: doc.permissions ?? [],
    assignedUniversities: assignedUnis.map((u) => ({
      slug: u.slug,
      name: u.name,
    })),
    isActive: doc.isActive,
    lastLogin: doc.lastLogin ? new Date(doc.lastLogin).toISOString() : undefined,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export async function getAllAdmins(): Promise<AdminUser[]> {
  await connectDB();
  // No .select('+passwordHash') — the hash never leaves this layer.
  const docs = await AdminModel.find({}).sort({ createdAt: 1 }).lean<IAdmin[]>();
  return Promise.all(
    docs.map(async (doc) => toAdminUser(doc, await populateAssigned(doc)))
  );
}

export async function getAdminById(id: string): Promise<AdminUser | null> {
  await connectDB();
  const doc = await AdminModel.findById(id).lean<IAdmin | null>();
  if (!doc) return null;
  return toAdminUser(doc, await populateAssigned(doc));
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  assignedUniversitySlugs: string[];
  createdBy: string;
}

export async function createAdmin(input: CreateAdminInput): Promise<AdminUser> {
  await connectDB();

  const assignedUnis = input.assignedUniversitySlugs.length
    ? await UniversityModel.find(
        { slug: { $in: input.assignedUniversitySlugs } },
        { _id: 1 }
      ).lean<{ _id: Types.ObjectId }[]>()
    : [];

  const passwordHash = await bcrypt.hash(input.password, 12);

  const doc = await AdminModel.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    role: input.role,
    permissions: ROLE_PERMISSIONS[input.role],
    assignedUniversities: assignedUnis.map((u) => u._id),
    isActive: true,
    createdBy: input.createdBy,
  });

  return toAdminUser(doc, await populateAssigned(doc));
}

export interface UpdateAdminInput {
  role: AdminRole;
  assignedUniversitySlugs: string[];
  isActive: boolean;
  newPassword?: string; // present only when resetting the password
}

export async function updateAdmin(
  id: string,
  input: UpdateAdminInput
): Promise<AdminUser | null> {
  await connectDB();

  const assignedUnis = input.assignedUniversitySlugs.length
    ? await UniversityModel.find(
        { slug: { $in: input.assignedUniversitySlugs } },
        { _id: 1 }
      ).lean<{ _id: Types.ObjectId }[]>()
    : [];

  const update: Record<string, unknown> = {
    role: input.role,
    permissions: ROLE_PERMISSIONS[input.role],
    assignedUniversities: assignedUnis.map((u) => u._id),
    isActive: input.isActive,
  };
  if (input.newPassword) {
    update.passwordHash = await bcrypt.hash(input.newPassword, 12);
  }

  const doc = await AdminModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean<IAdmin | null>();
  if (!doc) return null;
  return toAdminUser(doc, await populateAssigned(doc));
}

export async function deleteAdmin(id: string): Promise<void> {
  await connectDB();
  await AdminModel.findByIdAndDelete(id);
}

export async function countSuperAdmins(): Promise<number> {
  await connectDB();
  return AdminModel.countDocuments({ role: "SUPER_ADMIN", isActive: true });
}

export function defaultPermissionsFor(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}
