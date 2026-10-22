import mongoose, { Schema, type Document, type Model, Types } from "mongoose";
import { PUBLISH_STATUSES, type PublishStatus } from "./shared";

export interface IEvent extends Document {
  title: string;
  description?: string;
  university?: Types.ObjectId; // omitted = general/site-wide event
  startDate: Date;
  endDate?: Date;
  location?: string;
  status: PublishStatus;
  publishedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    university: { type: Schema.Types.ObjectId, ref: "University", index: true },
    startDate: { type: Date, required: true },
    endDate: Date,
    location: String,
    status: { type: String, enum: PUBLISH_STATUSES, default: "DRAFT" },
    publishedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
