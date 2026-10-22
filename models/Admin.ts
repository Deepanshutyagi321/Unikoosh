import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import { ADMIN_ROLES, PERMISSIONS, type AdminRole, type Permission } from "./shared";

export interface IAdmin extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  permissions: Permission[];
  assignedUniversities: Types.ObjectId[];
  isActive: boolean;
  lastLogin?: Date;
  createdBy?: Types.ObjectId; // which admin created this one — null for the initial super admin
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false — never returned by a default query. Must opt in with
    // .select('+passwordHash'), which only the login authorize() call does.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ADMIN_ROLES, required: true, default: "EDITOR" },
    permissions: [{ type: String, enum: PERMISSIONS }],
    assignedUniversities: [{ type: Schema.Types.ObjectId, ref: "University" }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema);

export default Admin;
