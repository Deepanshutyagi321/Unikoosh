import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import { PUBLISH_STATUSES, type PublishStatus } from "./shared";

interface SeoFields {
  title?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  coverImage?: string;
  authorName: string;
  category?: string;
  tags: string[];
  relatedUniversities: Types.ObjectId[];
  status: PublishStatus;
  publishedAt?: Date;
  seo?: SeoFields;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: { type: String, trim: true },
    body: { type: String, required: true },
    coverImage: String,
    authorName: { type: String, required: true, trim: true },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    relatedUniversities: [{ type: Schema.Types.ObjectId, ref: "University" }],
    status: { type: String, enum: PUBLISH_STATUSES, default: "DRAFT" },
    publishedAt: Date,
    seo: {
      title: String,
      metaDescription: String,
      ogImage: String,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ title: "text", excerpt: "text", body: "text" });

const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
