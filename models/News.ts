import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import { PUBLISH_STATUSES, type PublishStatus } from "./shared";

export interface INews extends Document {
  title: string;
  slug: string;
  body: string;
  coverImage?: string;
  university?: Types.ObjectId; // omitted = site-wide news
  status: PublishStatus;
  publishedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    body: { type: String, required: true },
    coverImage: String,
    university: { type: Schema.Types.ObjectId, ref: "University", index: true },
    status: { type: String, enum: PUBLISH_STATUSES, default: "DRAFT" },
    publishedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const News: Model<INews> =
  mongoose.models.News || mongoose.model<INews>("News", NewsSchema);

export default News;
