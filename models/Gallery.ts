import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IGalleryImage extends Document {
  university: Types.ObjectId;
  title?: string;
  imageUrl: string;
  caption?: string;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GallerySchema = new Schema<IGalleryImage>(
  {
    university: {
      type: Schema.Types.ObjectId,
      ref: "University",
      required: true,
      index: true,
    },
    title: String,
    imageUrl: { type: String, required: true },
    caption: String,
    order: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Gallery: Model<IGalleryImage> =
  mongoose.models.Gallery ||
  mongoose.model<IGalleryImage>("Gallery", GallerySchema);

export default Gallery;
