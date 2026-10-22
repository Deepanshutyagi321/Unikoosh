import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export type ReviewStatus = "PENDING_REVIEW" | "PUBLISHED" | "REJECTED";

export interface IReview extends Document {
  university: Types.ObjectId;
  authorName: string;
  rating: number; // 1-5
  comment?: string;
  status: ReviewStatus;
  moderatedBy?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },
    authorName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    status: {
      type: String,
      enum: ["PENDING_REVIEW", "PUBLISHED", "REJECTED"],
      default: "PENDING_REVIEW",
    },
    moderatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
