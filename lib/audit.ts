import connectDB from "@/lib/mongoose";
import AuditLog from "@/models/AuditLog";
import type { Types } from "mongoose";

export async function logAction(entry: {
  adminId?: string | Types.ObjectId;
  adminEmail: string;
  action: string;
  entityType?: string;
  entityId?: string | Types.ObjectId;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      admin: entry.adminId,
      adminEmail: entry.adminEmail,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      oldValues: entry.oldValues,
      newValues: entry.newValues,
      ipAddress: entry.ipAddress,
    });
  } catch (err) {
    // Audit logging must never break the actual operation it's logging —
    // log the failure to the server console and move on.
    console.error("Failed to write audit log:", err);
  }
}
