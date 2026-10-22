import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import { PUBLISH_STATUSES, type PublishStatus } from "./shared";

interface ImportantDate {
  label: string;
  date: Date;
}

export interface IAdmission extends Document {
  university: Types.ObjectId;
  title: string;
  body: string;
  importantDates: ImportantDate[];
  applicationDeadline?: Date;
  status: PublishStatus;
  publishedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdmissionSchema = new Schema<IAdmission>(
  {
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    importantDates: [
      {
        label: { type: String, required: true },
        date: { type: Date, required: true },
      },
    ],
    applicationDeadline: Date,
    status: { type: String, enum: PUBLISH_STATUSES, default: "DRAFT" },
    publishedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const Admission: Model<IAdmission> =
  mongoose.models.Admission ||
  mongoose.model<IAdmission>("Admission", AdmissionSchema);

export default Admission;
