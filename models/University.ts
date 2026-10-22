import mongoose, { Schema, type Document, type Model } from "mongoose";
import { RECORD_STATUSES, type RecordStatus } from "./shared";

interface UniversityLinks {
  officialSite?: string;
  erp?: string;
  results?: string;
  syllabus?: string;
  admitCard?: string;
  feePayment?: string;
  admission?: string;
}

interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
}

interface SeoFields {
  title?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

interface CommonIssue {
  title: string;
  fix: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

export interface LinkHealthEntry {
  ok: boolean;
  statusCode?: number;
  error?: string;
  checkedAt: Date;
}

export interface IUniversity extends Document {
  slug: string;
  name: string;
  shortName: string;
  state: string;
  type: string;
  studentCount?: string;
  establishedYear?: string;
  accreditation?: string;
  about?: string;
  campusInfo?: string;
  courses: string[];
  commonIssues: CommonIssue[];
  faqs: FaqItem[];
  templateId?: number;
  links: UniversityLinks;
  linkHealth?: Partial<Record<keyof UniversityLinks, LinkHealthEntry>>;
  contact?: ContactInfo;
  seo?: SeoFields;
  status: RecordStatus;
  isDeleted: boolean;
  deletedAt?: Date | null;
  lastVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UniversitySchema = new Schema<IUniversity>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    shortName: { type: String, trim: true },
    state: { type: String, trim: true },
    type: { type: String, trim: true },
    studentCount: String,
    establishedYear: String,
    accreditation: String,
    about: String,
    campusInfo: String,
    templateId: { type: Number, min: 1, max: 10 },
    courses: [{ type: String }],
    commonIssues: [
      {
        title: { type: String, required: true },
        fix: { type: String, required: true },
      },
    ],
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    links: {
      officialSite: String,
      erp: String,
      results: String,
      syllabus: String,
      admitCard: String,
      feePayment: String,
      admission: String,
    },
    // Keyed by the same link field names (erp, results, ...) — Mixed
    // because Mongoose doesn't have a clean way to type "one subdocument
    // per key of another field" statically. lib/linkChecker.ts is the
    // only writer; treat this as read-only status data elsewhere.
    linkHealth: { type: Schema.Types.Mixed, default: {} },
    contact: {
      address: String,
      phone: String,
      email: String,
    },
    seo: {
      title: String,
      metaDescription: String,
      canonicalUrl: String,
      ogTitle: String,
      ogDescription: String,
      ogImage: String,
    },
    status: { type: String, enum: RECORD_STATUSES, default: "ACTIVE" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    lastVerified: Date,
  },
  { timestamps: true }
);

UniversitySchema.index({ state: 1, type: 1 });
UniversitySchema.index({ name: "text", shortName: "text" });

const University: Model<IUniversity> =
  mongoose.models.University ||
  mongoose.model<IUniversity>("University", UniversitySchema);

export default University;
