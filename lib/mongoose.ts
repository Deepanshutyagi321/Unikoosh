import mongoose from "mongoose";

// Cache the connection across hot-reloads (dev) and serverless invocations
// (prod) instead of opening a new connection per request.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
};
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  // Read lazily, not at module load time — the standalone scripts
  // (scripts/seed.ts, etc.) call dotenv's config() before connectDB() is
  // ever invoked, but ES module import evaluation order means a
  // module-top-level read here could run before that config() call does,
  // depending on where this module sits in the import graph. Reading
  // inside the function guarantees dotenv has already run by the time
  // this executes, regardless of import order.
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. The CMS layer (models, admin auth, audit " +
        "logs) requires a real MongoDB connection — see .env.example."
    );
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export default connectDB;
