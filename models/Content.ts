import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import {
  CONTENT_SCOPES,
  PUBLISH_STATUSES,
  type ContentScope,
  type PublishStatus,
} from "./shared";

interface SeoFields {
  title?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface IContent extends Document {
  title: string;
  slug: string;
  body: string;
  category?: string; // e.g. "admission-guide", "scholarship-info" — groups reusable global pieces
  scope: ContentScope;
  university?: Types.ObjectId; // required only when scope === UNIVERSITY_SPECIFIC
  status: PublishStatus;
  publishedAt?: Date;
  seo?: SeoFields;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    body: { type: String, required: true },
    category: { type: String, trim: true },
    scope: { type: String, enum: CONTENT_SCOPES, required: true },
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: function (this: IContent) {
        return this.scope === "UNIVERSITY_SPECIFIC";
      },
    },
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

// A global content piece is looked up by category (e.g. "one Admission
// Guide shared everywhere"); university-specific pieces by university+slug.
ContentSchema.index({ scope: 1, category: 1 });
ContentSchema.index({ university: 1, slug: 1 });

const Content: Model<IContent> =
  mongoose.models.Content || mongoose.model<IContent>("Content", ContentSchema);

export default Content;
