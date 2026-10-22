import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IAuditLog extends Document {
  admin?: Types.ObjectId; // absent for failed logins where we don't yet know who
  adminEmail: string; // denormalized snapshot — stays readable even if the admin is later deleted
  action: string; // e.g. "LOGIN_SUCCESS", "LOGIN_FAILED", "UNIVERSITY_UPDATE"
  entityType?: string; // e.g. "University", "Admin", "Content"
  entityId?: Types.ObjectId;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: "Admin" },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entityType: String,
    entityId: Schema.Types.ObjectId,
    oldValues: Schema.Types.Mixed,
    newValues: Schema.Types.Mixed,
    ipAddress: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
