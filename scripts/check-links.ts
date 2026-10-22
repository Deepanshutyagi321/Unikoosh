// Run with: npm run check-links
// Intended to run on a schedule (GitHub Actions cron, Vercel Cron Jobs,
// etc.) against production MONGODB_URI — not meant to be triggered from
// the browser, since checking every university's links can take minutes
// and would exceed a serverless function's timeout. The admin UI's
// per-university "Check links" button hits a scoped API route instead
// (app/api/universities/[slug]/check-links/route.ts) for that reason.
import { config } from "dotenv";
import mongoose from "mongoose";
import connectDB from "../lib/mongoose";
import UniversityModel from "../models/University";
import { checkUniversityLinks } from "../lib/linkChecker";

config({ path: ".env.local" });

const CONCURRENCY = 5; // universities checked in parallel at a time

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set — see .env.example.");
  process.exit(1);
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  let index = 0;
  async function next(): Promise<void> {
    const current = index++;
    if (current >= items.length) return;
    await worker(items[current]);
    await next();
  }
  await Promise.all(Array.from({ length: limit }, () => next()));
}

async function main() {
  await connectDB();

  const universities = await UniversityModel.find(
    { isDeleted: false },
    { slug: 1, name: 1, links: 1 }
  ).lean();

  console.log(`Checking links for ${universities.length} universities...\n`);

  let brokenCount = 0;
  let checkedCount = 0;

  await runWithConcurrency(universities, CONCURRENCY, async (uni) => {
    const results = await checkUniversityLinks(uni.links ?? {});
    const set: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(results)) {
      set[`linkHealth.${key}`] = value;
      checkedCount++;
      if (!value.ok) {
        brokenCount++;
        console.log(`  BROKEN  ${uni.slug} -> ${key} (${value.error ?? value.statusCode})`);
      }
    }
    if (Object.keys(set).length > 0) {
      await UniversityModel.updateOne({ _id: uni._id }, { $set: set });
    }
  });

  console.log(
    `\nDone. ${checkedCount} links checked across ${universities.length} universities, ${brokenCount} broken.`
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Link check failed:", err);
  process.exit(1);
});
