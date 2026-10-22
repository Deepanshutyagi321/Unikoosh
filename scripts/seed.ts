// Run with: npm run seed
// Pushes data/universities.json into the University collection via
// Mongoose (this replaced the native-driver version once lib/data.ts
// migrated to Mongoose — same seed source file, different write path).
import { config } from "dotenv";
config({ path: ".env.local" }); // tsx doesn't auto-load .env.local like Next.js does

import { readFile } from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import connectDB from "../lib/mongoose";
import UniversityModel from "../models/University";
import type { University } from "../lib/types";

if (!process.env.MONGODB_URI) {
  console.error(
    "MONGODB_URI is not set — the whole app runs on Mongoose now, so this " +
      "is required even for local dev. See .env.example."
  );
  process.exit(1);
}

async function seed(): Promise<void> {
  await connectDB();

  const seedPath = path.join(process.cwd(), "data", "universities.json");
  const raw = await readFile(seedPath, "utf-8");
  const universities: University[] = JSON.parse(raw);

  for (const uni of universities) {
    await UniversityModel.findOneAndUpdate(
      { slug: uni.slug },
      { $set: uni },
      { upsert: true, setDefaultsOnInsert: true }
    );
    console.log(`Upserted ${uni.slug}`);
  }

  console.log(
    `\nDone. ${universities.length} universities seeded.\n` +
      "Reminder: the seed data's deep links and content fields are " +
      'placeholders ("PLACEHOLDER_VERIFY") — replace them with real, ' +
      "verified information via /admin before publishing."
  );

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
