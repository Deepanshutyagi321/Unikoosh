import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import {
  CONTENT_SCOPES,
  PUBLISH_STATUSES,
  type ContentScope,
  type PublishStatus,
} from "./shared";

export interface IFaq extends Document {
  question: string;
  answer: string;
  scope: ContentScope;
  university?: Types.ObjectId; // required only when scope === UNIVERSITY_SPECIFIC
  category?: string;
  order: number;
  status: PublishStatus;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    scope: { type: String, enum: CONTENT_SCOPES, required: true },
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: function (this: IFaq) {
        return this.scope === "UNIVERSITY_SPECIFIC";
      },
    },
    category: String,
    order: { type: Number, default: 0 },
    status: { type: String, enum: PUBLISH_STATUSES, default: "DRAFT" },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

FaqSchema.index({ scope: 1, university: 1, order: 1 });

const Faq: Model<IFaq> = mongoose.models.Faq || mongoose.model<IFaq>("Faq", FaqSchema);

export default Faq;
