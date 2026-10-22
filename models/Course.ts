import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import { RECORD_STATUSES, type RecordStatus } from "./shared";

export interface ICourse extends Document {
  university: Types.ObjectId;
  name: string;
  description?: string;
  duration?: string;
  fees?: string;
  eligibility?: string;
  status: RecordStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: String,
    duration: String,
    fees: String,
    eligibility: String,
    status: { type: String, enum: RECORD_STATUSES, default: "ACTIVE" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
