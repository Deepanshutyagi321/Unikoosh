import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import { PUBLISH_STATUSES, type PublishStatus } from "./shared";

export interface INotice extends Document {
  title: string;
  body: string;
  university?: Types.ObjectId; // omitted = global notice
  important: boolean;
  expiresAt?: Date;
  status: PublishStatus;
  publishedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    university: { type: Schema.Types.ObjectId, ref: "University", index: true },
    important: { type: Boolean, default: false },
    expiresAt: Date,
    status: { type: String, enum: PUBLISH_STATUSES, default: "DRAFT" },
    publishedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const Notice: Model<INotice> =
  mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);

export default Notice;
