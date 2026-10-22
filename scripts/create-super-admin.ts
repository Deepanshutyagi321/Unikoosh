// Run with: npm run create-super-admin
// Interactive — prompts for email/name/password, never accepts them as
// plain CLI args (which would leak into shell history).
import { config } from "dotenv";
config({ path: ".env.local" }); // tsx doesn't auto-load .env.local like Next.js does

import readline from "readline/promises";
import { stdin, stdout } from "process";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "../lib/mongoose";
import Admin from "../models/Admin";
import { ROLE_PERMISSIONS } from "../lib/permissions";

async function prompt(rl: readline.Interface, question: string): Promise<string> {
  const answer = await rl.question(question);
  return answer.trim();
}

// Basic hidden-input password prompt (masks with no echo where the
// terminal supports it; falls back to visible input otherwise — this is a
// setup script run once, not a general auth UI).
async function promptPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    stdout.write(question);
    const onData = (char: Buffer) => {
      const c = char.toString();
      if (c === "\n" || c === "\r" || c === "\u0004") {
        stdin.setRawMode?.(false);
        stdin.removeListener("data", onData);
        stdout.write("\n");
        resolve(password);
        return;
      }
      if (c === "\u0003") process.exit(1); // Ctrl+C
      if (c === "\u007f") {
        password = password.slice(0, -1);
        return;
      }
      password += c;
    };
    let password = "";
    stdin.resume();
    stdin.setRawMode?.(true);
    stdin.on("data", onData);
  });
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set — see .env.example.");
    process.exit(1);
  }

  await connectDB();

  const existingSuperAdmin = await Admin.findOne({ role: "SUPER_ADMIN" });
  if (existingSuperAdmin) {
    console.error(
      `A Super Admin already exists (${existingSuperAdmin.email}). ` +
        "This script only creates the first one, on purpose — refusing to " +
        "run again. Manage additional admins from /admin/admins instead."
    );
    process.exit(1);
  }

  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log("Creating the first Super Admin for this installation.\n");
  const name = await prompt(rl, "Name: ");
  const email = await prompt(rl, "Email: ");
  rl.close();

  if (!name || !email || !email.includes("@")) {
    console.error("A valid name and email are required.");
    process.exit(1);
  }

  const password = await promptPassword("Password (min 8 chars): ");
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }
  const confirm = await promptPassword("Confirm password: ");
  if (password !== confirm) {
    console.error("Passwords did not match.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await Admin.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "SUPER_ADMIN",
    permissions: ROLE_PERMISSIONS.SUPER_ADMIN,
    assignedUniversities: [],
    isActive: true,
  });

  console.log(`\nSuper Admin created: ${admin.email}`);
  console.log("Sign in at /admin/login.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Failed to create Super Admin:", err);
  process.exit(1);
});
